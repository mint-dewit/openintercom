# OpenCom

> an open source digital intercom system for live television broadcastst

## About

This project was created by [Balte de Wit](http://balte.nl) as his end project (Profiel Werkstuk) at (CSG Prins Maurits)[http://csgpm.nl]. This project's goal is to provide community based TV channels with a very powerful multi channel digital intercom system.

## Getting Started

Getting up and running is as easy as 1, 2, 3.

1. Make sure you have [NodeJS](https://nodejs.org/) and [npm](https://www.npmjs.com/) installed.
2. Install your dependencies
    
    ```
    cd path/to/OpenCom; npm install
    ```

3. Start your app
    
    ```
    npm start
    ```

4. Make sure you have [FreeSwitch](http://freeswitch.org/) installed.

5. Make sure NodeJS has read and write access to the FreeSwitch Directory configuration

6. Start FreeSwitch.

7. Go to https://[your-ip]:3030/setup?user=[admin-username]?password=[admin-password] to set up your admin user

8. Go to https://[your-ip]:7443 and validate the certificate, next go to https://[your-ip]:3030/admin.html or https://[your-ip]:3030 and you're good to go

## Changelog

__16.12.0__

- Initial set up on GitHub

__16.12.1__

- First actually working project, with many bugs still

## License

Copyright (c) 2016

Licensed under the [GPL-V3 license](LICENSE).
