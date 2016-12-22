
# `leadsauth-utils`

Provides grant-management utilities.

## Install

    npm install --save leadstec/leadsauth-utils

## `GrantManager`

* Can obtain a grant through the direct API using name/password.
* Can renew any token using a `refresh_token`.
* Validates grants/tokens.

## `Grant`

Embodies `access_token`, `refresh_token` and other handiness.

## `Token`

Embodies JSON Web Token bits and checking for roles.

