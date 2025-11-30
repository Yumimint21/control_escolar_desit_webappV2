import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { FacadeService } from 'src/app/services/facade.service';
import { EventosService } from 'src/app/services/eventos.service';
import { MatDialog } from '@angular/material/dialog';
import { EliminarUserModalComponent } from 'src/app/modals/eliminar-user-modal/eliminar-user-modal.component';

@Component({
  selector: 'app-eventos-screen',
  templateUrl: './eventos-screen.component.html',
  styleUrls: ['./eventos-screen.component.scss']
})
export class EventosScreenComponent implements OnInit {

  public name_user: string = "";
  public rol: string = "";
  public token: string = "";
  public lista_eventos: any[] = [];

  // Configuración de la tabla
  displayedColumns: string[] = ['nombre', 'tipo', 'fecha', 'horario', 'lugar', 'responsable', 'acciones'];
  dataSource = new MatTableDataSource<any>(this.lista_eventos);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    public facadeService: FacadeService,
    private eventosService: EventosService,
    private router: Router,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.name_user = this.facadeService.getUserCompleteName();
    this.rol = this.facadeService.getUserGroup();

    // Regla de negocio: Validar permisos de visualización al cargar
    // Aunque el sidebar ya filtra, aquí aseguramos que vean lo correcto
    this.obtenerEventos();
    this.initPaginator();
  }

  public initPaginator() {
    setTimeout(() => {
      this.dataSource.paginator = this.paginator;
    }, 500);
  }

  public obtenerEventos() {
    this.eventosService.obtenerListaEventos().subscribe(
      (response) => {
        this.lista_eventos = response;
        
        // Filtros según rol (Puntos 19 y 20 del PDF)
        if (this.rol === 'maestro') {
          // Maestros ven: Propios de Maestros + Público General
          this.lista_eventos = this.lista_eventos.filter(e => 
            e.publico_objetivo.includes('Profesores') || 
            e.publico_objetivo.includes('Publico General') || // Ojo con acentos según tu backend
            e.publico_objetivo.includes('Público General')
          );
        } else if (this.rol === 'alumno') {
          // Alumnos ven: Propios de Estudiantes + Público General
          this.lista_eventos = this.lista_eventos.filter(e => 
            e.publico_objetivo.includes('Estudiantes') || 
            e.publico_objetivo.includes('Publico General') ||
            e.publico_objetivo.includes('Público General')
          );
        }
        // Admin ve todo (no se filtra)

        this.dataSource.data = this.lista_eventos;
      }, (error) => {
        alert("No se pudo obtener la lista de eventos");
      }
    );
  }

  // Buscador (Filtro por nombre)
  public applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  // Navegación a editar
  public goEditar(id: number) {
    this.router.navigate(['registro-eventos/' + id]);
  }

  public delete(id: number) {
    const dialogRef = this.dialog.open(EliminarUserModalComponent, {
      data: { id: id, rol: 'evento' }, // Pasamos 'evento' para personalizar el modal si quieres
      height: '288px',
      width: '328px',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result.isDelete) {
        this.eventosService.eliminarEvento(id).subscribe(
          (response) => {
            alert("Evento eliminado correctamente");
            this.obtenerEventos(); // Recargar tabla
          }, (error) => {
            alert("No se pudo eliminar el evento");
          }
        );
      }
    });
  }

  // Helper para mostrar/ocultar acciones según rol
  public isAdmin() {
    return this.rol === 'administrador' || this.rol === 'admin'; // Ajusta según como guardes el rol en BD
  }
}