import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DestinationListComponent } from './destination-list/destination-list.component';
import { DestinationFormComponent } from './destination-form/destination-form.component';

const routes: Routes = [
  { path: '', component: DestinationListComponent },
  { path: 'add', component: DestinationFormComponent },
  { path: 'edit/:id', component: DestinationFormComponent },
  { path: 'view/:id', component: DestinationFormComponent, data: { viewOnly: true } }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DestinationsRoutingModule { }
