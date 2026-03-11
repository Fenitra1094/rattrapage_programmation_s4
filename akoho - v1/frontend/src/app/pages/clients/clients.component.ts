import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './clients.component.html',
  styleUrls: ['../shared.css']
})
export class ClientsComponent implements OnInit {
  items: any[] = [];
  showModal = false;
  editing = false;
  form = { id: 0, nom: '' };

  constructor(private api: ApiService, private cdr: ChangeDetectorRef) {}

  ngOnInit() { this.load(); }

  load() {
    this.api.getClients().subscribe(data => {
      this.items = data;
      this.cdr.detectChanges();
    });
  }

  openCreate() {
    this.form = { id: 0, nom: '' };
    this.editing = false;
    this.showModal = true;
  }

  openEdit(item: any) {
    this.form = { id: item.id, nom: item.nom };
    this.editing = true;
    this.showModal = true;
  }

  save() {
    const obs = this.editing
      ? this.api.updateClient(this.form.id, { nom: this.form.nom })
      : this.api.createClient({ nom: this.form.nom });
    obs.subscribe(() => { this.showModal = false; this.load(); });
  }

  delete(id: number) {
    if (confirm('Supprimer ce client ?')) {
      this.api.deleteClient(id).subscribe(() => this.load());
    }
  }
}
