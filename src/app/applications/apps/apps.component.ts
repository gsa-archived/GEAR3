import { Component, OnInit } from '@angular/core';
import { formatDate } from '@angular/common';
import { Location } from '@angular/common';

import { ModalsService } from '../../services/modals/modals.service';

// Declare jQuery symbol
declare var $: any;

@Component({
  selector: 'app-apps',
  templateUrl: './apps.component.html',
  styleUrls: ['./apps.component.css']
})
export class AppsComponent implements OnInit {

  row: Object = <any>{};

  constructor(
    private location: Location,
    private modalService: ModalsService) {
      this.modalService.currentSys.subscribe(row => this.row = row);
  }

  // Apps Table Options
  tableOptions: {} = {
    advancedSearch: true,
    idTable: 'advSearchAppsTable',
    buttonsClass: 'info',
    cache: true,
    classes: "table table-bordered table-striped table-hover table-dark",
    showColumns: true,
    showExport: true,
    exportDataType: 'all',
    exportOptions: {
      fileName: function () {
        // Append current date time to filename
        this.currentDate = formatDate(Date.now(), 'MMM_dd_yyyy-HH_mm', 'en-US');
        return 'GSA_Business_Apps-' + this.currentDate
      }
    },
    exportTypes: ['xlsx', 'pdf', 'csv', 'json', 'xml', 'txt', 'sql'],
    pagination: true,
    showPaginationSwitch: true,
    search: true,
    showSearchClearButton: true,
    searchOnEnterKey: true,
    sortName: 'Name',
    sortOrder: 'asc',
    showToggle: true,
    url: this.location.prepareExternalUrl('/api/applications')
  };

  // Apps Table Columns
  columnDefs: any[] = [{
    field: 'DisplayName',
    title: 'Display Name',
    sortable: true
  }, {
    field: 'Name',
    title: 'Application Name',
    sortable: true
  }, {
    field: 'Description',
    title: 'Description',
    sortable: true
  }, {
    field: 'SSOShort',
    title: 'SSO',
    sortable: true
  }, {
    field: 'SSO',
    title: 'SSO (Long)',
    sortable: true,
    visible: false
  }, {
    field: 'CUI',
    title: 'CUI',
    sortable: true,
    visible: false
  }, {
    field: 'OwnerShort',
    title: 'Two Letter Org (Short)',
    sortable: true
  }, {
    field: 'Owner',
    title: 'Two Letter Org (Long)',
    sortable: true,
    visible: false
  }, {
    field: 'BusPOC',
    title: 'Business POC',
    sortable: true,
    visible: false
  }, {
    field: 'BusOrg',
    title: 'Business POC Org',
    sortable: true,
    visible: false
  }, {
    field: 'TechPOC',
    title: 'Technical POC',
    sortable: true,
    visible: false
  }, {
    field: 'TechOrg',
    title: 'Technical POC Org',
    sortable: true,
    visible: false
  }, {
    field: 'System',
    title: 'Parent System',
    sortable: true,
    formatter: this.systemFormatter
  }, {
    field: 'HostingProvider',
    title: 'Hosting Provider',
    sortable: true,
    visible: false
  }, {
    field: 'Cloud',
    title: 'Cloud',
    sortable: true,
    visible: false
  }, {
    field: 'Status',
    title: 'Status',
    sortable: true
  }, {
    field: 'ProdYear',
    title: 'Production Year',
    sortable: true,
    visible: false
  }, {
    field: 'FISMASystem',
    title: 'FISMA System',
    sortable: true,
    visible: false,
    formatter: this.systemFormatter
  }, //{
  //   field: 'HelpDesk',
  //   title: 'Help Desk',
  //   sortable: true,
  //   visible: false
  // },
  {
    field: 'OMBUID',
    title: 'Application ID',
    sortable: true,
    visible: false
  }];

  ngOnInit(): void {
    $('#appsTable').bootstrapTable($.extend(this.tableOptions, {
      columns: this.columnDefs,
      data: [],
    }));

    // Method to handle click events on the Applications table
    $(document).ready(
      $('#appsTable').on('click-row.bs.table', function (e, row) {
        // console.log("Applications Table Clicked Row: ", row);  // Debug

        this.modalService.updateDetails(row, 'application');
        $('#appsDetail').modal('show');

        // Update TIME report table in detail modal with clicked application
        $('#appTimeTable').bootstrapTable('refreshOptions', {
          exportOptions: {
            fileName: function () {
              // Append current date time to filename
              this.currentDate = formatDate(Date.now(), 'MMM_dd_yyyy-HH_mm', 'en-US');
              return row.Name + '-TIME_Report-' + this.currentDate
            }
          },
          data: [row]
        });

        // Update related capabilities table in detail modal with clicked application
        $('#appCapTable').bootstrapTable('refreshOptions', {
          exportOptions: {
            fileName: function () {
              // Append current date time to filename
              this.currentDate = formatDate(Date.now(), 'MMM_dd_yyyy-HH_mm', 'en-US');
              return row.Name + '-Related_Capabilities-' + this.currentDate
            }
          },
          url: this.location.prepareExternalUrl('/api/applications/'
           + String(row.ID) + '/capabilities')
        });

        // Update related technologies table in detail modal with clicked application
        $('#appTechTable').bootstrapTable('refreshOptions', {
          exportOptions: {
            fileName: function () {
              // Append current date time to filename
              this.currentDate = formatDate(Date.now(), 'MMM_dd_yyyy-HH_mm', 'en-US');
              return row.Name + '-Related_Technologies-' + this.currentDate
            }
          },
          url: this.location.prepareExternalUrl('/api/applications/'
           + String(row.ID) + '/technologies')
        });
      }.bind(this),
    ));

  }

  // Data Formatters
  private systemFormatter(value, row, index, field) {
    var finalVal = value;

    if (value == '' || value == undefined) {
      finalVal = "N/A";
    }

    return finalVal;
  };

}
