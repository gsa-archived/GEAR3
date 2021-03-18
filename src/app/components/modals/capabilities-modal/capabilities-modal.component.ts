import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

import { ModalsService } from '@services/modals/modals.service';
import { SharedService } from '@services/shared/shared.service';
import { TableService } from '@services/tables/table.service';

// Declare jQuery symbol
declare var $: any;

@Component({
  selector: 'capabilities-modal',
  templateUrl: './capabilities-modal.component.html',
  styleUrls: ['./capabilities-modal.component.css']
})
export class CapabilitiesModalComponent implements OnInit {

  capability = <any>{};

  constructor(
    private location: Location,
    private modalService: ModalsService,
    private router: Router,
    private sharedService: SharedService,
    private tableService: TableService) { }

  ngOnInit(): void {
    this.modalService.currentCap.subscribe(capability => this.capability = capability);

    // $('#capSupportAppsTable').bootstrapTable($.extend(this.tableService.relAppsTableOptions, {
    //   columns: this.tableService.relAppsColumnDefs,
    //   data: [],
    // }));

    // // Method to handle click events on the Supported Apps table
    // $(document).ready(
    //   $('#capSupportAppsTable').on('click-row.bs.table', function (e, row) {
    //     // Hide First Modal before showing new modal
    //     $('#capabilityDetail').modal('hide');

    //     this.tableService.appsTableClick(row);
    //   }.bind(this)
    //   ));

    // Revert back to overview tab when modal goes away
    $('#capabilityDetail').on('hidden.bs.modal', function (e) {
      $("#capTabs li:first-child a").tab('show');

      // Change URL back without ID after closing Modal
      var truncatedURL = this.sharedService.coreURL(this.router.url);
      this.location.replaceState(truncatedURL);
    }.bind(this));
  }

}
