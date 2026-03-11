import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-configuration-races',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './configuration-races.component.html',
  styleUrls: ['../shared.css']
})
export class ConfigurationRacesComponent implements OnInit {
  items: any[] = [];
  races: any[] = [];
  showModal = false;
  editing = false;
  form = { id: 0, num_semaine: 0, consommation_nourriture: 0, augmentation_poids: 0, id_race: 0 };

  constructor(private api: ApiService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.load();
    this.api.getRaces().subscribe(data => {
      this.races = data;
      this.cdr.detectChanges();
    });
  }

  load() {
    this.api.getConfigurationRaces().subscribe(data => {
      this.items = data;
      this.cdr.detectChanges();
    });
  }

  openCreate() {
    this.form = { id: 0, num_semaine: 0, consommation_nourriture: 0, augmentation_poids: 0, id_race: 0 };
    this.editing = false;
    this.showModal = true;
  }

  openEdit(item: any) {
    this.form = {
      id: item.id,
      num_semaine: item.num_semaine,
      consommation_nourriture: item.consommation_nourriture,
      augmentation_poids: item.augmentation_poids,
      id_race: item.id_race
    };
    this.editing = true;
    this.showModal = true;
  }

  save() {
    const { id, ...payload } = this.form;
    const obs = this.editing
      ? this.api.updateConfigurationRace(id, payload)
      : this.api.createConfigurationRace(payload);
    obs.subscribe(() => { this.showModal = false; this.load(); });
  }

  delete(id: number) {
    if (confirm('Supprimer cette configuration ?')) {
      this.api.deleteConfigurationRace(id).subscribe(() => this.load());
    }
  }

  getRaceName(id: number): string {
    return this.races.find(r => r.id === id)?.libelle || '-';
  }
}
