import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// Sidebar Module
import { SidebarModule } from 'ng-sidebar';

// Font Awesome Icons
import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faCogs } from '@fortawesome/free-solid-svg-icons';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { faPuzzlePiece } from '@fortawesome/free-solid-svg-icons';
import { faLaptop } from '@fortawesome/free-solid-svg-icons';

// Components
import { TopNavbarComponent } from './components/top-navbar/top-navbar.component';
import { AboutComponent } from './about/about.component';
import { AssistTechComponent } from './assist-tech/assist-tech.component';
import { HomeComponent } from './home/home.component';

@NgModule({
  declarations: [
    AppComponent,
    TopNavbarComponent,
    AboutComponent,
    AssistTechComponent,
    HomeComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    SidebarModule.forRoot(),
    FontAwesomeModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})

export class AppModule {
  // Import used Font Awesome Icons. Add to this list if a desired icon needs to be used. If none of the icons are working, that means one of the icons are no longer in the package.
  constructor(library: FaIconLibrary) {
    // Add icon to the library for convenient access in other components
    library.addIcons(faCogs);
    library.addIcons(faSearch);
    library.addIcons(faPuzzlePiece);
    library.addIcons(faLaptop);
  }
}
