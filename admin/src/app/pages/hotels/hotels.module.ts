import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';

import { SharedModule } from '../../shared/shared.module';
import { HotelsRoutingModule } from './hotels-routing.module';
import { HotelListComponent } from './hotel-list/hotel-list.component';
import { HotelFormComponent } from './hotel-form/hotel-form.component';

@NgModule({
  declarations: [
    HotelListComponent,
    HotelFormComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CKEditorModule,
    SharedModule,
    HotelsRoutingModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class HotelsModule { }
