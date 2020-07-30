import { Component, OnInit } from '@angular/core';

import { ModalsService } from '../../../services/modals/modals.service';
import { SharedService } from '../../../services/shared/shared.service';
import { TableService } from '../../../services/tables/table.service';

// Declare jQuery symbol
declare var $: any;

@Component({
  selector: 'applications-modal',
  templateUrl: './applications-modal.component.html',
  styleUrls: ['./applications-modal.component.css']
})
export class ApplicationsModalComponent implements OnInit {

  application = <any>{};
  interfaces: any[] = [];

  constructor(
    private modalService: ModalsService,
    public sharedService: SharedService,
    private tableService: TableService) { }

  // TIME Report Table Options
  timeTableOptions: {} = {
    advancedSearch: false,
    // idTable: 'advSearchAppTimeTable',
    buttonsClass: 'info',
    cache: true,
    classes: "table table-bordered table-striped table-light",
    showColumns: false,
    showExport: true,
    exportDataType: 'all',
    exportTypes: ['xlsx', 'pdf', 'csv', 'json', 'xml', 'txt', 'sql'],
    headerStyle: function (column) { return { classes: 'bg-danger text-white' } },
    pagination: false,
    showPaginationSwitch: false,
    search: false,
    showSearchClearButton: false,
    searchOnEnterKey: false
  };

  // TIME Report Table Columns
  timeColumnDefs: any[] = [{
    field: 'FY14',
    title: 'FY14',
    visible: false,
    formatter: this.sharedService.FYFormatter
  }, {
    field: 'FY15',
    title: 'FY15',
    visible: false,
    formatter: this.sharedService.FYFormatter
  }, {
    field: 'FY16',
    title: 'FY16',
    visible: false,
    formatter: this.sharedService.FYFormatter
  }, {
    field: 'FY17',
    title: 'FY17',
    visible: false,
    formatter: this.sharedService.FYFormatter
  }, {
    field: 'FY18',
    title: 'FY18',
    visible: false,
    formatter: this.sharedService.FYFormatter
  }, {
    field: 'FY19',
    title: 'FY19',
    formatter: this.sharedService.FYFormatter
  }, {
    field: 'FY20',
    title: 'FY20',
    formatter: this.sharedService.FYFormatter
  }, {
    field: 'FY21',
    title: 'FY21',
    formatter: this.sharedService.FYFormatter
  }, {
    field: 'FY22',
    title: 'FY22',
    formatter: this.sharedService.FYFormatter
  }, {
    field: 'FY23',
    title: 'FY23',
    formatter: this.sharedService.FYFormatter
  }, {
    field: 'FY24',
    title: 'FY24',
    formatter: this.sharedService.FYFormatter
  }, {
    field: 'TIME_Notes',
    title: 'Notes'
  }];


  // Related Capabilities Table Options
  appCapTableOptions: {} = {
    advancedSearch: false,
    // idTable: 'advSearchAppCapTable',
    buttonsClass: 'info',
    cache: true,
    classes: "table table-bordered table-striped table-hover table-light clickable-table",
    showColumns: false,
    showExport: true,
    exportDataType: 'all',
    exportTypes: ['xlsx', 'pdf', 'csv', 'json', 'xml', 'txt', 'sql'],
    headerStyle: function (column) { return { classes: 'bg-royal-blue text-white' } },
    pagination: false,
    showPaginationSwitch: false,
    search: true,
    showSearchClearButton: true,
    searchOnEnterKey: true,
    sortName: 'ReferenceNum',
    sortOrder: 'asc',
    showToggle: true
  };

  // Related Capabilities Table Columns
  appCapColumnDefs: any[] = [{
    field: 'ReferenceNum',
    title: 'Reference Id',
    sortable: true
  }, {
    field: 'Name',
    title: 'Business Capability',
    sortable: true
  }, {
    field: 'Description',
    title: 'Description',
    sortable: true,
    formatter: this.sharedService.descFormatter
  }, {
    field: 'ParentCap',
    title: 'Parent Capability'
  }];


  // Related Technologies Table Options
  appTechTableOptions: {} = {
    advancedSearch: false,
    // idTable: 'advSearchAppTechTable',
    buttonsClass: 'info',
    cache: true,
    classes: "table table-bordered table-striped table-hover table-light clickable-table",
    showColumns: true,
    showExport: true,
    exportDataType: 'all',
    exportTypes: ['xlsx', 'pdf', 'csv', 'json', 'xml', 'txt', 'sql'],
    headerStyle: function (column) { return { classes: 'bg-teal text-white' } },
    pagination: false,
    showPaginationSwitch: false,
    search: true,
    showSearchClearButton: true,
    searchOnEnterKey: true,
    sortName: 'Name',
    sortOrder: 'asc',
    showToggle: true
  };

  // Related Technologies Table Columns
  appTechColumnDefs: any[] = [{
    field: 'Name',
    title: 'Technology',
    sortable: true
  }, {
    field: 'Description',
    title: 'Description',
    sortable: true,
    formatter: this.sharedService.descFormatter
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
    field: 'Category',
    title: 'Software Category',
    sortable: true,
    visible: false
  }, {
    field: 'Expiration',
    title: 'Approved Status Expiration Date',
    sortable: true,
    visible: false
  }];

  ngOnInit(): void {
    this.modalService.currentApp.subscribe(application => this.application = application);

    $('#appTimeTable').bootstrapTable($.extend(this.timeTableOptions, {
      columns: this.timeColumnDefs,
      data: [],
    }));

    $('#appCapTable').bootstrapTable($.extend(this.appCapTableOptions, {
      columns: this.appCapColumnDefs,
      data: [],
    }));

    $('#appTechTable').bootstrapTable($.extend(this.appTechTableOptions, {
      columns: this.appTechColumnDefs,
      data: [],
    }));


    // Method to handle click events on the Related Capabilities table
    $(document).ready(
      $('#appCapTable').on('click-row.bs.table', function (e, row) {
        // Hide First Modal before showing new modal
        $('#appDetail').modal('hide');

        this.tableService.capsTableClick(row);
      }.bind(this)
      ));

    // Method to handle click events on the Related Technologies table
    $(document).ready(
      $('#appTechTable').on('click-row.bs.table', function (e, row) {
        // Hide First Modal before showing new modal
        $('#appDetail').modal('hide');

        this.tableService.itStandTableClick(row);
      }.bind(this)
      ));
  }


  appEdit () {
    // Hide Detail Modal before showing Manager Modal
    $('#appDetail').modal('hide');
    this.modalService.updateDetails(this.application, 'application');
    this.sharedService.setAppForm();
    $('#appManager').modal('show');
  }

}
