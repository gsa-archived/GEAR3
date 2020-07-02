import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { SidebarModule } from 'ng-sidebar';  // Sidebar Module
import { PdfViewerModule } from 'ng2-pdf-viewer';  // PDF Viewer

// Components
import { TopNavbarComponent } from './components/top-navbar/top-navbar.component';
import { SidenavComponent } from './components/sidenav/sidenav.component';

//// Main
import { HomeComponent } from './main/home/home.component';
import { GlobalSearchComponent } from './main/global-search/global-search.component';
import { AboutComponent } from './main/about/about.component';
import { AssistTechComponent } from './main/assist-tech/assist-tech.component';
import { FormsGlossaryComponent } from './main/forms-glossary/forms-glossary.component';
import { GearManagerComponent } from './main/gear-manager/gear-manager.component';

//// Strategy
import { FrameworkComponent } from './strategy/framework/framework.component';
import { InvestmentsComponent } from './strategy/investments/investments.component';
import { InvestmentsModalComponent } from './components/modals/investments-modal/investments-modal.component';

//// Enterprise
import { CapabilitiesModelComponent } from './enterprise/capabilities-model/capabilities-model.component';
import { CapabilitiesComponent } from './enterprise/capabilities/capabilities.component';
import { CapabilitiesModalComponent } from './components/modals/capabilities-modal/capabilities-modal.component';

import { OrganizationsChartComponent } from './enterprise/organizations-chart/organizations-chart.component';
import { OrganizationsComponent } from './enterprise/organizations/organizations.component';
import { OrganizationsModalComponent } from './components/modals/organizations-modal/organizations-modal.component';

//// Applications
import { SystemsComponent } from './applications/systems/systems.component';
import { SystemsModalComponent } from './components/modals/systems-modal/systems-modal.component';
import { AppsComponent } from './applications/apps/apps.component';
import { ApplicationsModalComponent } from './components/modals/applications-modal/applications-modal.component';
import { TimeComponent } from './applications/time/time.component';

//// Security
import { FismaComponent } from './security/fisma/fisma.component';
import { FismaModalComponent } from './components/modals/fisma-modal/fisma-modal.component';
import { FismaPocsComponent } from './security/fisma-pocs/fisma-pocs.component';

// Technologies
import { ItStandardsComponent } from './technologies/it-standards/it-standards.component';
import { StandardsModalComponent } from './components/modals/standards-modal/standards-modal.component';

// Services
import { ModalsService } from './services/modals/modals.service';
import { SharedService } from './services/shared/shared.service';

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

    CapabilitiesModelComponent,
    CapabilitiesComponent,
    CapabilitiesModalComponent,
    OrganizationsChartComponent,
    OrganizationsComponent,
    OrganizationsModalComponent,

    SystemsComponent,
    SystemsModalComponent,
    AppsComponent,
    ApplicationsModalComponent,
    TimeComponent,

    FismaComponent,
    FismaModalComponent,
    FismaPocsComponent,

    ItStandardsComponent,
    StandardsModalComponent
  ],
  imports: [
    AppRoutingModule,
    BrowserModule,
    FormsModule,
    HttpClientModule,
    PdfViewerModule,
    SidebarModule.forRoot()
  ],
  providers: [
    Globals,
    ModalsService,
    SharedService
  ],
  bootstrap: [AppComponent]
})

export class AppModule {

  constructor() { }

}
