#!/bin/bash

LA_REALM=nodejs-test
LA_CLIENT=confidential-client
LA_CLIENT_SECRET=62b8de48-672e-4287-bb1e-6af39aec045e
LA_SERVER=localhost:8080
LA_CONTEXT=auth

# Request Tokens for credentials
LA_RESPONSE=$( \
   curl -k -v -X POST \
        -H "Content-Type: application/x-www-form-urlencoded" \
        -d 'grant_type=client_credentials' \
        -d "client_id=$LA_CLIENT" \
        -d "client_secret=$LA_CLIENT_SECRET" \
        "http://$LA_SERVER/$LA_CONTEXT/realms/$LA_REALM/protocol/openid-connect/token" | jq .
)

LA_ACCESS_TOKEN=$(echo $LA_RESPONSE| jq -r .access_token)
LA_ID_TOKEN=$(echo $LA_RESPONSE| jq -r .id_token)
LA_REFRESH_TOKEN=$(echo $LA_RESPONSE| jq -r .refresh_token)

echo $LA_RESPONSE | jq .

## Introspect LeadsAuth Request Token
curl -k -v -X POST \
     -H "Content-Type: application/x-www-form-urlencoded" \
     -d "client_id=$LA_CLIENT" \
     -d "client_secret=$LA_CLIENT_SECRET" \
     -d "token=$LA_ACCESS_TOKEN" \
     "http://$LA_SERVER/$LA_CONTEXT/realms/$LA_REALM/protocol/openid-connect/token/introspect" | jq .