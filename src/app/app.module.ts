import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { SidebarModule } from 'ng-sidebar';  // Sidebar Module
import { PdfViewerModule } from 'ng2-pdf-viewer';  // PDF Viewer
import { NgxChartsModule } from '@swimlane/ngx-charts'; // Visualizations
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// Components
import { TopNavbarComponent } from './components/top-navbar/top-navbar.component';
import { SidenavComponent } from './components/sidenav/sidenav.component';

//// Main
import { HomeComponent } from './views/main/home/home.component';
import { GlobalSearchComponent } from './views/main/global-search/global-search.component';
import { AboutComponent } from './views/main/about/about.component';
import { AssistTechComponent } from './views/main/assist-tech/assist-tech.component';
import { FormsGlossaryComponent } from './views/main/forms-glossary/forms-glossary.component';
import { GearManagerComponent } from './views/main/gear-manager/gear-manager.component';

//// Strategy
import { FrameworkComponent } from './views/strategy/framework/framework.component';
import { InvestmentsComponent } from './views/strategy/investments/investments.component';
import { InvestmentsModalComponent } from './components/modals/investments-modal/investments-modal.component';
import { InvestmentManagerComponent } from './components/manager-modals/investment-manager/investment-manager.component';

//// Enterprise
import { CapabilitiesModelComponent } from './views/enterprise/capabilities-model/capabilities-model.component';
import { CapabilitiesComponent } from './views/enterprise/capabilities/capabilities.component';
import { CapabilitiesModalComponent } from './components/modals/capabilities-modal/capabilities-modal.component';

import { OrganizationsChartComponent } from './views/enterprise/organizations-chart/organizations-chart.component';
import { OrganizationsComponent } from './views/enterprise/organizations/organizations.component';
import { OrganizationsModalComponent } from './components/modals/organizations-modal/organizations-modal.component';

//// Applications
import { SystemsComponent } from './views/applications/systems/systems.component';
import { SystemsModalComponent } from './components/modals/systems-modal/systems-modal.component';
import { SystemManagerComponent } from './components/manager-modals/system-manager/system-manager.component';
import { AppsComponent } from './views/applications/apps/apps.component';
import { ApplicationsModalComponent } from './components/modals/applications-modal/applications-modal.component';
import { TimeComponent } from './views/applications/time/time.component';
import { AppManagerComponent } from './components/manager-modals/app-manager/app-manager.component';

//// Security
import { FismaComponent } from './views/security/fisma/fisma.component';
import { FismaModalComponent } from './components/modals/fisma-modal/fisma-modal.component';
import { FismaPocsComponent } from './views/security/fisma-pocs/fisma-pocs.component';

//// Technologies
import { ItStandardsComponent } from './views/technologies/it-standards/it-standards.component';
import { ItStandardsModalComponent } from './components/modals/it-standards-modal/it-standards-modal.component';
import { ItStandardManagerComponent } from './components/manager-modals/it-standard-manager/it-standard-manager.component';

//// Enterprise Architecture
import { GInvoicingComponent } from './views/architecture/g-invoicing/g-invoicing.component';

// Global Variables
import { Globals } from './common/globals';

@NgModule({
  declarations: [
    AppComponent,

    TopNavbarComponent,
    SidenavComponent,

    HomeComponent,
    GlobalSearchComponent,
    AboutComponent,
    AssistTechComponent,
    FormsGlossaryComponent,
    GearManagerComponent,

    FrameworkComponent,
    InvestmentsComponent,
    InvestmentsModalComponent,
    InvestmentManagerComponent,

    CapabilitiesModelComponent,
    CapabilitiesComponent,
    CapabilitiesModalComponent,
    OrganizationsChartComponent,
    OrganizationsComponent,
    OrganizationsModalComponent,

    SystemsComponent,
    SystemsModalComponent,
    SystemManagerComponent,
    AppsComponent,
    ApplicationsModalComponent,
    TimeComponent,
    AppManagerComponent,

    FismaComponent,
    FismaModalComponent,
    FismaPocsComponent,

    ItStandardsComponent,
    ItStandardsModalComponent,
    ItStandardManagerComponent,
    
    GInvoicingComponent
  ],
  imports: [
    AppRoutingModule,
    BrowserAnimationsModule,
    BrowserModule,
    FormsModule,
    HttpClientModule,
    NgSelectModule,
    NgxChartsModule,
    PdfViewerModule,
    ReactiveFormsModule,
    SidebarModule.forRoot()
  ],
  providers: [
    Globals
  ],
  bootstrap: [AppComponent]
})

export class AppModule {

  constructor() { }

}
