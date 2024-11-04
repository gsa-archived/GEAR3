import { APP_BASE_HREF } from '@angular/common';
import { CommonEngine } from '@angular/ssr';
import express from 'express';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import AppServerModule from './src/main.server';
import bodyParser from 'body-parser';
import cors from 'cors';
import fs from 'fs';
import http from 'http';
import jsonwebtoken from 'jsonwebtoken';
import jwt from 'express-jwt';
import mysql from 'mysql2';
import passport from 'passport';
import passportJWT from "passport-jwt";
import * as dbjs from "./api/db.js";
import passportsaml, { SamlConfig } from '@node-saml/passport-saml';
import api from './api/index';
import CryptoJS from "crypto-js";
import { AddressInfo } from 'net';

const dbCredentials = dbjs.dbCredentials;
const SAMLStrategy = passportsaml.Strategy;
const port = process.env.PORT || 3000;
const ExtractJWT = passportJWT.ExtractJwt;
const JWTStrategy = passportJWT.Strategy;

/********************************************************************
PASSPORT BEGIN
 TODO: MOVE PASSPORT STUFF TO ITS OWN FILE
********************************************************************/
const samlConfig = {
  protocol: process.env.SAML_PROTOCOL,
  host: process.env.SAML_HOST,
  port: process.env.SAML_PORT,
  path: process.env.SAML_PATH,
  entryPoint: process.env.SAML_ENTRY_POINT,
  issuer: process.env.SAML_ISSUER,
  cert: process.env.SAML_CERT,
  acceptedClockSkewMs: -1,
  wantAuthnResponseSigned: false,
  audience: false,
};

// Receives SAML user data
passport.serializeUser(function (user, done) {
  done(null, user);
});
passport.deserializeUser(function (user, done) {
  done(null, user);
});

// PASSPORT SAML STRATEGY
passport.use(new SAMLStrategy(samlConfig as SamlConfig, (req, secureAuthProfile, cb) => {
  return cb(null, secureAuthProfile);
},  
(req, secureAuthProfile, done) => {
  return done(null, secureAuthProfile);
}));

// PASSPORT JWT STRATEGY
/*
passport.use(new JWTStrategy({
  jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.SECRET
},
  function (jwtPayload, cb) {
    return cb(null, jwtPayload);
  }
));
*/

export function app(): express.Express {
  const server = express()
  .use(cors())
  .use(bodyParser.json({ limit: '50mb' }))
  .use(bodyParser.urlencoded({ limit: '50mb', extended: true }))
  .use(passport.initialize())
  //.use(express.static(path.join(__dirname, 'public')))
  .enable('trust proxy');  // For expressJS to know we're behind a proxy when deployed

  const serverDistFolder = dirname(fileURLToPath(import.meta.url));
  const browserDistFolder = resolve(serverDistFolder, '../browser');
  const indexHtml = join(serverDistFolder, 'index.server.html');

  const commonEngine = new CommonEngine();

  server.set('view engine', 'html');
  server.set('views', browserDistFolder);

  // Example Express Rest API endpoints
  // server.get('/api/**', (req, res) => { });
  server.use('/api', api);

  // Serve static files from /browser
  server.get('**', express.static(browserDistFolder, {
    maxAge: '1y',
    index: 'index.html',
  }));

  // All regular routes use the Angular engine
  server.get('**', (req, res, next) => {
    const { protocol, originalUrl, baseUrl, headers } = req;

    commonEngine
      .render({
        bootstrap: AppServerModule,
        documentFilePath: indexHtml,
        url: `${protocol}://${headers.host}${originalUrl}`,
        publicPath: browserDistFolder,
        providers: [{ provide: APP_BASE_HREF, useValue: baseUrl }],
      })
      .then((html) => res.send(html))
      .catch((err) => next(err));
  });

  /********************************************************************
PASSPORT ROUTES
********************************************************************/

/********************************************************************
1. AUTH ENTRY POINT (STARTS WITH A SAML ASSERTION)
********************************************************************/
server.get('/beginAuth', passport.authenticate('saml'), (req, res) => {
  console.log('beginAuth');
  // TODO: is this saml-protected route still necessary? or can we
  // change the client src to use /admin (no-hash) instead? Perhaps
  // it's needed while running the React app in dev b/c its proxy.
  const html =
    `
<html>
<body>
  <script>
    localStorage.samlEntryPoint = '${process.env.SAML_ENTRY_POINT}';
  </script>
</body>
</html>
`
  res.send(html);
});
/********************************************************************
2. JWT ENTRY POINT & VERIFICATION (depends on SAML for user ID)
TODO: is this actually used by the admin app? or is it a dev tool?
********************************************************************/
server.get('/verify',
  (req, res, next) => {
    const headers = req.headers;
    // get ALL cookie from the request
    const pairs = String(headers.cookie).split(';');
    const cookies:{[key: string]: any} = {};
    // parse the cookies into an object
    for (let i = 0; i < pairs.length; i++) {
      const pair = pairs[i].split('=');
      cookies[(pair[0] + '').trim()] = unescape(pair.slice(1).join('='));
    }
    //console.log('cookies = ', cookies); // debug
    // get the GSAGEARManUN cookie value
    const userName = cookies.GSAGEARManUN;
    // get the GSAGEARAPIT cookie value
    const apiToken = cookies.GSAGEARAPIT;
    if (apiToken) {
      const query = `select count(*) as cnt from gear_acl.logins where email = '${userName}' and jwt = '${apiToken}' and date_add(expireDate, interval 1 day) > now();`;
      // query the database for the api token
      const db = mysql.createConnection(dbCredentials);
      db.connect();
      //console.log('query = ', query); // debug
      db.query(query,
        (err, results, fields) => {
          if (err) {
            // send the error to the client
            res.status(500).json({ message: err });
          } else {
            if (results[0].cnt === 1) {
              // send the response with the cookies
              res.status(200).json(cookies);
            } else {
              //console.log('cnt = ', results[0].cnt); // debug
              // send the response with no cookies
              res.status(401).json({ message: 'invalid token' });
            }
          }
        }
      );
    } else {
      // send empty response
      res.status(200).json({ message: 'no credentials found' });
    }
  }
);
server.post('/logout', (req, res) => {
  const headers = req.headers;
  // remove ALL cookies from the response
  const pairs = String(headers.cookie).split(';');
  const cookies:{[key: string]: any} = {};
  // parse the cookies into an object
  for (let i = 0; i < pairs.length; i++) {
    const pair = pairs[i].split('=');
    cookies[(pair[0] + '').trim()] = unescape(pair.slice(1).join('='));
  }
  // get the GSAGEARManUN cookie value
  const userName = cookies.GSAGEARManUN;
  // remove ALL cookies from the response
  for (let cookie in cookies) {
    res.clearCookie(cookie);
  }
  // log the logout to log.event
  const db = mysql.createConnection(dbCredentials);
  db.connect();
  db.query(`insert into gear_log.event (Event, User, DTG) values ('GEAR Manager - Logged Out', '${userName}', now());`);
  // send the response with no cookies
  res.status(200).json({ message: 'logged out' });
});
/********************************************************************
3. SAML IDENTITY PROVIDER (IdP) POST-BACK HANDLER (USES INLINE HTML)
********************************************************************/
server.post(samlConfig.path,
  passport.authenticate('saml'),
  (req, res) => {
    const samlProfile = req.user as any;
    const db = mysql.createConnection(dbCredentials);
    db.connect();
    db.query(`CALL gear_acl.get_user_perms('${samlProfile.nameID}');`,
      (err, results, fields) => {
        if (err) {
          // log error returned by get_user_perms() to log.event
          db.query(`insert into gear_log.event (Event, User, DTG) values ('GEAR Manager - Login Error', '${samlProfile.nameID}', now());`);
          
          // send the error to the client
          res.status(500);
          res.json({ error: err });
        }
        else {
          let html = ``;
          let userLookupStatus = ``;

          if (results[0].length === 0) {
            // log user not found to log.event
            db.query(`insert into gear_log.event (Event, User, DTG) values ('GEAR Manager - Unable to Verify User', '${samlProfile.nameID}', now());`);
            
            userLookupStatus = `Unable to verify user, <strong>${samlProfile.nameID}</strong><br/><a href="${process.env.SAML_ENTRY_POINT}">TRY AGAIN</a>`;
            html = `<html><body style="font-family:sans-serif;"><p>${userLookupStatus}</p></body></html>`;
            res.status(401);
            res.send(html);
            return false;
          }

          // TODO: (1) DECIDE IF PAYLOAD IS TOO LARGE. (2) IF SO, ADD LOGIC TO QUERY PERMS AS NEEDED
          const jwt = {
            sub: samlProfile.nameID,
            un: results[0][0].Username,
            exp: Math.floor(Date.now() / 1000) + 60 * 60,
            scopes: results[0][0].PERMS,
            auditID: results[0][0].AuditID,
          };

          // sign and create the JWT token for GEAR Manager
          const token = jsonwebtoken.sign(jwt, process.env.SECRET);

          // create the key used to encrypt the API security token
          const key = process.env.SECRET + jwt.exp.toString();

          // encrypt and create the API security token
          const apiToken = CryptoJS.AES.encrypt(`${jwt.auditID}`, key);

          // set the JWT in the database
          db.query(`CALL gear_acl.setJwt ('${jwt.auditID}', '${apiToken}');`,
          (err) => {
            if (err) {
              console.log(err);
            }
          });

          // set the redirect path to the admin app root 
          let adminRoute = (process.env.SAML_HOST === 'localhost') ? 'http://localhost:3000' : '/#';

          // create the HTML to redirect to GEAR Manager
          html =
            `
<html>
  <body>
    <em>Redirecting to GEAR Manager...</em>
    <script>
      const path = localStorage.redirectPath || '';
      delete localStorage.redirectPath;
      localStorage.samlEntryPoint = '${process.env.SAML_ENTRY_POINT}';
      window.location.replace('${adminRoute}' + path);
    </script>
  </body>
</html>
`
          
          // Log GEAR Manager login
          db.query(`insert into gear_log.event (Event, User, DTG) values ('GEAR Manager - Successful Login', '${samlProfile.nameID}', now());`);

          // set the cookie expiration date
          let date = new Date();
          // set the cookie expiration date to 1 day after today
          date.setTime(date.getTime() + (1 * 24 * 60 * 60 * 1000)); // days * hours * minutes * seconds * milliseconds
          // set the cookie expiration date to 00:00:00
          date.setHours(0, 0, 0, 0);
          // get milliseconds from now to midnight
          let msToMidnight = date.getTime() - Date.now();

          // set the cookie options
          let cookieOptions:{[key: string]: any} = { httpOnly : true, maxAge : msToMidnight };

          // set the cookie in the browser
          if (process.env.SAML_HOST !== 'localhost') {
            cookieOptions.secure = true;
          }

          // divide the token into 2 cookies to avoid cookie size limit
          let token1 = token.substring(0, 2000);
          let token2 = token.substring(2000, token.length);

          // set the cookie in the browser
          res.cookie('GSAGEARManTK1', `"${token1}"`, cookieOptions); 
          res.cookie('GSAGEARManTK2', `"${token2}"`, cookieOptions);
          res.cookie('GSAGEARAPIT', `${apiToken}`, cookieOptions); 
          res.cookie('GSAGEARManUN', `${results[0][0].AuditID}`, cookieOptions); 
          res.cookie('samlEntryPoint', `${process.env.SAML_ENTRY_POINT}`, cookieOptions);
          
          // send the response
          res.send(html);
        }
      }
    );
  }
);

/*******************************************************************/
//  DONE WITH PASSPORT
/*******************************************************************/


  return server;
}

function run(): void {
/********************************************************************
START SERVER
********************************************************************/
const port = process.env['PORT'] || 4000;

  // Start up the Node server
  const server = http.createServer(app());

  server.listen(port, () => {
    console.log('Express server listening on port ' + (server.address() as AddressInfo).port);
  });

  server.on('error', onError);
  server.on('listening', onListening);

  /*
  * Event listener for HTTP server "error" event.
  */
  function onError(error) {
    if (error.syscall !== 'listen') {
      throw error;
    }

    var bind = typeof port === 'string'
      ? 'Pipe ' + port
      : 'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
      case 'EACCES':
        console.error(bind + ' requires elevated privileges');
        process.exit(1);
        break;
      case 'EADDRINUSE':
        console.error(bind + ' is already in use');
        process.exit(1);
        break;
      default:
        throw error;
    }
  }

  /*
  * Event listener for HTTP server "listening" event.
  */
  function onListening() {
    var addr = server.address();
    var bind = typeof addr === 'string'
      ? 'pipe ' + addr
      : 'port ' + addr.port;
    console.log('Listening on ' + bind);
  }
}

run();

/*
 * Function to get FISMA info from ServiceNow API
 * everyday at 20:00 Eastern Time
*/
import cron from 'node-cron';
import * as cronCtrl from "./api/controllers/cron.controller.js";

// -------------------------------------------------------------------------------------------------
// Function to load POC data every Wednesday at 5:00 AM ET from the csv file in scripts/pocs
const fastcsv = require("fast-csv");
const { consoleTestResultHandler } = require('tslint/lib/test.js');

cron.schedule(process.env.POC_CRON, () => { //PRODUCTION
  let stream = fs.createReadStream("scripts/pocs/GSA_Pocs.csv");
  let pocCsv = [];
  let csvStream = fastcsv
    .parse()
    .on("data", function (data) {
      pocCsv.push(data);
    })
    .on("end", function () {
      // remove the first line: header
      pocCsv.shift();

      // create a new connection to the database
      const db = mysql.createConnection(dbCredentials);

      db.connect(error => {
        if (error) {
          console.error(error);
        } else {
          let clearQuery =
            "DELETE FROM tmp_obj_ldap_poc";
          db.query(clearQuery, (error, response) => {
            console.log(error || 'Clear tmp_obj_ldap_poc records: ' + response);
          });
         
          let insertQuery =
            "REPLACE INTO tmp_obj_ldap_poc (SamAccountName, FirstName, LastName, Email, Phone, OrgCode, Position, EmployeeType, Enabled) VALUES ?";
          db.query(insertQuery, [pocCsv], (error, response) => {
            console.log(error || 'Insert into tmp_obj_ldap_poc: ' + response);
          });
         
          let upsertQuery =
            "INSERT INTO obj_ldap_poc (SamAccountName, FirstName, LastName, Email, Phone, OrgCode, Position, EmployeeType, Enabled) "
            + "SELECT t.SamAccountName, t.FirstName, t.LastName, t.Email, t.Phone, t.OrgCode, t.Position, t.EmployeeType, t.Enabled "
            + "FROM tmp_obj_ldap_poc t "
            + "ON DUPLICATE KEY UPDATE FirstName = VALUES(FirstName), LastName = VALUES(LastName),"
            + "Email = VALUES(Email), Phone = VALUES(Phone), OrgCode = VALUES(OrgCode),"
            + "Position = VALUES(Position), EmployeeType = VALUES(EmployeeType), Enabled = VALUES(Enabled) ";
          db.query(upsertQuery, (error, response) => {
            console.log(error || 'Insert into/update obj_ldap_poc: ' + response);
          });

          let updateQuery =
            "UPDATE obj_ldap_poc poc "
            + "SET Enabled = 'FALSE' "
            + "WHERE poc.SamAccountName NOT IN (SELECT SamAccountName FROM tmp_obj_ldap_poc)";
          db.query(updateQuery, (error, response) => {
            console.log(error || 'Update obj_ldap_poc to disable poc: ' + response);
          });

          let deleteQuery =
            "DELETE FROM obj_ldap_poc "
            + "WHERE Enabled = 'FALSE' "
            + "AND SamAccountName NOT IN (SELECT obj_ldap_SamAccountName FROM zk_technology_poc)";
          db.query(deleteQuery, (error, response) => {
            console.log(error || 'Delete obj_ldap_poc disabled records: ' + response);
          });

          let updateEndOfLifeQuery = "UPDATE obj_ldap_poc poc "
            + "SET EmployeeType = 'Separated' "
            + "WHERE poc.SamAccountName NOT IN (SELECT SamAccountName FROM tmp_obj_ldap_poc) AND Enabled = 'FALSE' AND poc.EmployeeType = '';"
            + "INSERT INTO `gear_schema`.`obj_ldap_poc` "
            + "(`SamAccountName`, `FirstName`, `LastName`, `Email`, `EmployeeType`, `Enabled`, `RISSO`) "
            + "VALUES ('AssistTechTeam', 'Assist', 'Tech Team', 'assisttechteam@gsa.gov', 'Group', 'True', '24');"; //Adding group account as part of CTO team request
          db.query(updateEndOfLifeQuery, (error, response) => {
            console.log(error || 'Update obj_ldap_poc to separate poc: ' + JSON.stringify(response));
          });
        }
      });
    });

  stream.pipe(csvStream);
});

// -------------------------------------------------------------------------------------------------
// CRON JOB: Google Sheets API - Update All Related Records (runs every weekday at 11:00 PM)
cron.schedule(process.env.RECORDS_CRON, () => { 
//cron.schedule('50 14 * * 1-5', () => { //DEBUGGING
  cronCtrl.runUpdateAllRelatedRecordsJob();
});

// -------------------------------------------------------------------------------------------------
// CRON JOB: Tech Catalog Daily Import
// (runs DAILY at 12:01 AM)
cron.schedule(process.env.TECH_CATALOG_CRON1, () => { 
  cronCtrl.runTechCatalogImportJob();
});

// (runs SUNDAY AFTERNOON at 2:01 PM)
cron.schedule(process.env.TECH_CATALOG_CRON2, () => { 
  cronCtrl.runTechCatalogImportJob();
});
// -------------------------------------------------------------------------------------------------

// CRON JOB: Touchpoints API - Update Websites (runs every day at 11:05 PM)
cron.schedule(process.env.TOUCHPOINTS_CRON, () => { 
  cronCtrl.runTouchpointImportJob();
});