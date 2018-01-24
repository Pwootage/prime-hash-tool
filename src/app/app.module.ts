import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';


import {AppComponent} from './app.component';
import {HttpClientModule} from '@angular/common/http';
import {HashFinderService} from '../utils/HashFinderService';
import {FlexLayoutModule} from '@angular/flex-layout';
import {HexPipe} from './hex-pipe.pipe';
import {CommonModule} from '@angular/common';


@NgModule({
  declarations: [
    AppComponent,
    HexPipe
  ],
  imports: [
    BrowserModule,
    CommonModule,
    HttpClientModule,
    FlexLayoutModule
  ],
  providers: [
    HashFinderService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
