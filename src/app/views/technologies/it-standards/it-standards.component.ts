import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { ApiService } from '@services/apis/api.service';
import { ModalsService } from '@services/modals/modals.service';
import { SharedService } from '@services/shared/shared.service';
import { TableService } from '@services/tables/table.service';
import { Title } from '@angular/platform-browser';

import { ITStandards } from '@api/models/it-standards.model';
import { DataDictionary } from '@api/models/data-dictionary.model';
import { take } from 'rxjs/operators';
import { HttpParams } from '@angular/common/http';

// Declare jQuery symbol
declare var $: any;

@Component({
  selector: 'it-standards',
  templateUrl: './it-standards.component.html',
  styleUrls: ['./it-standards.component.css'],
})
export class ItStandardsComponent implements OnInit {
  row: Object = <any>{};
  filteredTable: boolean = false;
  filterTitle: string = '';
  attrDefinitions: DataDictionary[] = [];
  columnDefs: any[] = [];

  constructor(
    private apiService: ApiService,
    private location: Location,
    private modalService: ModalsService,
    private route: ActivatedRoute,
    private router: Router,
    public sharedService: SharedService,
    private tableService: TableService,
    private titleService: Title,
  ) {
    this.modalService.currentITStand.subscribe((row) => (this.row = row));
  }

  // IT Standard Table Options
  tableOptions: {} = this.tableService.createTableOptions({
    advancedSearch: true,
    idTable: 'ITStandardTable',
    classes: 'table-hover table-dark clickable-table fixed-table',
    showColumns: true,
    showExport: true,
    exportFileName: 'GSA_IT_Standards',
    exportIgnoreColumn:[],
    headerStyle: 'bg-teal',
    pagination: true,
    search: true,
    sortName: 'Name',
    sortOrder: 'asc',
    showToggle: true,
    url: this.apiService.techUrl,
  });

  activeFilters: Object = {};

  YesNo(value, row, index, field) {
    return value === 'T'? "Yes" : "No";
  }

  ngOnInit(): void {
    /*
    * Get definitions for the table header tooltips
    * Then set the column defintions and initialize the table
    */
    this.apiService.getDataDictionaryByReportName('IT Standards List').subscribe(defs => {
      this.attrDefinitions = defs

      // IT Standard Table Columns
      this.columnDefs = [{
        field: 'ID',
        title: 'ID',
        sortable: true,
        visible: false,
        titleTooltip: this.getTooltip('ID')
      }, {
        field: 'Name',
        title: 'IT Standard Name',
        sortable: true,
        titleTooltip: this.getTooltip('IT Standard Name')
      }, {
        field: 'Manufacturer',
        title: 'Manufacturer ID',
        sortable: true,
        visible: false,
        titleTooltip: this.getTooltip('Manufacturer ID')
      }, {
        field: 'ManufacturerName',
        title: 'Manufacturer',
        sortable: true,
        titleTooltip: this.getTooltip('Manufacturer Name')
      }, {
        field: 'SoftwareProduct',
        title: 'Product ID',
        sortable: true,
        visible: false,
        titleTooltip: this.getTooltip('Software Product ID')
      }, {
        field: 'SoftwareProductName',
        title: 'Product',
        sortable: true,
        visible: false,
        titleTooltip: this.getTooltip('Software Product Name')
      }, {
        field: 'SoftwareVersion',
        title: 'Version ID',
        sortable: true,
        visible: false,
        titleTooltip: this.getTooltip('Software Version ID')
      }, {
        field: 'SoftwareVersionName',
        title: 'Version',
        sortable: true,
        visible: false,
        titleTooltip: this.getTooltip('Software Version Name')
      }, {
        field: 'SoftwareRelease',
        title: 'Release ID',
        sortable: true,
        visible: false,
        titleTooltip: this.getTooltip('Software Release ID')
      }, {
        field: 'SoftwareReleaseName',
        title: 'Release',
        sortable: true,
        visible: false,
        titleTooltip: this.getTooltip('Software Release Name')
      }, {
        field: 'EndOfLifeDate',
        title: 'Vendor End of Life Date',
        sortable: true,
        visible: false,
        formatter: this.sharedService.dateFormatter,
        titleTooltip: this.getTooltip('Software End of Life Date')
      }, {
        field: 'OldName',
        title: 'Also Known As',
        sortable: true,
        visible: false,
        titleTooltip: this.getTooltip('Previously Known As')
      }, {
        field: 'Description',
        title: 'Description',
        sortable: true,
        visible: true,
        class: 'wid-25',
        formatter: this.sharedService.formatDescription,
        titleTooltip: this.getTooltip('Description')
      }, {
        field: 'Category',
        title: 'Category',
        sortable: true,
        titleTooltip: this.getTooltip('Category')
      }, {
        field: 'Status',
        title: 'Status',
        sortable: true,
        titleTooltip: this.getTooltip('Status')
      }, {
        field: 'StandardType',
        title: 'Standard Type',
        sortable: true,
        visible: false,
        titleTooltip: this.getTooltip('Standard Type')
      }, {
        field: 'DeploymentType',
        title: 'Deployment Type',
        sortable: true,
        titleTooltip: this.getTooltip('Deployment Type')
      }, {
        field: 'ComplianceStatus',
        title: '508 Compliance',
        sortable: true,
        visible: false,
        titleTooltip: this.getTooltip('508 Compliance')
      }, {
        field: 'POC',
        title: 'POC',
        sortable: true,
        visible: false,
        titleTooltip: this.getTooltip('POC')
      }, {
        field: 'POCorg',
        title: 'POC Org',
        sortable: true,
        visible: false,
        titleTooltip: this.getTooltip('POC Org')
      },
      {
        field: 'Comments',
        title: 'Comments',
        sortable: true,
        visible: false,
        formatter: this.sharedService.formatDescription,
        titleTooltip: this.getTooltip('Comments')
      }, {
        field: 'attestation_required',
        title: 'Attestation Required',
        sortable: true,
        visible: false,
        titleTooltip: this.getTooltip('Attestation Required')
      }, {
        field: 'attestation_link',
        title: 'Attestation Link',
        sortable: true,
        visible: false,
        titleTooltip: this.getTooltip('Attestation Link')
      }, {
        field: 'fedramp',
        title: 'FedRAMP',
        sortable: true,
        visible: false,
        formatter: this.YesNo,
        titleTooltip: this.getTooltip('FedRAMP')
      }, {
        field: 'open_source',
        title: 'Open Source',
        sortable: true,
        visible: false,
        formatter: this.YesNo,
        titleTooltip: this.getTooltip('Open Source')
      },{
        field: 'RITM',
        title: 'Requested Item (RITM)',
        sortable: true,
        visible: false,
        titleTooltip: this.getTooltip('Requested Item (RITM)')
      }, {
        field: 'ApprovalExpirationDate',
        title: 'Approval Expires',
        sortable: true,
        visible: true,
        formatter: this.sharedService.dateFormatter,
        titleTooltip: this.getTooltip('Approval Expiration Date')
      },
      {
        field: 'ApprovedVersions',
        title: 'Approved Versions',
        sortable: false,
        visible: true,
        titleTooltip: this.getTooltip('Approved Versions')
      },
    {
      field: 'OperatingSystems',
      title: 'Operating Systems',
      sortable: false,
      visible: false,
      formatter: this.sharedService.csvFormatter,
      titleTooltip: this.getTooltip('Operating Systems')
    },
    {
      field: 'AppBundleIds',
      title: 'App Bundle Ids',
      sortable: false,
      visible: false,
      formatter: this.sharedService.csvFormatter,
      titleTooltip: this.getTooltip('App Bundle Ids')
    }];

      $('#itStandardsTable').bootstrapTable(
        $.extend(this.tableOptions, {
          columns: this.columnDefs,
          data: [],
        })
      );

      // Method to open details modal when referenced directly via URL
      this.route.params.subscribe((params) => {
        let detailStandID = params['standardID'];
        let deploymentType = params['deploymentType'];
        let status = params['status'];
        if(deploymentType) {
          this.activeFilters['DeploymentType'] = deploymentType;
        }
        if(status) {
          this.activeFilters['Status'] = status;
        }

        if(Object.keys(this.activeFilters).length > 0) {
          this.changeFilterByRoute();
          return;
        }
        if (detailStandID) {
          this.titleService.setTitle(
            `${this.titleService.getTitle()} - ${detailStandID}`
          );
          this.apiService
            .getOneITStandard(detailStandID)
            .subscribe((data: any[]) => {
              this.tableService.itStandTableClick(data[0]);
            });
        }
      });
    });

    // Enable popovers
    $(function () {
      $('[data-bs-toggle="popover"]').popover();
    });

    // Set JWT when logged into GEAR Manager when returning from secureAuth
    this.sharedService.setJWTonLogIn();

    const self = this;
    $(document).ready(() => {
      // Method to handle click events on the Investments table
      $('#itStandardsTable').on('click-row.bs.table', function (e, row) {
          this.tableService.itStandTableClick(row);
        }.bind(this)
      );

      //Method to Enable table sticky header after table commponent initialized.
      $('#itStandardsTable').on('load-success.bs.table', function () {
        this.sharedService.enableStickyHeader("itStandardsTable");
      }.bind(this)
    );
    });
  }

  // Create new IT Standard when in GEAR Manager mode
  createITStand() {
    var emptyITStand = new ITStandards();

    // By default, set new record status to "Pilot"
    emptyITStand.Status = 'Pilot';
    this.modalService.updateRecordCreation(true);
    this.sharedService.setITStandardsForm();
    this.modalService.updateDetails(emptyITStand, 'it-standard', false);
    $('#itStandardsManager').modal('show');

    // disable the tcSoftwareProduct on the itStandardsManager modal
    $('#divProduct').addClass("disabledDivProduct");
    $('#divVersion').addClass("disabledDivVersion");
    $('#divRelease').addClass("disabledDivRelease");
  }

  // Update table from filter buttons
  changeFilter(field: string, term: string) {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    if(this.isFilterActive(field, term)) {
      delete this.activeFilters[field];
      this.changeFilterByRoute();
      if(Object.keys(this.activeFilters).length === 0) {
        this.backToMainIT();
      } else {
        this.removeFilterFromRoute();
      }
    } else {
      this.activeFilters[field] = term;
      this.changeFilterByRoute();
      this.removeFilterFromRoute();
    }
  }

  changeFilterByRoute() {
    this.sharedService.disableStickyHeader("itStandardsTable");
    let filterNames: string = '';
    Object.keys(this.activeFilters).forEach(f => {
      if(f === 'DeploymentType') {
        filterNames += `${this.activeFilters[f]}`;
      }
      if(f === 'Status') {
        filterNames += `_${this.activeFilters[f]}`;
      }
    });
    this.filteredTable = true;
    this.filterTitle = `${filterNames} `;
    $('#itStandardsTable').bootstrapTable('filterBy', this.activeFilters);
    $('#itStandardsTable').bootstrapTable('refreshOptions', {
      exportOptions: {
        fileName: this.sharedService.fileNameFmt(
          'GSA_' + filterNames + '_IT_Standards'
        ),
      },
    });

    this.sharedService.enableStickyHeader("itStandardsTable");

    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  }

  backToMainIT() {
    this.activeFilters = {};
    this.sharedService.disableStickyHeader("itStandardsTable");
    this.filteredTable = false; // Hide main button
    this.removeFilterFromRoute();

    // Remove filters and back to default
    $('#itStandardsTable').bootstrapTable('filterBy', {});
    $('#itStandardsTable').bootstrapTable('refreshOptions', {
      exportOptions: {
        fileName: this.sharedService.fileNameFmt('GSA_IT_Standards'),
      },
    });

    this.filterTitle = '';
    this.sharedService.enableStickyHeader("itStandardsTable");

    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  }

  getTooltip (name: string): string {
    const def = this.attrDefinitions.find(def => def.Term === name);
    if(def){
      return def.TermDefinition;
    }
    return '';
  }

  isFilterActive(key, value) {
    return this.activeFilters.hasOwnProperty(key) && this.activeFilters[key] === value;
  }

  removeFilterFromRoute() {
    this.location.replaceState('/it_standards');
  }
}
