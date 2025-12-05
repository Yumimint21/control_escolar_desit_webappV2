import { Component, OnInit, ViewChild } from '@angular/core'; 
import { NgForm } from '@angular/forms';
import { Location } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { EventosService } from 'src/app/services/eventos.service';
import { FacadeService } from 'src/app/services/facade.service';
import { MaestrosService } from 'src/app/services/maestros.service';
import { AdministradoresService } from 'src/app/services/administradores.service';
import { EditarEventoModalComponent } from 'src/app/modals/editar-evento-modal/editar-evento-modal.component';

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
  
  // Listas para los Selects
  public lista_tipos = ["Conferencia", "Taller", "Seminario", "Concurso"];
  public lista_programas = [
    "Ingeniería en Ciencias de la Computación",
    "Licenciatura en Ciencias de la Computación",
    "Ingeniería en Tecnologías de la Información"
  ];
  
  // Lista dinámica de responsables
  public lista_responsables: any[] = [];

  // Opciones para checkboxes
  public lista_publico = ["Estudiantes", "Profesores", "Público General"];
  public publico_options: any[] = [];

  public minDate: Date = new Date();
@ViewChild('myForm') myForm!: NgForm;

  constructor(
    private location: Location,
    private router: Router,
    public activatedRoute: ActivatedRoute,
    private eventosService: EventosService,
    private facadeService: FacadeService,
    private maestrosService: MaestrosService, 
    private administradoresService: AdministradoresService, 
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    const rol = this.facadeService.getUserGroup();
    if (rol !== 'administrador') {
      alert("Acceso denegado. Solo los administradores pueden registrar eventos.");
      this.router.navigate(['/home']);
      return; 
    }

    this.obtenerResponsables(); 
    this.initPublicoOptions();  
   
    // Detectar si es edición
    if (this.activatedRoute.snapshot.params['id'] != undefined) {
      this.isUpdate = true;
      this.idEvento = +this.activatedRoute.snapshot.params['id'];


      this.eventosService.obtenerEventoPorID(this.idEvento).subscribe(
        (response) => {
          this.evento = response;

          if (response.fecha_realizacion) {
            this.evento.fecha_realizacion = new Date(response.fecha_realizacion + 'T00:00:00');
          }

          if (response.hora_inicio) {
            this.evento.hora_inicio = response.hora_inicio.slice(0, 5);
          }
          if (response.hora_fin) {
            this.evento.hora_fin = response.hora_fin.slice(0, 5);
          }

          this.marcarCheckboxesSeleccionados();
        },
        (error) => {
          alert("No se pudo obtener la información del evento");
        }
      );
    } else {
      this.evento = this.eventosService.esquemaEvento();
      this.evento.publico_objetivo = []; 
    }
  }

  public obtenerResponsables() {
    this.maestrosService.obtenerListaMaestros().subscribe(
      (maestros) => {
        this.lista_responsables.push(...maestros);
      },
      (error) => console.error("Error al obtener maestros", error)
    );

    this.administradoresService.obtenerListaAdmins().subscribe(
      (admins) => {
        this.lista_responsables.push(...admins);
      },
      (error) => console.error("Error al obtener admins", error)
    );
  }

  private initPublicoOptions() {
    this.publico_options = this.lista_publico.map(opcion => ({
      label: opcion,
      checked: false
    }));
  }

  public checkboxChange(opcion: any) {
    opcion.checked = !opcion.checked;

    this.evento.publico_objetivo = this.publico_options
      .filter(o => o.checked)
      .map(o => o.label);
  }


  private marcarCheckboxesSeleccionados() {
    if (this.evento.publico_objetivo) {
      this.publico_options.forEach(opt => {
        if (this.evento.publico_objetivo.includes(opt.label)) {
          opt.checked = true;
        }
      });
    }
  }


  public revisarProgramaEducativo(): boolean {
    return this.evento.publico_objetivo && this.evento.publico_objetivo.includes("Estudiantes");
  }


  public validarTextoNumeros(event: any) {
    const pattern = /[a-zA-Z0-9ñÑáéíóúÁÉÍÓÚ\s]/;
    const inputChar = String.fromCharCode(event.charCode);

    if (!pattern.test(inputChar)) {
      event.preventDefault();
    }
  }

  // Letras, Números, Espacios y Signos de Puntuación Básicos
  public validarDescripcion(event: any) {
    const pattern = /[a-zA-Z0-9ñÑáéíóúÁÉÍÓÚ\s.,;:!¡?¿()"'\-_]/;
    const inputChar = String.fromCharCode(event.charCode);

    if (!pattern.test(inputChar)) {
      event.preventDefault();
    }
  }

  public validarCupo(event: any) {
    const inputChar = String.fromCharCode(event.charCode);
    if (!/^\d+$/.test(inputChar)) {
      event.preventDefault();
      return;
    }


    const input = event.target as HTMLInputElement;

    if (input.value.length >= 3) {
      event.preventDefault();
    }
  }s


  public regresar() {
    this.location.back();
  }

  public registrar() {
    this.errors = this.eventosService.validarEvento(this.evento);
    if (Object.keys(this.errors).length > 0) return;


    if(this.evento.fecha_realizacion){
      const fecha = new Date(this.evento.fecha_realizacion);
      this.evento.fecha_realizacion = fecha.toISOString().split('T')[0];
    
    if(this.myForm) {
      this.myForm.form.markAllAsTouched();
    }

    if (Object.keys(this.errors).length > 0) return;
    }

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

    if(this.myForm) {
      this.myForm.form.markAllAsTouched();
    }

    if (Object.keys(this.errors).length > 0) return;

    const dialogRef = this.dialog.open(EditarEventoModalComponent, {
      data: { rol: 'evento' },
      height: '288px',
      width: '328px',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.confirmar) {
        if(this.evento.fecha_realizacion){
          const fecha = new Date(this.evento.fecha_realizacion);
          this.evento.fecha_realizacion = fecha.toISOString().split('T')[0];
        }

        this.eventosService.actualizarEvento(this.evento).subscribe(
          (response) => {
            alert("Evento actualizado correctamente");
            this.router.navigate(['/eventos-academicos']);
          },
          (error) => {
            alert("Error al actualizar evento");
          }
        );
      }
    });
  }
}