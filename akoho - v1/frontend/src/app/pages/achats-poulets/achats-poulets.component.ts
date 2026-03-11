import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-achats-poulets',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './achats-poulets.component.html',
  styleUrls: ['../shared.css']
})
export class AchatsPouletsComponent implements OnInit {
  items: any[] = [];
  lots: any[] = [];
  fournisseurs: any[] = [];
  showModal = false;
  editing = false;
  form = { id: 0, quantite: 0, prix_unitaire: 0, date_reg: '', id_fournisseur: 0, id_lot: 0 };

  constructor(private api: ApiService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.load();
    this.api.getLots().subscribe(data => {
      this.lots = data;
      this.cdr.detectChanges();
    });
    this.api.getFournisseurs().subscribe(data => {
      this.fournisseurs = data;
      this.cdr.detectChanges();
    });
  }

  load() {
    this.api.getAchatsPoulets().subscribe(data => {
      this.items = data;
      this.cdr.detectChanges();
    });
  }

  openCreate() {
    this.form = { id: 0, quantite: 0, prix_unitaire: 0, date_reg: '', id_fournisseur: 0, id_lot: 0 };
    this.editing = false;
    this.showModal = true;
  }

  openEdit(item: any) {
    this.form = {
      id: item.id,
      quantite: item.quantite,
      prix_unitaire: item.prix_unitaire,
      date_reg: item.date_reg?.substring(0, 10) || '',
      id_fournisseur: item.id_fournisseur,
      id_lot: item.id_lot
    };
    this.editing = true;
    this.showModal = true;
  }

  save() {
    const { id, ...payload } = this.form;
    const obs = this.editing
      ? this.api.updateAchatPoulet(id, payload)
      : this.api.createAchatPoulet(payload);
    obs.subscribe(() => { this.showModal = false; this.load(); });
  }

  delete(id: number) {
    if (confirm('Supprimer cet achat ?')) {
      this.api.deleteAchatPoulet(id).subscribe(() => this.load());
    }
  }
}
