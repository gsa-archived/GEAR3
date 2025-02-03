import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { ApiService } from '@services/apis/api.service';
import { ModalsService } from '@services/modals/modals.service';
import { TableService } from '@services/tables/table.service';
import { Title } from '@angular/platform-browser';
import { Column } from '../../../common/table-classes';
import { FISMA } from '@api/models/fisma.model';

// Declare jQuery symbol
declare var $: any;

@Component({
  selector: 'fisma-pocs',
  templateUrl: './fisma-pocs.component.html',
  styleUrls: ['./fisma-pocs.component.css'],
})
export class FismaPocsComponent implements OnInit {
  row: Object = <any>{};

  constructor(
    private apiService: ApiService,
    private modalService: ModalsService,
    private route: ActivatedRoute,
    private tableService: TableService,
    private titleService: Title
  ) {
    this.modalService.currentFismaSys.subscribe((row) => (this.row = row));
  }

  tableData: FISMA[] = [];
  tableDataOriginal: FISMA[] = [];

  tableCols: Column[] = [
    {
      field: 'Name',
      header: 'System Name',
      isSortable: true,
    },
    {
      field: 'FIPS_Impact_Level',
      header: 'FIPS Impact Level',
      isSortable: true,
    },
    {
      field: 'AO',
      header: 'Authorizing Official',
      isSortable: true,
      formatter: this.pocFormatter,
    },
    {
      field: 'SO',
      header: 'System Owner',
      isSortable: true,
      formatter: this.pocFormatter,
    },
    {
      field: 'ISSM',
      header: 'ISSM',
      isSortable: true,
      formatter: this.pocFormatter,
    },
    {
      field: 'ISSO',
      header: 'ISSO',
      isSortable: true,
      formatter: this.pocFormatter,
    },
    {
      field: 'RespOrg',
      header: 'Responsible Org',
      isSortable: true,
      showColumn: false,
    },
    {
      field: 'BusOrg',
      header: 'Business Org',
      isSortable: true,
      showColumn: false,
    },
  ];

  ngOnInit(): void {
    // Enable popovers
    $(function () {
      $('[data-toggle="popover"]').popover();
    });

    this.apiService.getFISMA().subscribe(f => {
      this.tableDataOriginal = f;
      this.tableData = f;
      this.tableService.updateReportTableData(f);
    });

    // Method to open details modal when referenced directly via URL
    this.route.params.subscribe((params) => {
      var detailFismaID = params['fismaID'];
      if (detailFismaID) {
        this.titleService.setTitle(
          `${this.titleService.getTitle()} - ${detailFismaID}`
        );
        this.apiService
          .getOneFISMASys(detailFismaID)
          .subscribe((data: any[]) => {
            this.tableService.fismaTableClick(data[0]);
          });
      }
    });
  }

  pocFormatter(value) {
    // remove beginning field type from poc info
    let pocsCleanedUp = value.split(':');
    // split poc groupings into array
    let pocs: string[] = pocsCleanedUp[1].split(';');
    // the final string that gets displayed
    let finalDisplayStr = '';

    // if there's no pocs display a default
    if(pocs.length === 0 || pocs[0] === "") {
      return 'None Provided';
    }

    // iterate over all poc groupings
    pocs.map(p => {
      if(p !== " ") {
        // split the poc group into specific contact types
        let contactTypes = p.split(',');
        let name = contactTypes[0];
        let email = contactTypes[1];
        let phone = contactTypes[2];

        // temp display string
        let displayStr = '';

        if(name) {
          displayStr += `${name}<br/>`;
        }

        if(email) {
          displayStr += `<a href="https://mail.google.com/mail/?view=cm&fs=1&to=${email}"
          target="_blank" rel="noopener">${email}</a><br/>`;
        }

        if(phone) {
          displayStr += `${phone.substring(0, 4)}-${phone.substring(4, 7)}-${phone.substring(7, 11)}<br/>`;
        }

        // append the temp display string to the final display string
        finalDisplayStr += `${displayStr}<br/>`;
      }
    });

    return finalDisplayStr;
  }
}
