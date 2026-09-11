import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/bolsillos/dashboard/dashboard').then((m) => m.DashboardPage),
  },
  { path: '**', redirectTo: '' },
];