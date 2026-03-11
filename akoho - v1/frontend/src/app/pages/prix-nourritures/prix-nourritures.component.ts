import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-prix-nourritures',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './prix-nourritures.component.html',
  styleUrls: ['../shared.css']
})
export class PrixNourrituresComponent implements OnInit {
  items: any[] = [];
  races: any[] = [];
  showModal = false;
  editing = false;
  form = { id: 0, prix: 0, date_reg: '', id_race: 0 };

  constructor(private api: ApiService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.load();
    this.api.getRaces().subscribe(data => {
      this.races = data;
      this.cdr.detectChanges();
    });
  }

  load() {
    this.api.getPrixNourritures().subscribe(data => {
      this.items = data;
      this.cdr.detectChanges();
    });
  }

  openCreate() {
    this.form = { id: 0, prix: 0, date_reg: '', id_race: 0 };
    this.editing = false;
    this.showModal = true;
  }

  openEdit(item: any) {
    this.form = { id: item.id, prix: item.prix, date_reg: item.date_reg?.substring(0, 10) || '', id_race: item.id_race };
    this.editing = true;
    this.showModal = true;
  }

  save() {
    const payload = { prix: this.form.prix, date_reg: this.form.date_reg, id_race: this.form.id_race };
    const obs = this.editing
      ? this.api.updatePrixNourriture(this.form.id, payload)
      : this.api.createPrixNourriture(payload);
    obs.subscribe(() => { this.showModal = false; this.load(); });
  }

  delete(id: number) {
    if (confirm('Supprimer ce prix ?')) {
      this.api.deletePrixNourriture(id).subscribe(() => this.load());
    }
  }

  getRaceName(id: number): string {
    return this.races.find(r => r.id === id)?.libelle || '-';
  }
}
