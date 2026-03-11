import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-oeufs-mouvements',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './oeufs-mouvements.component.html',
  styleUrls: ['../shared.css']
})
export class OeufsMouvementsComponent implements OnInit {
  items: any[] = [];
  lots: any[] = [];
  raisons: any[] = [];
  showModal = false;
  showEclosionModal = false;
  editing = false;
  form = { id: 0, date_reg: '', quantite: 0, reference: '', remarque: '', id_lot: 0, id_raison_mouvement: 0 };
  eclosionForm = {id: 0, quantite_oeufs: 0, date_eclosion: ''};

  constructor(private api: ApiService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.load();
    this.api.getLots().subscribe(data => {
      this.lots = data;
      this.cdr.detectChanges();
    });
    this.api.getRaisonsMouvements().subscribe(data => {
      this.raisons = data;
      this.cdr.detectChanges();
    });
  }

  load() {
    this.api.getOeufMouvements().subscribe(data => {
      this.items = data;
      this.cdr.detectChanges();
    });
  }

  openCreate() {
    this.form = { id: 0, date_reg: '', quantite: 0, reference: '', remarque: '', id_lot: 0, id_raison_mouvement: 0 };
    this.editing = false;
    this.showModal = true;
  }

  openEclosion()
  {
    this.editing = false;
    this.eclosionForm = {id: 0, quantite_oeufs: 0, date_eclosion: ''};
    this.showEclosionModal = true;
  }

  openEdit(item: any) {
    this.form = {
      id: item.id,
      date_reg: item.date_reg?.substring(0, 10) || '',
      quantite: item.quantite,
      reference: item.reference || '',
      remarque: item.remarque || '',
      id_lot: item.id_lot,
      id_raison_mouvement: item.id_raison_mouvement
    };
    this.editing = true;
    this.showModal = true;
  }

  save() {
    const { id, ...payload } = this.eclosionForm ;
    const obs = this.editing
      ? this.api.updateOeufMouvement(id, payload)
      : this.api.createOeufMouvement(payload);
    obs.subscribe(() => { this.showModal = false; this.load(); });
  }

  saveEclosion() {
    const { id, ...payload } = this.eclosionForm;
    console.log("Eclosion form payload",payload);
    this.api.ecloreLot(id, payload).subscribe(()=> { this.showEclosionModal = false; this.load(); })
  }

  delete(id: number) {
    if (confirm('Supprimer ce mouvement ?')) {
      this.api.deleteOeufMouvement(id).subscribe(() => this.load());
    }
  }

  getRaisonLabel(id: number): string {
    return this.raisons.find(r => r.id === id)?.libelle || '-';
  }
}
