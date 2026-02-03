import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TourListComponent } from './tour-list/tour-list.component';
import { TourFormComponent } from './tour-form/tour-form.component';

const routes: Routes = [
  { path: '', component: TourListComponent },
  { path: 'add', component: TourFormComponent },
  { path: 'edit/:id', component: TourFormComponent },
  { path: 'view/:id', component: TourFormComponent, data: { viewOnly: true } }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ToursRoutingModule { }
