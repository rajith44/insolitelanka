import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';

import { SharedModule } from '../../shared/shared.module';
import { TourCategoriesRoutingModule } from './tour-categories-routing.module';
import { TourCategoryListComponent } from './tour-category-list/tour-category-list.component';
import { TourCategoryFormComponent } from './tour-category-form/tour-category-form.component';

@NgModule({
  declarations: [
    TourCategoryListComponent,
    TourCategoryFormComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
    SharedModule,
    TourCategoriesRoutingModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class TourCategoriesModule { }
