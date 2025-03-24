import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { ApiService } from '@services/apis/api.service';
import { ModalsService } from '@services/modals/modals.service';
import { SharedService } from '@services/shared/shared.service';
import { TableService } from '@services/tables/table.service';
import { Title } from '@angular/platform-browser';

import { ITStandards } from '@api/models/it-standards.model';
import { DataDictionary } from '@api/models/data-dictionary.model';
import { FilterButton, Column, TwoDimArray } from '@common/table-classes';

// Declare jQuery symbol
declare var $: any;

@Component({
    selector: 'it-standards',
    templateUrl: './it-standards.component.html',
    styleUrls: ['./it-standards.component.css'],
    standalone: false
})
export class ItStandardsComponent implements OnInit {
  row: Object = <any>{};
  filteredTable: boolean = false;
  filterTitle: string = '';
  attrDefinitions: DataDictionary[] = [];
  columnDefs: any[] = [];
  dataReady: boolean = false;

  constructor(
    private apiService: ApiService,
    private modalService: ModalsService,
    private route: ActivatedRoute,
    public sharedService: SharedService,
    private tableService: TableService,
    private titleService: Title
  ) {
    this.modalService.currentITStand.subscribe((row) => (this.row = row));
  }
  
  tableData: ITStandards[] = [];
  tableDataOriginal: ITStandards[] = [];

  preloadedFilterButtons: FilterButton[] = [];
  filterButtons: TwoDimArray<FilterButton> = [
    [
      {
        buttonText: 'Mobile',
        filters: [
          { field: 'DeploymentType', value: 'mobile' }
        ]
      },
      {
        buttonText: 'Desktop',
        filters: [
          { field: 'DeploymentType', value: 'desktop' }
        ]
      },
      {
        buttonText: 'Server',
        filters: [
          { field: 'DeploymentType', value: 'server' }
        ]
      }
    ],
    [
      {
        buttonText: 'Approved',
        filters: [
          { field: 'Status', value: 'approved' }
        ]
      },
      {
        buttonText: 'Denied',
        filters: [
          { field: 'Status', value: 'denied' }
        ]
      },
      {
        buttonText: 'Retired',
        filters: [
          { field: 'Status', value: 'retired' }
        ]
      }
    ]
  ];

  tableCols: Column[] = [];

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
      this.tableCols = [{
        field: 'ID',
        header: 'ID',
        isSortable: true,
        showColumn: false,
        titleTooltip: this.getTooltip('ID')
      }, {
        field: 'Name',
        header: 'IT Standard Name',
        isSortable: true,
        titleTooltip: this.getTooltip('IT Standard Name')
      },
      {
        field: 'ApprovedVersions',
        header: 'Approved Versions',
        isSortable: false,
        showColumn: true,
        titleTooltip: this.getTooltip('Approved Versions')
      }, {
        field: 'Manufacturer',
        header: 'Manufacturer ID',
        isSortable: true,
        showColumn: false,
        titleTooltip: this.getTooltip('Manufacturer ID')
      }, {
        field: 'ManufacturerName',
        header: 'Manufacturer',
        isSortable: true,
        titleTooltip: this.getTooltip('Manufacturer Name')
      }, {
        field: 'SoftwareProduct',
        header: 'Product ID',
        isSortable: true,
        showColumn: false,
        titleTooltip: this.getTooltip('Software Product ID')
      }, {
        field: 'SoftwareProductName',
        header: 'Product',
        isSortable: true,
        showColumn: false,
        titleTooltip: this.getTooltip('Software Product Name')
      }, {
        field: 'SoftwareVersion',
        header: 'Version ID',
        isSortable: true,
        showColumn: false,
        titleTooltip: this.getTooltip('Software Version ID')
      }, {
        field: 'SoftwareVersionName',
        header: 'Version',
        isSortable: true,
        showColumn: false,
        titleTooltip: this.getTooltip('Software Version Name')
      }, {
        field: 'SoftwareRelease',
        header: 'Release ID',
        isSortable: true,
        showColumn: false,
        titleTooltip: this.getTooltip('Software Release ID')
      }, {
        field: 'SoftwareReleaseName',
        header: 'Release',
        isSortable: true,
        showColumn: false,
        titleTooltip: this.getTooltip('Software Release Name')
      }, {
        field: 'EndOfLifeDate',
        header: 'Vendor End of Life Date',
        isSortable: true,
        showColumn: false,
        formatter: this.sharedService.dateFormatter,
        titleTooltip: this.getTooltip('Software End of Life Date')
      }, {
        field: 'OldName',
        header: 'Also Known As',
        isSortable: true,
        showColumn: false,
        titleTooltip: this.getTooltip('Previously Known As')
      }, {
        field: 'Description',
        header: 'Description',
        isSortable: true,
        showColumn: true,
        formatter: this.sharedService.formatDescription,
        titleTooltip: this.getTooltip('Description')
      }, {
        field: 'Category',
        header: 'Category',
        isSortable: true,
        titleTooltip: this.getTooltip('Category')
      }, {
        field: 'Status',
        header: 'Status',
        isSortable: true,
        titleTooltip: this.getTooltip('Status')
      }, {
        field: 'StandardType',
        header: 'Standard Type',
        isSortable: true,
        showColumn: false,
        titleTooltip: this.getTooltip('Standard Type')
      }, {
        field: 'DeploymentType',
        header: 'Deployment Type',
        isSortable: true,
        titleTooltip: this.getTooltip('Deployment Type')
      }, {
        field: 'ComplianceStatus',
        header: '508 Compliance',
        isSortable: true,
        showColumn: false,
        titleTooltip: this.getTooltip('508 Compliance')
      }, {
        field: 'POC',
        header: 'POC',
        isSortable: true,
        showColumn: false,
        titleTooltip: this.getTooltip('POC')
      }, {
        field: 'POCorg',
        header: 'POC Org',
        isSortable: true,
        showColumn: false,
        titleTooltip: this.getTooltip('POC Org')
      },
      {
        field: 'Comments',
        header: 'Comments',
        isSortable: true,
        showColumn: false,
        formatter: this.sharedService.formatDescription,
        titleTooltip: this.getTooltip('Comments')
      }, {
        field: 'attestation_required',
        header: 'Attestation Required',
        isSortable: true,
        showColumn: false,
        titleTooltip: this.getTooltip('Attestation Required')
      }, {
        field: 'attestation_link',
        header: 'Attestation Link',
        isSortable: true,
        showColumn: false,
        titleTooltip: this.getTooltip('Attestation Link')
      }, {
        field: 'fedramp',
        header: 'FedRAMP',
        isSortable: true,
        showColumn: false,
        formatter: this.YesNo,
        titleTooltip: this.getTooltip('FedRAMP')
      }, {
        field: 'open_source',
        header: 'Open Source',
        isSortable: true,
        showColumn: false,
        formatter: this.YesNo,
        titleTooltip: this.getTooltip('Open Source')
      },{
        field: 'RITM',
        header: 'Requested Item (RITM)',
        isSortable: true,
        showColumn: false,
        titleTooltip: this.getTooltip('Requested Item (RITM)')
      }, {
        field: 'ApprovalExpirationDate',
        header: 'Approval Expires',
        isSortable: true,
        showColumn: true,
        formatter: this.sharedService.dateFormatter,
        titleTooltip: this.getTooltip('Approval Expiration Date')
      },
      {
        field: 'OperatingSystems',
        header: 'Operating Systems',
        isSortable: false,
        showColumn: false,
        formatter: this.sharedService.csvFormatter,
        titleTooltip: this.getTooltip('Operating Systems')
      },
      {
        field: 'AppBundleIds',
        header: 'App Bundle Ids',
        isSortable: false,
        showColumn: false,
        formatter: this.sharedService.csvFormatter,
        titleTooltip: this.getTooltip('App Bundle Ids')
      }];
    });

    // Set JWT when logged into GEAR Manager when returning from secureAuth
    this.sharedService.setJWTonLogIn();

    this.apiService.getITStandards().subscribe(i => {
      this.tableService.updateReportTableData(i);
      this.tableData = i;
      this.tableDataOriginal = i;
      this.dataReady = true;
    });

    // Method to open details modal when referenced directly via URL
    this.route.params.subscribe((params) => {
      let detailStandID = params['standardID'];
      let deploymentType = params['deploymentType'];
      let status = params['status'];

      if(deploymentType) {
        let filterButton = {
          buttonText: deploymentType[0].toUpperCase() + deploymentType.slice(1),
          filters: [
            { field: 'DeploymentType', value: deploymentType.toLocaleLowerCase() }
          ]
        };
        this.preloadedFilterButtons.push(filterButton);
      }

      if(status) {
        let filterButton = {
          buttonText: status[0].toUpperCase() + status.slice(1),
          filters: [
            { field: 'Status', value: status.toLocaleLowerCase() }
          ]
        };
        this.preloadedFilterButtons.push(filterButton);
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

  getTooltip (name: string): string {
    const def = this.attrDefinitions.find(def => def.Term === name);
    if(def){
      return def.TermDefinition;
    }
    return '';
  }

  onFilterClick(filterButtons: FilterButton[]) {
    this.tableData = this.tableDataOriginal;
    this.tableService.filterButtonClick(filterButtons, this.tableData);
  }

  onFilterResetClick() {
    this.tableData = this.tableDataOriginal;
    this.tableService.updateReportTableData(this.tableDataOriginal);
  }
}
