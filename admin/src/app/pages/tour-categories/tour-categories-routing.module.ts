import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TourCategoryListComponent } from './tour-category-list/tour-category-list.component';
import { TourCategoryFormComponent } from './tour-category-form/tour-category-form.component';

const routes: Routes = [
  { path: '', component: TourCategoryListComponent },
  { path: 'add', component: TourCategoryFormComponent },
  { path: 'edit/:id', component: TourCategoryFormComponent },
  { path: 'view/:id', component: TourCategoryFormComponent, data: { viewOnly: true } }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TourCategoriesRoutingModule { }
