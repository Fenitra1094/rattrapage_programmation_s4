import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent) },
  { path: 'races', loadComponent: () => import('./pages/races/races.component').then(m => m.RacesComponent) },
  { path: 'clients', loadComponent: () => import('./pages/clients/clients.component').then(m => m.ClientsComponent) },
  { path: 'fournisseurs', loadComponent: () => import('./pages/fournisseurs/fournisseurs.component').then(m => m.FournisseursComponent) },
  { path: 'raisons-mouvements', loadComponent: () => import('./pages/raisons-mouvements/raisons-mouvements.component').then(m => m.RaisonsMouvementsComponent) },
  { path: 'lots', loadComponent: () => import('./pages/lots/lots.component').then(m => m.LotsComponent) },
  { path: 'lots-mouvements', loadComponent: () => import('./pages/lots-mouvements/lots-mouvements.component').then(m => m.LotsMouvementsComponent) },
  { path: 'oeufs-mouvements', loadComponent: () => import('./pages/oeufs-mouvements/oeufs-mouvements.component').then(m => m.OeufsMouvementsComponent) },
  { path: 'prix-nourritures', loadComponent: () => import('./pages/prix-nourritures/prix-nourritures.component').then(m => m.PrixNourrituresComponent) },
  { path: 'prix-vente-oeufs', loadComponent: () => import('./pages/prix-vente-oeufs/prix-vente-oeufs.component').then(m => m.PrixVenteOeufsComponent) },
  { path: 'prix-vente-poulets', loadComponent: () => import('./pages/prix-vente-poulets/prix-vente-poulets.component').then(m => m.PrixVentePouletsComponent) },
  { path: 'configuration-races', loadComponent: () => import('./pages/configuration-races/configuration-races.component').then(m => m.ConfigurationRacesComponent) },
  { path: 'achats-poulets', loadComponent: () => import('./pages/achats-poulets/achats-poulets.component').then(m => m.AchatsPouletsComponent) },
  { path: 'ventes-poulets', loadComponent: () => import('./pages/ventes-poulets/ventes-poulets.component').then(m => m.VentesPouletsComponent) },
  { path: 'ventes-oeufs', loadComponent: () => import('./pages/ventes-oeufs/ventes-oeufs.component').then(m => m.VentesOeufsComponent) },
];
