import { Component, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Table, TableRowSelectEvent } from 'primeng/table';
import { Column, ExportColumn, TwoDimArray, ButtonFilter } from '../../common/table-classes';
import { SharedService } from '@services/shared/shared.service';
import { TableService } from '@services/tables/table.service';
import { ApiService } from '@services/apis/api.service';


@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})

export class TableComponent implements OnInit {

  // Table columns and their options
  @Input() tableCols: Column[] = [];

  // The table data
  @Input() tableData: any[] = [];

  // Two dimenstional array of button filters
  // Each array of strings is a grouping of buttons
  @Input() buttonFilters: TwoDimArray<ButtonFilter> = [];

  // Report style that drives the overall color of the table
  @Input() reportStyle: string = 'default';

  // Website type for modal click fn
  @Input() tableType: string = '';

  // The name of report for the export csv
  @Input() exportName: string = '';

  // Filter event (some reports change available columns when filtered)
  @Output() filterEvent = new EventEmitter<string>();

  @ViewChild(Table) private dt: Table;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.screenHeight = `${(event.srcElement.innerHeight - 400)}px`;
  }

  visibleColumns: Column[] = [];
  isPaginated: boolean = true;
  exportColumns!: ExportColumn[];
  currentButtonFilter: string = '';
  screenHeight: string = '';
  showFilters: boolean = false;

  constructor(public sharedService: SharedService, public tableService: TableService, public apiService: ApiService) {
    this.screenHeight = `${(window.innerHeight - 400)}px`;
   }

  ngOnInit(): void {
    this.exportColumns = this.tableCols.map((col) => ({ title: col.header, dataKey: col.field }));

    this.tableCols.map(c => {
      if(this.showColumn(c)) {
        this.visibleColumns.push(c);
      }
    })

    this.tableData.map(d => {

    })
  }

  toggleVisible(e: any) {
    this.tableCols.map(c => {
      if(c.field === e.originalEvent.option.field) {
        c.showColumn = e.originalEvent.selected;
      }
    });
  }

  togglePagination() {
    this.isPaginated = !this.isPaginated;
  }

  toggleFilter() {
    this.showFilters = !this.showFilters;
  }

  getExportFilename() {
    let today = new Date();
    let year = today.getFullYear();
    let month = today.toLocaleString('default', { month: 'long' });
    let day = today.getDate();
    let hour = today.getHours();
    let mins = today.getMinutes();

    let formattedDate = `${month}_${day}_${year}-${hour}_${mins}`;

    return `GEAR_${this.exportName}-${formattedDate}`;
  }

  onButtonFilter(filter: ButtonFilter) {
    if(filter && filter.filterOn) {
      this.dt.filter(filter.filterOn, filter.field, 'contains')
    }

    this.filterEvent.emit(filter.filterBtnText);
  
    this.currentButtonFilter = filter.filterBtnText;
  }

  onButtonFilterClear() {
    this.dt.reset();
    this.currentButtonFilter = '';
    this.filterEvent.emit('');
  }

  applyFilteredStyle(filter: string) {
    if(this.currentButtonFilter === filter) {
      return 'filtered';
    }

    return '';
  }

  showColumn(c: Column) {
    return c.showColumn || !('showColumn' in c);
  }

  onRowSelect(e: TableRowSelectEvent) {
    switch (this.tableType) {
      case 'investments':
        this.tableService.investTableClick(e.data);
        break;
      case 'capabilities':
        this.tableService.capsTableClick(e.data);
        break;
      case 'websiteServiceCategory':
        this.tableService.websiteServiceCategoryTableClick(e.data);
        break;
      case 'organizations':
        this.tableService.orgsTableClick(e.data);
        break;
      case 'website':
        this.tableService.websitesTableClick(e.data);
        break;
      case 'records':
        this.tableService.recordsTableClick(e.data);
        break;
      case 'time':
        this.apiService.getOneSys(e.data['System Id'])
          .subscribe((data: any[]) => {
              this.tableService.systemsTableClick(data[0]);
            });

          // Change URL to include ID
          this.sharedService.addIDtoURL(e.data, 'System Id');
      case 'systems':
        this.tableService.systemsTableClick(e.data);
        break;
      case 'fisma':
        this.tableService.fismaTableClick(e.data);
        break;
      case 'fismaPoc':
        this.tableService.fismaTableClick(e.data);
        break;
      case 'itStandards':
        this.tableService.itStandTableClick(e.data);
      default:
        console.log('no type');
        break;
    }
  }

}
