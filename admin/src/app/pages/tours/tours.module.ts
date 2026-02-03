import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';

import { SharedModule } from '../../shared/shared.module';
import { ToursRoutingModule } from './tours-routing.module';
import { TourListComponent } from './tour-list/tour-list.component';
import { TourFormComponent } from './tour-form/tour-form.component';

@NgModule({
  declarations: [
    TourListComponent,
    TourFormComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
    CKEditorModule,
    SharedModule,
    ToursRoutingModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ToursModule { }
