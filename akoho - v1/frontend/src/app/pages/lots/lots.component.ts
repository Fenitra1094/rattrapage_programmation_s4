import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-lots',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './lots.component.html',
  styleUrls: ['../shared.css']
})
export class LotsComponent implements OnInit {
  items: any[] = [];
  races: any[] = [];
  fournisseurs: any[] = [];
  showModal = false;
  editing = false;
  form = {
    id: 0,
    date_arrivee: '',
    poids_initial: 0,
    age: 0,
    id_race: 0,
    // Champs optionnels pour l'achat initial
    quantite: null as number | null,
    prix_unitaire: null as number | null,
    id_fournisseur: null as number | null
  };

  constructor(private api: ApiService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.load();
    this.api.getRaces().subscribe(data => {
      this.races = data;
      this.cdr.detectChanges();
    });
    this.api.getFournisseurs().subscribe(data => {
      this.fournisseurs = data;
      this.cdr.detectChanges();
    });
  }

  load() {
    this.api.getLots().subscribe(data => {
      this.items = data;
      this.cdr.detectChanges();
    });
  }

  openCreate() {
    this.form = {
      id: 0,
      date_arrivee: '',
      age: 0,
      poids_initial: 0,
      id_race: 0,
      quantite: null,
      prix_unitaire: null,
      id_fournisseur: null
    };
    this.editing = false;
    this.showModal = true;
  }

  openEdit(item: any) {
    this.form = {
      id: item.id,
      date_arrivee: item.date_arrivee?.substring(0, 10) || '',
      age: item.age,
      poids_initial: item.poids_initial,
      id_race: item.id_race,
      // Pas de modification d'achat en mode édition
      quantite: null,
      prix_unitaire: null,
      id_fournisseur: null
    };
    this.editing = true;
    this.showModal = true;
  }

  save() {
    if (this.editing) {
      // En mode édition, ne pas envoyer les champs d'achat
      const payload = {
        date_arrivee: this.form.date_arrivee,
        age: this.form.age,
        poids_initial: this.form.poids_initial,
        id_race: this.form.id_race
      };
      this.api.updateLot(this.form.id, payload).subscribe(() => {
        this.showModal = false;
        this.load();
      });
    } else {
      // En mode création, envoyer les champs d'achat s'ils sont remplis
      const payload: any = {
        date_arrivee: this.form.date_arrivee,
        age: this.form.age,
        poids_initial: this.form.poids_initial,
        id_race: this.form.id_race
      };

      // Ajouter les champs d'achat si tous sont remplis
      if (this.form.quantite && this.form.prix_unitaire && this.form.id_fournisseur) {
        payload.quantite = this.form.quantite;
        payload.prix_unitaire = this.form.prix_unitaire;
        payload.id_fournisseur = this.form.id_fournisseur;
      }

      console.log(payload);

      this.api.createLot(payload).subscribe(() => {
        this.showModal = false;
        this.load();
      });
    }
  }

  delete(id: number) {
    if (confirm('Supprimer ce lot ?')) {
      this.api.deleteLot(id).subscribe(() => this.load());
    }
  }

  getRaceName(id_race: number): string {
    return this.races.find(r => r.id === id_race)?.libelle || '-';
  }
}
