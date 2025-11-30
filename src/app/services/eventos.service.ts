import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FacadeService } from './facade.service';
import { ErrorsService } from './tools/errors.service';
import { ValidatorService } from './tools/validator.service';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
};

@Injectable({
  providedIn: 'root'
})
export class EventosService {

  constructor(
    private http: HttpClient,
    private validatorService: ValidatorService,
    private errorService: ErrorsService,
    private facadeService: FacadeService
  ) { }

  public esquemaEvento() {
    return {
      nombre: '',
      tipo: '',
      fecha_realizacion: '',
      hora_inicio: '',
      hora_fin: '',
      lugar: '',
      publico_objetivo: [], // Array para checkboxes
      programa_educativo: '',
      responsable: '',
      descripcion: '',
      cupo: ''
    };
  }

  // Validaciones
  public validarEvento(data: any) {
    console.log('Validando evento... ', data);
    let error: any = [];

    // 2. Nombre del evento: Solo letras, números y espacios
    if (!this.validatorService.required(data['nombre'])) {
      error['nombre'] = this.errorService.required;
    } else if (!/^[a-zA-Z0-9\s]+$/.test(data['nombre'])) {
      error['nombre'] = 'Solo se permiten letras, números y espacios';
    }

    // 3. Tipo de evento
    if (!this.validatorService.required(data['tipo'])) {
      error['tipo'] = this.errorService.required;
    }

    // 4. Fecha de realización
    if (!this.validatorService.required(data['fecha_realizacion'])) {
      error['fecha_realizacion'] = this.errorService.required;
    } else {
      // Validar que no sea anterior a hoy
      const fechaEvento = new Date(data['fecha_realizacion']);
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0); // Resetear hora para comparar solo fecha
      if (fechaEvento < hoy) {
        error['fecha_realizacion'] = 'No se pueden seleccionar fechas anteriores al día actual';
      }
    }

    // 5. Horario
    if (!this.validatorService.required(data['hora_inicio'])) {
      error['hora_inicio'] = this.errorService.required;
    }
    if (!this.validatorService.required(data['hora_fin'])) {
      error['hora_fin'] = this.errorService.required;
    }
    if (data['hora_inicio'] && data['hora_fin']) {
      if (data['hora_inicio'] >= data['hora_fin']) {
        error['hora_fin'] = 'La hora de inicio debe ser menor que la hora de finalización';
      }
    }

    // 6. Lugar: Alfanuméricos y espacios
    if (!this.validatorService.required(data['lugar'])) {
      error['lugar'] = this.errorService.required;
    } else if (!/^[a-zA-Z0-9\s]+$/.test(data['lugar'])) {
      error['lugar'] = 'Solo caracteres alfanuméricos y espacios';
    }

    // 7. Público objetivo (Validar que al menos uno esté seleccionado si es array)
    if (!data['publico_objetivo'] || data['publico_objetivo'].length === 0) {
      error['publico_objetivo'] = 'Debe seleccionar al menos un público objetivo';
    }

    // 8. Programa educativo (Solo si "Estudiantes" está seleccionado)
    // Asumimos que "Estudiantes" es una opción dentro del array o boolean
    if (data['publico_objetivo'].includes('Estudiantes')) {
      if (!this.validatorService.required(data['programa_educativo'])) {
        error['programa_educativo'] = this.errorService.required;
      }
    }

    // 9. Responsable
    if (!this.validatorService.required(data['responsable'])) {
      error['responsable'] = this.errorService.required;
    }

    // 10. Descripción breve: Max 300 caracteres
    if (!this.validatorService.required(data['descripcion'])) {
      error['descripcion'] = this.errorService.required;
    } else if (!this.validatorService.max(data['descripcion'], 300)) {
      error['descripcion'] = this.errorService.max(300);
    }

    // 11. Cupo máximo: Enteros positivos, 3 dígitos (max 999)
    if (!this.validatorService.required(data['cupo'])) {
      error['cupo'] = this.errorService.required;
    } else if (!this.validatorService.numeric(data['cupo'])) {
      error['cupo'] = this.errorService.numeric;
    } else if (parseInt(data['cupo']) <= 0) {
      error['cupo'] = 'Debe ser un número positivo';
    } else if (data['cupo'].toString().length > 3) {
      error['cupo'] = 'Máximo 3 dígitos';
    }

    return error;
  }

  // --- Servicios HTTP ---

  public registrarEvento(data: any): Observable<any> {
    const token = this.facadeService.getSessionToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    });
    return this.http.post<any>(`${environment.url_api}/eventos/`, data, { headers });
  }

  public obtenerListaEventos(): Observable<any> {
    const token = this.facadeService.getSessionToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    });
    return this.http.get<any>(`${environment.url_api}/eventos/`, { headers });
  }

  public obtenerEventoPorID(id: number): Observable<any> {
    const token = this.facadeService.getSessionToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    });
    return this.http.get<any>(`${environment.url_api}/eventos/?id=${id}`, { headers });
  }

  public actualizarEvento(data: any): Observable<any> {
    const token = this.facadeService.getSessionToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    });
    return this.http.put<any>(`${environment.url_api}/eventos/`, data, { headers });
  }

  public eliminarEvento(id: number): Observable<any> {
    const token = this.facadeService.getSessionToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    });
    return this.http.delete<any>(`${environment.url_api}/eventos/?id=${id}`, { headers });
  }
}