import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';

import { SharedModule } from '../../shared/shared.module';
import { DestinationsRoutingModule } from './destinations-routing.module';
import { DestinationListComponent } from './destination-list/destination-list.component';
import { DestinationFormComponent } from './destination-form/destination-form.component';

@NgModule({
  declarations: [
    DestinationListComponent,
    DestinationFormComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
    CKEditorModule,
    SharedModule,
    DestinationsRoutingModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class DestinationsModule { }
