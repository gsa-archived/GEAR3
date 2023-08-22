var dotenv = require('dotenv').config();  // .env Credentials

const bodyParser = require('body-parser'),
  cors = require('cors'),
  express = require('express'),
  fs = require('fs'),

  http = require('http'),
  path = require('path'),

  dbCredentials = require("./api/db.js").dbCredentials,
  jsonwebtoken = require('jsonwebtoken'),
  jwt = require('express-jwt'),
  mysql = require('mysql2'),
  passport = require('passport'),
  passportJWT = require("passport-jwt"),
  SAMLStrategy = require('passport-saml').Strategy,

  api = require('./api/index'),

  port = process.env.PORT || 3000,

  ExtractJWT = passportJWT.ExtractJwt,
  JWTStrategy = passportJWT.Strategy;

  const CryptoJS = require("crypto-js")

// Proxy Settings for Google API to use
// process.env.HTTP_PROXY="http://patchproxyr13.gsa.gov:3128";
// process.env.http_proxy="http://patchproxyr13.gsa.gov:3128";
// process.env.https_proxy="http://patchproxyr13.gsa.gov:3128";
// process.env.HTTPS_PROXY="http://patchproxyr13.gsa.gov:3128";


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
};

// Receives SAML user data
passport.serializeUser(function (user, done) {
  done(null, user);
});
passport.deserializeUser(function (user, done) {
  done(null, user);
});

// PASSPORT SAML STRATEGY
passport.use(new SAMLStrategy(samlConfig, (secureAuthProfile, cb) => {
  return cb(null, secureAuthProfile);
}));

// PASSPORT JWT STRATEGY
passport.use(new JWTStrategy({
  jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.SECRET
},
  function (jwtPayload, cb) {
    return cb(null, jwtPayload);
  }
));


/********************************************************************
LOAD EXPRESSJS MIDDLEWARE
********************************************************************/
const app = express()
  .use(cors())
  .use(bodyParser.json({ limit: '50mb' }))
  .use(bodyParser.urlencoded({ limit: '50mb', extended: true }))
  .use(passport.initialize())
  .use(express.static(path.join(__dirname, 'public')))
  .enable('trust proxy');  // For expressJS to know we're behind a proxy when deployed


/********************************************************************
API Platform
********************************************************************/
app.use('/api', api);


/********************************************************************
REDIRECT ROOT TO GEAR "read only" (aka "angular") app
********************************************************************/
app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


/********************************************************************
PASSPORT ROUTES
********************************************************************/

/********************************************************************
1. AUTH ENTRY POINT (STARTS WITH A SAML ASSERTION)
********************************************************************/
app.get('/beginAuth', passport.authenticate('saml'), (req, res) => {
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
app.get('/verify',
  (req, res, next) => {
    passport.authenticate('jwt', function (err, user, info) {
      res.json(req.user);
    });
    // TODO: validate exp, structure etc. then pass along
  }
);
/********************************************************************
3. SAML IDENTITY PROVIDER (IdP) POST-BACK HANDLER (USES INLINE HTML)
********************************************************************/
app.post(samlConfig.path,
  passport.authenticate('saml'),
  (req, res) => {
    const samlProfile = req.user;
    const db = mysql.createConnection(dbCredentials);
    db.connect();
    db.query(`CALL acl.get_user_perms('${samlProfile.nameID}');`,
      (err, results, fields) => {
        if (err) {
          // log call return error
          let logData = {"message": "GEAR Manager - Login Error", "userId":`${samlProfile.nameID}`};
          logServerEvent(logData);
          
          res.status(500);
          res.json({ error: err });
        }
        else {
          let html = ``;
          let userLookupStatus = ``;

          if (results[0].length === 0) {
            // log no data returned
            let logData = {"message": "GEAR Manager - Unable to Verify User", "userId":`${samlProfile.nameID}`};
            logServerEvent(logData);
            
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

          // API TOKEN GENERATED HERE TO BE USED IN INLINE HTML PAGE NEXT
          const token = jsonwebtoken.sign(jwt, process.env.SECRET);
          //const key = "94a74618-f4d3-4970-ae71-5eb4bca410a9" + jwt.exp.toString();
          const key = process.env.SECRET + jwt.exp.toString();
          const encryptJWT = CryptoJS.AES.encrypt(`${jwt.auditID}`, key);

          db.query(`CALL acl.setJwt ('${jwt.auditID}', '${encryptJWT}');`,
          (err) => {
            if (err) {
              console.log(err);
            }
          });

          let adminRoute = (process.env.SAML_HOST === 'localhost') ? 'http://localhost:3000' : '/#';

          html =
            `
<html>
  <body>
    <em>Redirecting to GEAR Manager...</em>
    <script>
      const path = localStorage.redirectPath || '';
      delete localStorage.redirectPath;
      localStorage.jwt = '${token}';
      localStorage.apiToken = '${encryptJWT}';
      localStorage.user = '${results[0][0].AuditID}';
      localStorage.samlEntryPoint = '${process.env.SAML_ENTRY_POINT}';
      window.location.replace('${adminRoute}' + path);
    </script>
  </body>
</html>
`
          
          // Log GEAR Manager login
          let logData = {"message": "GEAR Manager - Successful Login", "userId":`${results[0][0].AuditID}`};
          logServerEvent(logData);

          res.send(html);
        }
      }
    );
  }
);

/*******************************************************************/
//  DONE WITH PASSPORT
/*******************************************************************/


/********************************************************************
START SERVER
********************************************************************/
const server = http.createServer(app);

server.listen(port, function () {
  console.log('Express server listening on port ' + server.address().port);
})
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

/*
 * Function to get FISMA info from ServiceNow API
 * everyday at 20:00 Eastern Time
*/
const request = require('request');
const cron = require('node-cron');
const fetch = require("node-fetch");
let base64 = require('base-64');
/* 
cron.schedule('0 20 * * *', () => {
  getData(fismaOptions.url);
});

const fismaOptions = {
  url: 'https://gsatest.servicenowservices.com/api/now/table/u_fisma_poc?sysparm_query=u_gear_idISNOTEMPTY&sysparm_fields=u_gear_id%2C%20u_responsible_sso%2C%20u_name%2C%20u_fed_or_con%2C%20u_fips199_impact_level%2C%20u_atoiato_date%2C%20u_ato_type%2C%20u_renewal_date%2C%20u_complete_assement_for_current_fy%2C%20u_pii%2C%20u_cloud_hosted%2C%20u_clound_server_provider%2C%20u_type_of_service%2C%20u_fisma_system_identifier%2C%20u_inactive_date%2C%20u_active%2C%20u_description%2C%20u_issm.name%2C%20u_issm.email%2C%20u_issm.phone%2C%20u_isso.name%2C%20u_isso.email%2C%20u_isso.phone%2C%20u_isso_2.name%2C%20u_isso_2.email%2C%20u_isso_2.phone%2C%20u_isso_3.name%2C%20u_isso_3.email%2C%20u_isso_3.phone%2C%20u_isso_4.name%2C%20u_isso_4.email%2C%20u_isso_4.phone%2C%20u_system_owner%20u_system_owner.email%2C%20u_system_owner.phone%2C%20u_contracting_officer_1%2C%20u_contracting_officer_1.email%2C%20u_contracting_officer_1.phone%2C%20u_contracting_officer_2%2C%20u_contracting_officer_2.email%2C%20u_contracting_officer_2.phone%2C%20u_contracting_officer_representative_1.name%2C%20u_contracting_officer_representative_1.email%2C%20u_contracting_officer_representative_1.phone%2C%20u_contracting_officer_representative_2.name%2C%20u_contracting_officer_representative_2.email%2C%20u_contracting_officer_representative_2.phone%2C%20u_primary_artifact_name%2C%20u_primary_artifact_url%2C%20u_goverment_wide_shared_service%2C%20u_systemlevel%2C%20u_fisma_reportable%2C%20u_authorizing_official.name%2C%20u_authorizing_official.email%2C%20u_authorizing_official.phone',
  auth: {
    username: process.env.FISMA_UN,
    password: process.env.FISMA_PW
  }
};

const getData = async url => {
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Basic ${base64.encode(`${fismaOptions.auth.username}:${fismaOptions.auth.password}`)}`
      }
    })
    var json = await response.json();
    putData(json.result);

  } catch (error) {
    console.log(error);
    return;
  }
};

const putData = async data => {
  try {
    const response = await fetch('http://localhost:3000/api/fisma/update', {
      method: 'PUT',
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    })
    var json = await response.json();
  } catch (error) {
    console.log(error);
  };
}; */

/*
 * Function to load POC data
 * every Monday at 07:00 Eastern Time
*/
const fastcsv = require("fast-csv");

cron.schedule('0 7 * * WED', () => {
  let stream = fs.createReadStream("./pocs/GSA_Pocs.csv");
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

      // open the connection
      db.connect(error => {
        if (error) {
          console.error(error);
        } else {
          let query =
            "REPLACE INTO obj_ldap_poc (SamAccountName, FirstName, LastName, Email, Phone, OrgCode, Position, EmployeeType) VALUES ?";
          db.query(query, [pocCsv], (error, response) => {
            console.log(error || response);
          });
        }
      });
    });

  stream.pipe(csvStream);
});

// Google API Pull to run every weekday at 2:00 AM
cron.schedule('0 2 * * 1-5', () => { //PRODUCTION
//cron.schedule('*/10 * * * 1-5', () => { //DEBUGGING
  try {
    console.log(getCurrentDatetime() + 'CRON JOB: Update All Related Records (runs every weekday at 2:00 AM) - Starting');
    
    let logData = {"message": "CRON JOB: Update All Related Records", "userId":"GearCronJ"};
    logServerEvent(logData);
    
    // run the fetch request to get the data from the Google Sheet
    putUpdateAllSystems("");
  } catch (error) {
    // log any errors
    console.log(getCurrentDatetime() + `: CRON JOB: Update All Related Records - An unexpected error occurred while running:  \n` + error);
  }
});

// called by Google API Pull
const putUpdateAllSystems = async data => {
  try {
    // run the fetch request to update all systems
    const response = await fetch(`${getAppURL()}/api/records/updateAllSystems`, {
      method: 'PUT',
      headers: {
        "Content-Type": "application/json",
        Authorization: "true",
        Requester: "gearCronJ"
      },
      body: data//JSON.stringify(data)
    });

    const responseJson = await response.json();
    console.log(getCurrentDatetime()+'CRON JOB: Update All Related Records (runs every weekday at 2:00 AM) - Finished')
  } catch (error) {
    // log any errors
    console.log(getCurrentDatetime()+error);

    let logData = {"message": "CRON JOB: Update All Related Records - Errored with " + json.stringify(error), "userId":"GearCronJ"};
    logServerEvent(logData);
  };
};

// logs an event on the server to the db
const logServerEvent = async data => {
  //console.log("logServerEvent ("+data.message+")")

  // create the data object to send to the server
  data = {type: 'log/error', message: data.message, user: data.userId};

  try {
    // run the fetch request to post the log event
    const response = await fetch(`${getAppURL()}/api/records/logEvent`, {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
        Authorization: "true",
      },
      body: JSON.stringify(data)
    });

    const responseJson = await response.json();
  } catch (error) {
    // log any errors
    console.log(getCurrentDatetime() + `: logServerEvent - An unexpected error occurred:  \n` + error);
  };
};

function getCurrentDatetime() {
  const currentDate = new Date();
  const datetimeString = currentDate.toISOString().slice(0, 19).replace('T', ' ') + ': ';
  return datetimeString;
}

function getAppURL () {
  if (process.env.ENVIRONMENT === 'production') {
    return 'https://ea.gsa.gov';
  } else if (process.env.ENVIRONMENT === 'staging') {
    return 'https://stage.ea.gsa.gov';
  } else if (process.env.ENVIRONMENT === 'development') {
    return 'https://dev1.ea.gsa.gov';
  } else {
    return 'http://localhost:3000';
  }
}