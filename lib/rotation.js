'use strict';
const URL = require('url');
const http = require('http');
const https = require('https');
const jwkToPem = require('jwk-to-pem');

/**
 * Construct a Rotation instance
 *
 * @param {Config} config Config object.
 *
 * @constructor
 */
function Rotation (config) {
  this.realmUrl = config.realmUrl;
  this.minTimeBetweenJwksRequests = config.minTimeBetweenJwksRequests;
  this.jwks = [];
  this.lastTimeRequesTime = 0;
}

Rotation.prototype.retrieveJWKs = function retrieveJWKs (callback) {
  const url = this.realmUrl + '/protocol/openid-connect/certs';
  const options = URL.parse(url);
  options.method = 'GET';
  console.log(url);
  const promise = new Promise((resolve, reject) => {
    const req = getProtocol(options).request(options, (response) => {
      if (response.statusCode < 200 || response.statusCode >= 300) {
        return reject('Error fetching JWK Keys');
      }
      let json = '';
      response.on('data', (d) => json += d.toString());
      response.on('end', () => {
        const data = JSON.parse(json);
        console.log(data);
        if (data.error) reject(data);
        else resolve(data);
      });
    });
    req.end();
  });
  return nodeify(promise, callback);
};

Rotation.prototype.getJWK = function getJWK (kid) {
  let key = this.jwks.find((key) => { return key.kid === kid; });
  if (key) {
    return new Promise((resolve, reject) => {
      resolve(jwkToPem(key));
    });
  }
  var self = this;

    // check if we are allowed to send request
  var currentTime = new Date().getTime() / 1000;
  console.log(this.minTimeBetweenJwksRequests);
  if (currentTime > this.lastTimeRequesTime + this.minTimeBetweenJwksRequests) {
    return this.retrieveJWKs()
        .then(publicKeys => {
          self.lastTimeRequesTime = currentTime;
          self.jwks = publicKeys.keys;
          var convertedKey = jwkToPem(self.jwks.find((key) => { return key.kid === kid; }));
          return convertedKey;
        });
  } else {
    console.error('Not enough time elapsed since the last request, blocking the request');
  }
};

Rotation.prototype.clearCache = function clearCache () {
  this.jwks.length = 0;
};

const getProtocol = (opts) => {
  return opts.protocol === 'https:' ? https : http;
};

const nodeify = (promise, cb) => {
  if (typeof cb !== 'function') return promise;
  return promise.then((res) => cb(null, res)).catch((err) => cb(err));
};

module.exports = Rotation;
