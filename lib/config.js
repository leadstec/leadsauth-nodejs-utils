'use strict';

const path = require('path');
const fs = require('fs');

/**
 * Construct a configuration object.
 *
 * A configuration object may be constructed with either
 * a path to a `leadsauth.json` file (which defaults to
 * `$PWD/leadsauth.json` if not present, or with a configuration
 * object akin to what parsing `leadsauth.json` provides.
 *
 * @param {String|Object} config Configuration path or details.
 *
 * @constructor
 */
function Config (config) {
  if (!config) {
    config = path.join(process.cwd(), 'leadsauth.json');
  }

  if (typeof config === 'string') {
    this.loadConfiguration(config);
  } else {
    this.configure(config);
  }
}

/**
 * Load configuration from a path.
 *
 * @param {String} configPath Path to a `leadsauth.json` configuration.
 */
Config.prototype.loadConfiguration = function loadConfiguration (configPath) {
  const json = fs.readFileSync(configPath);
  const config = JSON.parse(json.toString());
  this.configure(config);
};

/**
 * Configure this `Config` object.
 *
 * This will set the internal configuration details.  The details
 * may come from a `leadsauth.json` formatted object (with names such
 * as `auth-server-url`) or from an existing `Config` object (using
 * names such as `authServerUrl`).
 *
 * @param {Object} config The configuration to instill.
 */
Config.prototype.configure = function configure (config) {
  /**
   * Tries to resolve environment variables in the given value in case it is of type "string", else the given value is returned.
   * Environment variable references look like: '${env.MY_ENVIRONMENT_VARIABLE}', optionally one can configure a fallback
   * if the referenced env variable is not present. E.g. '${env.NOT_SET:http://localhost:8080}' yields 'http://localhost:8080'.
   *
   * @param value
   * @returns {*}
   */
  function resolveValue (value) {
    if (typeof value !== 'string') {
      return value;
    }

    // "${env.MY_ENVIRONMENT_VARIABLE:http://localhost:8080}".replace(/\$\{env\.([^:]*):?(.*)?\}/,"$1--split--$2").split("--split--")
    let regex = /\$\{env\.([^:]*):?(.*)?\}/;

    // is this an environment variable reference with potential fallback?
    if (!regex.test(value)) {
      return value;
    }

    let tokens = value.replace(regex, '$1--split--$2').split('--split--');
    let envVar = tokens[0];
    let envVal = process.env[envVar];
    let fallbackVal = tokens[1];

    return envVal || fallbackVal;
  }

  /**
   * Realm ID
   * @type {String}
   */
  this.realm = resolveValue(config['realm'] || config.realm);

  /**
   * Client/Application ID
   * @type {String}
   */
  this.clientId = resolveValue(config.resource || config['client-id'] || config.clientId);

  /**
   * Client/Application secret
   * @type {String}
   */
  this.secret = resolveValue((config['credentials'] || {}).secret || config.secret);

  /**
   * If this is a public application or confidential.
   * @type {String}
   */
  this.public = resolveValue(config['public-client'] || config.public || false);

  /**
   * Authentication server URL
   * @type {String}
   */
  this.authServerUrl = resolveValue(config['auth-server-url'] || config['server-url'] || config.serverUrl || config.authServerUrl);

  /**
   * Root realm URL.
   * @type {String}
   */
  this.realmUrl = this.authServerUrl + '/realms/' + this.realm;

  /**
   * Root realm admin URL.
   * @type {String} */
  this.realmAdminUrl = this.authServerUrl + '/admin/realms/' + this.realm;

  /**
   * How many minutes before retrying getting the keys.
   * @type {Integer}
   */
  this.minTimeBetweenJwksRequests = config['min-time-between-jwks-requests'] || config.minTimeBetweenJwksRequests || 10;

  /**
   * If this is a Bearer Only application.
   * @type {Boolean}
   */
  this.bearerOnly = resolveValue(config['bearer-only'] || config.bearerOnly || false);
};

module.exports = Config;
