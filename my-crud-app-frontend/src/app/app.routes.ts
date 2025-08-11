
import { Routes } from '@angular/router';

import { HomeComponent } from './home/home.component';
import { FormComponent } from './form/form.component';
// import { EditFormComponent } from './edit-form/edit-form.component';
export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'form', component: FormComponent },
  {
    path: 'form/:empID',
    loadChildren: () =>
      import('./edit-form/edit-form.routes').then(m => m.EDIT_FORM_ROUTES)
  }, 
  { path: '**', redirectTo: '' }
];
