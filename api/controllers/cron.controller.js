const ctrl = require('./base.controller'),
  records = require('./records.controller'),
  techCatImport = require('./tech-catalog-import.controller'),
  cron = require('node-cron'),
  fs = require('fs'),
  path = require('path'),
  queryPath = '../queries/';
const jobUser = 'GearCronJ';

// -------------------------------------------------------------------------------------------------
// CRON JOB: Google Sheets API - Update All Related Records (runs every weekday at 2:00 AM)
cron.schedule('0 5 * * 1-5', () => { //PRODUCTION
  //cron.schedule('*/2 * * * 1-5', () => { //DEBUGGING
  const jobName = `CRON JOB: Update All Related Records`;
  let status = 'executed';

  try {

    let res = {};
    
    // log start of job
    console.log(jobName + ' - ' + status);

    // log start of job to db
    records.logEvent({ body : { message: jobName + ' - ' + status, user: jobUser, } }, res);
    
    // run refreshAllSystems
    ctrl.googleMain(res, 'refresh', SHEET_ID, RANGE, jobUser);

  } catch (error) {
    // log any errors
    status = `error occurred while running:  \n` + error;
    console.log(jobName + ' - ' + status);
  }
});

// -------------------------------------------------------------------------------------------------
// CRON JOB: Tech Catalog Daily Import (runs daily at 5:00 AM)
cron.schedule('0 6 * * *', () => { //PRODUCTION
  //cron.schedule('*/1 * * * 1-5', () => { //DEBUGGING

  const jobName = 'CRON JOB: Tech Catalog Daily Import';
  let status = 'executed';

  console.log(jobName + ' - ' + status);

  try {

    let res = {};

    // log execution of job
    ctrl.sendLogQuery(jobName + ' - ' + status, jobUser, jobName, res);

    // run daily import
    techCatImport.runDailyTechCatalogImport({ body : { refreshtoken: process.env.FLEXERA_REFRESH_TOKEN } }, res)
    .then((response) => {
      status = `finished successfully:  \n` + response;
      console.log(jobName + ' - ' + status);
    })
    .catch((error) => {
      status = `error occurred while running:  \n` + error;
      console.log(jobName + ' - ' + status);
    });

  } catch (error) {
    status = `error occurred starting:  \n` + error;
    console.log(jobName + ' - ' + status);
  }

});

/*
 * Function to get FISMA info from ServiceNow API
 * everyday at 20:00 Eastern Time
*/
/*
const request = require('request');
const fetch = require("node-fetch");
let base64 = require('base-64');
*/
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

// -------------------------------------------------------------------------------------------------
// CRON JOB: Update GSA POCs (runs every Wednesday at 7:00 AM)
cron.schedule('0 7 * * 3', () => {

  const jobName = 'CRON JOB: Update GSA POCs';
  let status = 'executed';

  try {

    let req = {};
    let res = {};

    // log execution of job
    ctrl.sendLogQuery(jobName + ' - ' + status, jobUser, jobName, res);

    // run updatePocs
    ctrl.updatePocs(req, res);

  } catch (error) {
    status = `error occurred starting:  \n` + error;
    console.log(jobName + ' - ' + status);
  }

});