import { Component, OnInit } from '@angular/core';
import DatalabelsPlugin from 'chartjs-plugin-datalabels';
import { AdministradoresService } from 'src/app/services/administradores.service';

@Component({
  selector: 'app-graficas-screen',
  templateUrl: './graficas-screen.component.html',
  styleUrls: ['./graficas-screen.component.scss']
})
export class GraficasScreenComponent implements OnInit{

  // Histogram (Gráfica de Línea)
  lineChartData: any = {
    labels: ["Administradores", "Maestros", "Alumnos"],
    datasets: [{ 
      data: [0, 0, 0], 
      label: 'Registro de Usuarios', 
      backgroundColor: '#F88406' 
    }]
  };
  lineChartOption = { responsive:false };
  lineChartPlugins = [ DatalabelsPlugin ];

  // Barras
  barChartData: any = {
    labels: ["Administradores", "Maestros", "Alumnos"], 
    datasets: [{ 
      data:[0, 0, 0], 
      label: 'Registro de Usuarios', 
      backgroundColor: ['#F88406', '#FCFF44', '#82D3FB'] 
    }]
  };
  barChartOption = { responsive:false };
  barChartPlugins = [ DatalabelsPlugin ];

  // Circular (Pie)
  pieChartData: any = {
    labels: ["Administradores", "Maestros", "Alumnos"],
    datasets: [{ 
      data:[0, 0, 0], 
      label: 'Registro de usuarios', 
      backgroundColor: ['#FCFF44', '#F1C8F2', '#31E731'] 
    }]
  };
  pieChartOption = { responsive:false };
  pieChartPlugins = [ DatalabelsPlugin ];

  // Dona (Doughnut)
  doughnutChartData: any = {
    labels: ["Administradores", "Maestros", "Alumnos"],
    datasets: [{ 
      data:[0, 0, 0], 
      label: 'Registro de usuarios', 
      backgroundColor: ['#F88406', '#FCFF44', '#31E7E7'] 
    }]
  };
  doughnutChartOption = { responsive:false };
  doughnutChartPlugins = [ DatalabelsPlugin ];

  constructor(
    private administradoresServices: AdministradoresService
  ) { }

  ngOnInit(): void {
    this.obtenerTotalUsers();
  }

  public obtenerTotalUsers(){
    this.administradoresServices.getTotalUsuarios().subscribe(
      (response)=>{
        console.log("Total usuarios: ", response);
        
        const totalAdmins = response.admins || 0; 
        const totalMaestros = response.maestros || 0;
        const totalAlumnos = response.alumnos || 0;
        
        this.lineChartData = {
          labels: ["Administradores", "Maestros", "Alumnos"],
          datasets: [{
            data: [totalAdmins, totalMaestros, totalAlumnos],
            label: 'Registro de Usuarios',
            backgroundColor: '#F88406'
          }]
        };
        
        this.barChartData = {
          labels: ["Administradores", "Maestros", "Alumnos"],
          datasets: [{ 
            data:[totalAdmins, totalMaestros, totalAlumnos], 
            label: 'Total de Usuarios', 
            backgroundColor: ['#F88406', '#FCFF44', '#82D3FB'] 
          }]
        };

        this.pieChartData = {
          labels: ["Administradores", "Maestros", "Alumnos"],
          datasets: [{ 
            data:[totalAdmins, totalMaestros, totalAlumnos], 
            backgroundColor: ['#FCFF44', '#F1C8F2', '#31E731'] 
          }]
        };

        this.doughnutChartData = {
          labels: ["Administradores", "Maestros", "Alumnos"],
          datasets: [{ 
            data:[totalAdmins, totalMaestros, totalAlumnos], 
            backgroundColor: ['#F88406', '#FCFF44', '#31E7E7'] 
          }]
        };

      }, (error)=>{
        alert("No se pudo obtener el total de usuarios");
      }
    );
  }
}