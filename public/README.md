# File structure

Most client libraries are found in js/lib 
Materialize CSS and fonts / google icons are found in css/* and fonts/*

## js/sessions.js

This file is a helper for js/vue-controls.js
This is useful because it mutes the session immediately when it is started. this is intended behaviour.

## js/vue-controls

This file contains all the logic that has to do with talking rights, and starting, muting and ending sessions

## js/client/feathers.js

This file contains all the client <> server interactions for the client. e.g. events, authentication etc.

## js/admin/feathers.js

This file contains all the client <> server interactions for the admin panel. e.g. events, authentication etc.

## js/admin/vue-admin.js

This file contains all the interactions between feathers and the interface.