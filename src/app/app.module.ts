import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from './common/modules/material/material.module';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { DocComponentDashboardComponent } from './features/doc-component-dashboard/doc-component-dashboard.component';
import { CkeditorComponent } from './features/ckeditor/ckeditor.component';
import { FormsModule } from '@angular/forms';
import { SafeHtmlPipe } from './common/pipes/safe-html.pipe';
@NgModule({
  declarations: [
    AppComponent,
    DocComponentDashboardComponent,
    CkeditorComponent,
    SafeHtmlPipe
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MaterialModule,
    CKEditorModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
