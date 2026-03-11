import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-raisons-mouvements',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './raisons-mouvements.component.html',
  styleUrls: ['../shared.css']
})
export class RaisonsMouvementsComponent implements OnInit {
  items: any[] = [];
  showModal = false;
  editing = false;
  form = { id: 0, libelle: '' };

  constructor(private api: ApiService, private cdr: ChangeDetectorRef) {}

  ngOnInit() { this.load(); }

  load() {
    this.api.getRaisonsMouvements().subscribe(data => {
      this.items = data;
      this.cdr.detectChanges();
    });
  }

  openCreate() {
    this.form = { id: 0, libelle: '' };
    this.editing = false;
    this.showModal = true;
  }

  openEdit(item: any) {
    this.form = { id: item.id, libelle: item.libelle };
    this.editing = true;
    this.showModal = true;
  }

  save() {
    const obs = this.editing
      ? this.api.updateRaisonMouvement(this.form.id, { libelle: this.form.libelle })
      : this.api.createRaisonMouvement({ libelle: this.form.libelle });
    obs.subscribe(() => { this.showModal = false; this.load(); });
  }

  delete(id: number) {
    if (confirm('Supprimer cette raison ?')) {
      this.api.deleteRaisonMouvement(id).subscribe(() => this.load());
    }
  }
}
