const ctrl = require('./base.controller');

const fs = require('fs');
const path = require('path');

const queryPath = '../queries/';

function findAll(req, res) {
  var query = fs.readFileSync(path.join(__dirname, queryPath, 'GET/get_investments.sql')).toString() +
    ";";

  res = ctrl.sendQuery(query, 'investments', res);
};

function findOne(req, res) {
  var query = fs.readFileSync(path.join(__dirname, queryPath, 'GET/get_investments.sql')).toString() +
    ` WHERE invest.Id = ${req.params.id};`;

  res = ctrl.sendQuery(query, 'individual investment', res);
};

function findLatest(req, res) {
  var query = fs.readFileSync(path.join(__dirname, queryPath, 'GET/get_investments.sql')).toString() +
    ` ORDER BY invest.CreateDTG DESC LIMIT 1;`;

  res = ctrl.sendQuery(query, 'latest individual investment', res);
};

function findApplications(req, res) {
  var query = fs.readFileSync(path.join(__dirname, queryPath, 'GET/get_applications.sql')).toString() +
    ` AND app.obj_investment_Id = ${req.params.id} GROUP BY app.Id;`;  // Note that there's already a WHERE clause

  res = ctrl.sendQuery(query, 'application relations for investment', res);
};

function update(req, res) {
  if (req.headers.authorization) {
    var data = req.body;

    // Create string to update apps with investment or null when deselected
    var appString = '';
    if (data.investRelatedApps) {
      data.investRelatedApps.forEach(appID => {
        appString += `UPDATE obj_application SET obj_investment_Id=${req.params.id} WHERE Id=${appID}; `
      });
    }

    if (data.deselectedApps) {
      data.deselectedApps.forEach(appID => {
        appString += `UPDATE obj_application SET obj_investment_Id=NULL WHERE Id=${appID}; `
      });
    }

    // Null any empty text fields
    if (!data.investDesc) { data.investDesc = 'NULL' }
    else { data.investDesc = `'${data.investDesc}'` }

    if (!data.investComments) { data.investComments = 'NULL' }
    else { data.investComments = `'${data.investComments}'` }

    var query = `SET FOREIGN_KEY_CHECKS=0;
      UPDATE obj_investment
      SET Keyname               = '${data.investName}',
        Active                  = ${data.investStatus},
        Description             = ${data.investDesc},
        obj_poc_Id              = ${data.invManager},
        obj_investment_type_Id  = ${data.investType},
        Budget_Year             = '${data.investBY}',
        UII                     = '${data.investUII}',
        obj_organization_Id     = ${data.investSSO},
        primary_service_area    = ${data.investPSA},
        sec_serv_area1          = ${data.investSSA},
        Comments                = ${data.investComments},
        ChangeAudit             = '${data.auditUser}'
      WHERE Id = ${req.params.id};
      SET FOREIGN_KEY_CHECKS=1;
      ${appString}`

    res = ctrl.sendQuery(query, 'update investment', res);
  } else {
    res.status(502).json({
      message: "No authorization token present. Not allowed to update investments"
    });
  }
}

function create(req, res) {
  if (req.headers.authorization) {
    var data = req.body;

    // Null any empty text fields
    if (!data.investDesc) { data.investDesc = 'NULL' }
    else { data.investDesc = `'${data.investDesc}'` }

    if (!data.investComments) { data.investComments = 'NULL' }
    else { data.investComments = `'${data.investComments}'` }

    var query = `INSERT INTO obj_investment(
      Keyname,
      Active,
      Description,
      obj_poc_Id,
      obj_investment_type_Id,
      Budget_Year,
      UII,
      obj_organization_Id,
      primary_service_area,
      sec_serv_area1,
      Comments,
      CreateAudit,
      ChangeAudit) VALUES (
        '${data.investName}',
        ${data.investStatus},
        ${data.investDesc},
        ${data.invManager},
        ${data.investType},
        '${data.investBY}',
        '${data.investUII}',
        ${data.investSSO},
        ${data.investPSA},
        ${data.investSSA},
        ${data.investComments},
        '${data.auditUser}',
        '${data.auditUser}');`

    res = ctrl.sendQuery(query, 'create investment', res);
  } else {
    res.status(502).json({
      message: "No authorization token present. Not allowed to create investment"
    });
  }
}

function findTypes(req, res) {
  var query = fs.readFileSync(path.join(__dirname, queryPath, 'GET/get_investment_types.sql')).toString();

  res = ctrl.sendQuery(query, 'investment types', res);
}

module.exports = {
  findAll,
  findOne,
  findLatest,
  findApplications,

  update,
  create,

  findTypes
};