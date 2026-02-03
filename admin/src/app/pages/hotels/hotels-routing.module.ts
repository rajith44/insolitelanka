import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HotelListComponent } from './hotel-list/hotel-list.component';
import { HotelFormComponent } from './hotel-form/hotel-form.component';

const routes: Routes = [
  { path: '', component: HotelListComponent },
  { path: 'add', component: HotelFormComponent },
  { path: 'edit/:id', component: HotelFormComponent },
  { path: 'view/:id', component: HotelFormComponent, data: { viewOnly: true } }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HotelsRoutingModule { }
