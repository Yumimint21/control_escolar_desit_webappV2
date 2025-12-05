import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-editar-evento-modal',
  templateUrl: './editar-evento-modal.component.html',
  styleUrls: ['./editar-evento-modal.component.scss']
})
export class EditarEventoModalComponent implements OnInit {

  public rol: string = "";

  constructor(
    private dialogRef: MatDialogRef<EditarEventoModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.rol = this.data.rol;
  }

  cerrar_modal() {
    this.dialogRef.close({ confirmar: false });
  }

  editarEvento() {
    this.dialogRef.close({ confirmar: true });
  }
}
