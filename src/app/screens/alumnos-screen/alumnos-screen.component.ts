import { AlumnosService } from './../../services/alumnos.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { FacadeService } from 'src/app/services/facade.service';
import { MatSort } from '@angular/material/sort';
import { EliminarUserModalComponent } from 'src/app/modals/eliminar-user-modal/eliminar-user-modal.component';

@Component({
  selector: 'app-alumnos-screen',
  templateUrl: './alumnos-screen.component.html',
  styleUrls: ['./alumnos-screen.component.scss'],
})
export class AlumnosScreenComponent implements OnInit {
  public name_user: string = '';
  public rol: string = '';
  public token: string = '';
  public lista_alumnos: any[] = [];

  //para la tabla
  displayedColumns: string[] = [
    'matricula',
    'nombre',
    'email',
    'fecha_nacimiento',
    'telefono',
    'curp',
    'rfc',
    'ocupacion',
    'editar',
    'eliminar',
  ];
  dataSource = new MatTableDataSource<DatosUsuario>(
    this.lista_alumnos as DatosUsuario[]
  );

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  constructor(
    public facadeService: FacadeService,
    public alumnosService: AlumnosService,
    private router: Router,
    public dialog: MatDialog

  ) {}

  ngOnInit(): void {
    this.name_user = this.facadeService.getUserCompleteName();
    this.rol = this.facadeService.getUserGroup();
    //Validar que haya inicio de sesión
    //Obtengo el token del login
    this.token = this.facadeService.getSessionToken();
    console.log('Token: ', this.token);
    if (this.token == '') {
      this.router.navigate(['/']);
    }

    this.dataSource.sortingDataAccessor = (item: DatosUsuario, property) => {
      switch (property) {
        case 'nombre':
          return item.first_name;
        default:
          return (item as any)[property];
      }
    };

    //Obtener alumnos
    this.obtenerAlumnos();
  }

  public obtenerAlumnos() {
    this.alumnosService.obtenerListaAlumnos().subscribe(
      (response) => {
        this.lista_alumnos = response;
        console.log('Lista users: ', this.lista_alumnos);
        if (this.lista_alumnos.length > 0) {
          this.lista_alumnos.forEach((usuario) => {
            usuario.first_name = usuario.user.first_name;
            usuario.last_name = usuario.user.last_name;
            usuario.email = usuario.user.email;
          });
          this.dataSource.data = this.lista_alumnos as DatosUsuario[];

          setTimeout(() => {
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
          });
        }
      },
      (error) => {
        console.error('Error al obtener la lista de alumnos: ', error);
        alert('No se pudo obtener la lista de alumnos');
      }
    );
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  public goEditar(idUser: number) {
    this.router.navigate(['registro-usuarios/alumnos/' + idUser]);
  }

  public delete(idUser: number) {
    // Se obtiene el ID del usuario en sesión, es decir, quien intenta eliminar
        const userIdSession = Number(this.facadeService.getUserId());
        // --------- Pero el parametro idUser (el de la función) es el ID del maestro que se quiere eliminar ---------
        // Administrador puede eliminar cualquier maestro
        // Maestro solo puede eliminar su propio registro
        if (this.rol === 'administrador' || (this.rol === 'alumno' && userIdSession === idUser)) {
          //Si es administrador o es maestro, es decir, cumple la condición, se puede eliminar
          const dialogRef = this.dialog.open(EliminarUserModalComponent,{
            data: {id: idUser, rol: 'alumno'}, //Se pasan valores a través del componente
            height: '288px',
            width: '328px',
          });

        dialogRef.afterClosed().subscribe(result => {
          if(result.isDelete){
            console.log("Alumno eliminado");
            alert("Alumno eliminado correctamente.");
            //Recargar página
            window.location.reload();
          }else{
            alert("Alumno no se ha podido eliminar.");
            console.log("No se eliminó el alumno");
          }
        });
        }else{
          alert("No tienes permisos para eliminar este alumno.");
        }
      }
  }
export interface DatosUsuario {
  id: number;
  matricula: number;
  first_name: string;
  last_name: string;
  email: string;
  fecha_nacimiento: string;
  telefono: string;
  curp: string;
  rfc: string;
  ocupacion: string;
}
