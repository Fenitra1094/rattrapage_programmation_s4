import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-ventes-poulets',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ventes-poulets.component.html',
  styleUrls: ['../shared.css']
})
export class VentesPouletsComponent implements OnInit {
  items: any[] = [];
  clients: any[] = [];
  lots: any[] = [];
  showModal = false;
  form = { date_reg: '', id_client: 0, details: [{ quantite: 0, id_lot: 0 }] };

  constructor(private api: ApiService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.load();
    this.api.getClients().subscribe(data => {
      this.clients = data;
      this.cdr.detectChanges();
    });
    this.api.getLots().subscribe(data => {
      this.lots = data;
      this.cdr.detectChanges();
    });
  }

  load() {
    this.api.getVentesPoulets().subscribe(data => {
      this.items = data;
      this.cdr.detectChanges();
    });
  }

  openCreate() {
    this.form = { date_reg: '', id_client: 0, details: [{ quantite: 0, id_lot: 0 }] };
    this.showModal = true;
  }

  addDetail() {
    this.form.details.push({ quantite: 0, id_lot: 0 });
  }

  removeDetail(i: number) {
    if (this.form.details.length > 1) {
      this.form.details.splice(i, 1);
    }
  }

  save() {
    this.api.createVentePoulet(this.form).subscribe(() => {
      this.showModal = false;
      this.load();
    });
  }

  delete(id: number) {
    if (confirm('Supprimer cette vente et tous ses détails ?')) {
      this.api.deleteVentePoulet(id).subscribe(() => this.load());
    }
  }
}
