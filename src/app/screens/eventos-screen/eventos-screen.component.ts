import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort'; // <--- 1. NUEVO IMPORT
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

  displayedColumns: string[] = ['nombre', 'tipo', 'fecha', 'horario', 'lugar', 'cupo', 'publico', 'programa', 'descripcion', 'responsable', 'acciones'];  dataSource = new MatTableDataSource<any>(this.lista_eventos);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort; 

  constructor(
    public facadeService: FacadeService,
    private eventosService: EventosService,
    private router: Router,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.name_user = this.facadeService.getUserCompleteName();
    this.rol = this.facadeService.getUserGroup();

    this.obtenerEventos();
    this.initPaginator();
  }

  public initPaginator() {
    setTimeout(() => {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort; 
    }, 500);
  }

  public obtenerEventos() {
    this.eventosService.obtenerListaEventos().subscribe(
      (response) => {
        this.lista_eventos = response;
        
        if (this.rol === 'maestro') {
          this.lista_eventos = this.lista_eventos.filter(e => 
            e.publico_objetivo.includes('Profesores') || 
            e.publico_objetivo.includes('Publico General') || 
            e.publico_objetivo.includes('Público General')
          );
        } else if (this.rol === 'alumno') {
          this.lista_eventos = this.lista_eventos.filter(e => 
            e.publico_objetivo.includes('Estudiantes') || 
            e.publico_objetivo.includes('Publico General') ||
            e.publico_objetivo.includes('Público General')
          );
        }

        this.dataSource.data = this.lista_eventos;        
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort; 
      }, (error) => {
        alert("No se pudo obtener la lista de eventos");
      }
    );
  }

  public applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  public goEditar(id: number) {
    this.router.navigate(['registro-eventos/' + id]);
  }

  public delete(id: number) {
    const dialogRef = this.dialog.open(EliminarUserModalComponent, {
      data: { id: id, rol: 'evento' }, 
      height: '288px',
      width: '328px',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.isDelete) {        
        alert("Evento eliminado correctamente");
        this.obtenerEventos(); 
      }
    });
  }

  public isAdmin() {
    return this.rol === 'administrador' || this.rol === 'admin';
  }
}