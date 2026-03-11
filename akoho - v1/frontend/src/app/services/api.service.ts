import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private baseUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  // ─── Races ───
  getRaces(): Observable<any[]> { return this.http.get<any[]>(`${this.baseUrl}/races`); }
  getRace(id: number): Observable<any> { return this.http.get<any>(`${this.baseUrl}/races/${id}`); }
  createRace(data: any): Observable<any> { return this.http.post<any>(`${this.baseUrl}/races`, data); }
  updateRace(id: number, data: any): Observable<any> { return this.http.put<any>(`${this.baseUrl}/races/${id}`, data); }
  deleteRace(id: number): Observable<any> { return this.http.delete<any>(`${this.baseUrl}/races/${id}`); }

  // ─── Clients ───
  getClients(): Observable<any[]> { return this.http.get<any[]>(`${this.baseUrl}/clients`); }
  getClient(id: number): Observable<any> { return this.http.get<any>(`${this.baseUrl}/clients/${id}`); }
  createClient(data: any): Observable<any> { return this.http.post<any>(`${this.baseUrl}/clients`, data); }
  updateClient(id: number, data: any): Observable<any> { return this.http.put<any>(`${this.baseUrl}/clients/${id}`, data); }
  deleteClient(id: number): Observable<any> { return this.http.delete<any>(`${this.baseUrl}/clients/${id}`); }

  // ─── Fournisseurs ───
  getFournisseurs(): Observable<any[]> { return this.http.get<any[]>(`${this.baseUrl}/fournisseurs`); }
  getFournisseur(id: number): Observable<any> { return this.http.get<any>(`${this.baseUrl}/fournisseurs/${id}`); }
  createFournisseur(data: any): Observable<any> { return this.http.post<any>(`${this.baseUrl}/fournisseurs`, data); }
  updateFournisseur(id: number, data: any): Observable<any> { return this.http.put<any>(`${this.baseUrl}/fournisseurs/${id}`, data); }
  deleteFournisseur(id: number): Observable<any> { return this.http.delete<any>(`${this.baseUrl}/fournisseurs/${id}`); }

  // ─── Raisons Mouvements ───
  getRaisonsMouvements(): Observable<any[]> { return this.http.get<any[]>(`${this.baseUrl}/raisons-mouvements`); }
  getRaisonMouvement(id: number): Observable<any> { return this.http.get<any>(`${this.baseUrl}/raisons-mouvements/${id}`); }
  createRaisonMouvement(data: any): Observable<any> { return this.http.post<any>(`${this.baseUrl}/raisons-mouvements`, data); }
  updateRaisonMouvement(id: number, data: any): Observable<any> { return this.http.put<any>(`${this.baseUrl}/raisons-mouvements/${id}`, data); }
  deleteRaisonMouvement(id: number): Observable<any> { return this.http.delete<any>(`${this.baseUrl}/raisons-mouvements/${id}`); }

  // ─── Lots ───
  getLots(): Observable<any[]> { return this.http.get<any[]>(`${this.baseUrl}/lots`); }
  getLotsDetails(): Observable<any[]> { return this.http.get<any[]>(`${this.baseUrl}/lots/details`); }
  getLot(id: number): Observable<any> { return this.http.get<any>(`${this.baseUrl}/lots/${id}`); }
  createLot(data: any): Observable<any> { return this.http.post<any>(`${this.baseUrl}/lots`, data); }
  ecloreLot(id: number, data: any): Observable<any> { return this.http.post<any>(`${this.baseUrl}/lots/${id}/eclore`, data); }
  updateLot(id: number, data: any): Observable<any> { return this.http.put<any>(`${this.baseUrl}/lots/${id}`, data); }
  deleteLot(id: number): Observable<any> { return this.http.delete<any>(`${this.baseUrl}/lots/${id}`); }

  // ─── Lot Mouvements ───
  getLotMouvements(): Observable<any[]> { return this.http.get<any[]>(`${this.baseUrl}/lots-mouvements`); }
  getLotMouvement(id: number): Observable<any> { return this.http.get<any>(`${this.baseUrl}/lots-mouvements/${id}`); }
  getLotMouvementsByLot(idLot: number): Observable<any[]> { return this.http.get<any[]>(`${this.baseUrl}/lots-mouvements/lot/${idLot}`); }
  createLotMouvement(data: any): Observable<any> { return this.http.post<any>(`${this.baseUrl}/lots-mouvements`, data); }
  updateLotMouvement(id: number, data: any): Observable<any> { return this.http.put<any>(`${this.baseUrl}/lots-mouvements/${id}`, data); }
  deleteLotMouvement(id: number): Observable<any> { return this.http.delete<any>(`${this.baseUrl}/lots-mouvements/${id}`); }

  // ─── Oeuf Mouvements ───
  getOeufMouvements(): Observable<any[]> { return this.http.get<any[]>(`${this.baseUrl}/oeufs-mouvements`); }
  getOeufMouvement(id: number): Observable<any> { return this.http.get<any>(`${this.baseUrl}/oeufs-mouvements/${id}`); }
  getOeufMouvementsByLot(idLot: number): Observable<any[]> { return this.http.get<any[]>(`${this.baseUrl}/oeufs-mouvements/lot/${idLot}`); }
  createOeufMouvement(data: any): Observable<any> { return this.http.post<any>(`${this.baseUrl}/oeufs-mouvements`, data); }
  updateOeufMouvement(id: number, data: any): Observable<any> { return this.http.put<any>(`${this.baseUrl}/oeufs-mouvements/${id}`, data); }
  deleteOeufMouvement(id: number): Observable<any> { return this.http.delete<any>(`${this.baseUrl}/oeufs-mouvements/${id}`); }

  // ─── Prix Nourritures ───
  getPrixNourritures(): Observable<any[]> { return this.http.get<any[]>(`${this.baseUrl}/prix-nourritures`); }
  getPrixNourriture(id: number): Observable<any> { return this.http.get<any>(`${this.baseUrl}/prix-nourritures/${id}`); }
  createPrixNourriture(data: any): Observable<any> { return this.http.post<any>(`${this.baseUrl}/prix-nourritures`, data); }
  updatePrixNourriture(id: number, data: any): Observable<any> { return this.http.put<any>(`${this.baseUrl}/prix-nourritures/${id}`, data); }
  deletePrixNourriture(id: number): Observable<any> { return this.http.delete<any>(`${this.baseUrl}/prix-nourritures/${id}`); }

  // ─── Prix Vente Oeufs ───
  getPrixVenteOeufs(): Observable<any[]> { return this.http.get<any[]>(`${this.baseUrl}/prix-vente-oeufs`); }
  getPrixVenteOeuf(id: number): Observable<any> { return this.http.get<any>(`${this.baseUrl}/prix-vente-oeufs/${id}`); }
  createPrixVenteOeuf(data: any): Observable<any> { return this.http.post<any>(`${this.baseUrl}/prix-vente-oeufs`, data); }
  updatePrixVenteOeuf(id: number, data: any): Observable<any> { return this.http.put<any>(`${this.baseUrl}/prix-vente-oeufs/${id}`, data); }
  deletePrixVenteOeuf(id: number): Observable<any> { return this.http.delete<any>(`${this.baseUrl}/prix-vente-oeufs/${id}`); }

  // ─── Prix Vente Poulets ───
  getPrixVentePoulets(): Observable<any[]> { return this.http.get<any[]>(`${this.baseUrl}/prix-vente-poulets`); }
  getPrixVentePoulet(id: number): Observable<any> { return this.http.get<any>(`${this.baseUrl}/prix-vente-poulets/${id}`); }
  createPrixVentePoulet(data: any): Observable<any> { return this.http.post<any>(`${this.baseUrl}/prix-vente-poulets`, data); }
  updatePrixVentePoulet(id: number, data: any): Observable<any> { return this.http.put<any>(`${this.baseUrl}/prix-vente-poulets/${id}`, data); }
  deletePrixVentePoulet(id: number): Observable<any> { return this.http.delete<any>(`${this.baseUrl}/prix-vente-poulets/${id}`); }

  // ─── Configuration Races ───
  getConfigurationRaces(): Observable<any[]> { return this.http.get<any[]>(`${this.baseUrl}/configuration-races`); }
  getConfigurationRacesByRace(idRace: number): Observable<any[]> { return this.http.get<any[]>(`${this.baseUrl}/configuration-races/race/${idRace}`); }
  getConfigurationRace(id: number): Observable<any> { return this.http.get<any>(`${this.baseUrl}/configuration-races/${id}`); }
  createConfigurationRace(data: any): Observable<any> { return this.http.post<any>(`${this.baseUrl}/configuration-races`, data); }
  updateConfigurationRace(id: number, data: any): Observable<any> { return this.http.put<any>(`${this.baseUrl}/configuration-races/${id}`, data); }
  deleteConfigurationRace(id: number): Observable<any> { return this.http.delete<any>(`${this.baseUrl}/configuration-races/${id}`); }

  // ─── Achats Poulets ───
  getAchatsPoulets(): Observable<any[]> { return this.http.get<any[]>(`${this.baseUrl}/achats-poulets`); }
  getAchatPoulet(id: number): Observable<any> { return this.http.get<any>(`${this.baseUrl}/achats-poulets/${id}`); }
  createAchatPoulet(data: any): Observable<any> { return this.http.post<any>(`${this.baseUrl}/achats-poulets`, data); }
  updateAchatPoulet(id: number, data: any): Observable<any> { return this.http.put<any>(`${this.baseUrl}/achats-poulets/${id}`, data); }
  deleteAchatPoulet(id: number): Observable<any> { return this.http.delete<any>(`${this.baseUrl}/achats-poulets/${id}`); }

  // ─── Ventes Poulets ───
  getVentesPoulets(): Observable<any[]> { return this.http.get<any[]>(`${this.baseUrl}/ventes-poulets`); }
  getVentePoulet(id: number): Observable<any> { return this.http.get<any>(`${this.baseUrl}/ventes-poulets/${id}`); }
  createVentePoulet(data: any): Observable<any> { return this.http.post<any>(`${this.baseUrl}/ventes-poulets`, data); }
  updateVentePoulet(id: number, data: any): Observable<any> { return this.http.put<any>(`${this.baseUrl}/ventes-poulets/${id}`, data); }
  deleteVentePoulet(id: number): Observable<any> { return this.http.delete<any>(`${this.baseUrl}/ventes-poulets/${id}`); }
  getVentePouletDetails(): Observable<any[]> { return this.http.get<any[]>(`${this.baseUrl}/ventes-poulets/details/all`); }
  createVentePouletDetail(data: any): Observable<any> { return this.http.post<any>(`${this.baseUrl}/ventes-poulets/details`, data); }
  deleteVentePouletDetail(id: number): Observable<any> { return this.http.delete<any>(`${this.baseUrl}/ventes-poulets/details/${id}`); }

  // ─── Ventes Oeufs ───
  getVentesOeufs(): Observable<any[]> { return this.http.get<any[]>(`${this.baseUrl}/ventes-oeufs`); }
  getVenteOeuf(id: number): Observable<any> { return this.http.get<any>(`${this.baseUrl}/ventes-oeufs/${id}`); }
  createVenteOeuf(data: any): Observable<any> { return this.http.post<any>(`${this.baseUrl}/ventes-oeufs`, data); }
  updateVenteOeuf(id: number, data: any): Observable<any> { return this.http.put<any>(`${this.baseUrl}/ventes-oeufs/${id}`, data); }
  deleteVenteOeuf(id: number): Observable<any> { return this.http.delete<any>(`${this.baseUrl}/ventes-oeufs/${id}`); }
  getVenteOeufDetails(): Observable<any[]> { return this.http.get<any[]>(`${this.baseUrl}/ventes-oeufs/details/all`); }
  createVenteOeufDetail(data: any): Observable<any> { return this.http.post<any>(`${this.baseUrl}/ventes-oeufs/details`, data); }
  deleteVenteOeufDetail(id: number): Observable<any> { return this.http.delete<any>(`${this.baseUrl}/ventes-oeufs/details/${id}`); }

  // ─── Dashboard ───
  getDashboard(dateMin: string, dateMax: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/dashboard?dateMin=${dateMin}&dateMax=${dateMax}`);
  }
}
