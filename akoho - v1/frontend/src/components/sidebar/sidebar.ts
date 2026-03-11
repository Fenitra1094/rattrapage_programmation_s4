import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface NavGroup {
  label: string;
  items: { label: string; route: string }[];
}

@Component({
  selector: 'sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css']
})
export class Sidebar {
  collapsed = false;

  navGroups: NavGroup[] = [
    {
      label: 'Tableau de bord',
      items: [
        { label: 'Dashboard', route: '/dashboard' },
      ]
    },
    {
      label: 'Références',
      items: [
        { label: 'Races', route: '/races' },
        { label: 'Clients', route: '/clients' },
        { label: 'Fournisseurs', route: '/fournisseurs' },
        { label: 'Raisons Mouvements', route: '/raisons-mouvements' },
      ]
    },
    {
      label: 'Lots',
      items: [
        { label: 'Lots', route: '/lots' },
        { label: 'Mouvements Poulets', route: '/lots-mouvements' },
        { label: 'Mouvements Oeufs', route: '/oeufs-mouvements' },
      ]
    },
    {
      label: 'Prix',
      items: [
        { label: 'Prix Nourriture', route: '/prix-nourritures' },
        { label: 'Prix Vente Oeufs', route: '/prix-vente-oeufs' },
        { label: 'Prix Vente Poulets', route: '/prix-vente-poulets' },
      ]
    },
    {
      label: 'Configuration',
      items: [
        { label: 'Configuration Races', route: '/configuration-races' },
      ]
    },
    {
      label: 'Transactions',
      items: [
        { label: 'Achats Poulets', route: '/achats-poulets' },
        { label: 'Ventes Poulets', route: '/ventes-poulets' },
        { label: 'Ventes Oeufs', route: '/ventes-oeufs' },
      ]
    }
  ];

  toggle() {
    this.collapsed = !this.collapsed;
  }
}
