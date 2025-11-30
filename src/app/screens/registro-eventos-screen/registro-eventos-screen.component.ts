import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { EventosService } from 'src/app/services/eventos.service';
import { FacadeService } from 'src/app/services/facade.service';
// Importa los servicios de maestros/admins si los tienes para llenar el select de responsables
// import { MaestrosService } from 'src/app/services/maestros.service';
// import { AdministradoresService } from 'src/app/services/administradores.service';

@Component({
  selector: 'app-registro-eventos-screen',
  templateUrl: './registro-eventos-screen.component.html',
  styleUrls: ['./registro-eventos-screen.component.scss']
})
export class RegistroEventosScreenComponent implements OnInit {

  public evento: any = {};
  public isUpdate: boolean = false;
  public errors: any = {};
  public idEvento: number = 0;
  
  // Listas para selects
  public lista_tipos = ["Conferencia", "Taller", "Seminario", "Concurso"];
  public lista_programas = [
    "Ingeniería en Ciencias de la Computación",
    "Licenciatura en Ciencias de la Computación",
    "Ingeniería en Tecnologías de la Información"
  ];
  public lista_responsables: any[] = []; // Aquí cargarás maestros y admins

  // Checkboxes de público
  public publico_options = [
    { value: 'Estudiantes', label: 'Estudiantes', checked: false },
    { value: 'Profesores', label: 'Profesores', checked: false },
    { value: 'Publico General', label: 'Público General', checked: false }
  ];

  constructor(
    private location: Location,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private eventosService: EventosService,
    private facadeService: FacadeService
  ) { }

  ngOnInit(): void {
    // 1. Obtener lista de responsables (Simulada o llamar a tus servicios reales)
    this.obtenerResponsables();

    // 2. Verificar si es Editar o Nuevo
    if (this.activatedRoute.snapshot.params['id']) {
      this.isUpdate = true;
      this.idEvento = this.activatedRoute.snapshot.params['id'];
      this.obtenerEvento(this.idEvento);
    } else {
      this.evento = this.eventosService.esquemaEvento();
      this.evento.publico_objetivo = []; 
    }
  }

  public obtenerResponsables() {
    // AQUÍ DEBES LLAMAR A TUS SERVICIOS DE MAESTROS Y ADMINS
    // Por ahora dejaré datos dummy para que funcione la visualización
    this.lista_responsables = [
      { id: 1, nombre: 'Admin Principal' },
      { id: 2, nombre: 'Maestro Yael' },
      { id: 3, nombre: 'Maestra Lupita' }
    ];
  }

  public obtenerEvento(id: number) {
    this.eventosService.obtenerEventoPorID(id).subscribe(
      (response) => {
        this.evento = response;
        // Mapear los checkboxes seleccionados
        this.publico_options.forEach(opt => {
          if (this.evento.publico_objetivo.includes(opt.value)) {
            opt.checked = true;
          }
        });
      }, (error) => {
        alert("No se pudo obtener la información del evento");
      }
    );
  }

  // Detectar cambios en checkboxes
  public checkboxChange(opcion: any) {
    opcion.checked = !opcion.checked;
    if (opcion.checked) {
      this.evento.publico_objetivo.push(opcion.value);
    } else {
      this.evento.publico_objetivo = this.evento.publico_objetivo.filter((item: string) => item !== opcion.value);
    }
    
    // Validar si quitaron "Estudiantes" para limpiar el programa educativo
    if (!this.evento.publico_objetivo.includes('Estudiantes')) {
      this.evento.programa_educativo = '';
    }
  }

  public revisarProgramaEducativo(): boolean {
    // Mostrar solo si 'Estudiantes' está seleccionado
    return this.evento.publico_objetivo.includes('Estudiantes');
  }

  public regresar() {
    this.location.back();
  }

  public registrar() {
    this.errors = this.eventosService.validarEvento(this.evento);
    if (Object.keys(this.errors).length > 0) return;

    this.eventosService.registrarEvento(this.evento).subscribe(
      (response) => {
        alert("Evento registrado correctamente");
        this.router.navigate(['/eventos-academicos']);
      }, (error) => {
        alert("Error al registrar evento");
      }
    );
  }

  public actualizar() {
    this.errors = this.eventosService.validarEvento(this.evento);
    if (Object.keys(this.errors).length > 0) return;

    // Aquí iría el modal de confirmación antes de enviar (Punto 88 del PDF)
    // Por simplicidad, llamamos directo, pero deberías usar tu modal existente
    this.eventosService.actualizarEvento(this.evento).subscribe(
      (response) => {
        alert("Evento actualizado correctamente");
        this.router.navigate(['/eventos-academicos']);
      }, (error) => {
        alert("Error al actualizar evento");
      }
    );
  }
}