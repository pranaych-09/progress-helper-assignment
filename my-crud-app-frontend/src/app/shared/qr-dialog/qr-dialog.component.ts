// qr-dialog.component.ts
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { QRCodeModule } from 'angularx-qrcode';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';        
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import * as CryptoJS from 'crypto-js';

@Component({
  selector: 'app-qr-dialog',
  standalone: true,
  imports: [QRCodeModule,CommonModule,
      ReactiveFormsModule,
      FormsModule,
      MatDialogModule,
      MatFormFieldModule,
      MatInputModule,
      MatSelectModule,
      MatButtonModule,
      MatOptionModule,
      MatIconModule
  ],
  
  templateUrl: './qr-dialog.component.html',
  styleUrls: ['./qr-dialog.component.scss']
  
})
export class QrDialogComponent {

  secretKey: string = 'Jai Babuuu';
  qrData: string = '';

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { empID: string },
  ) { 
    this.qrData = this.generateSecureQRData(data.empID);
  }


  generateSecureQRData(empID: string): string {
    const hash = CryptoJS.HmacSHA256(empID, this.secretKey).toString();

    const payload = {
      empID: empID,
      hash: hash
    };

    return JSON.stringify(payload); 
  }

  downloadQRCode() {
    const qrCodeElement = document.querySelector('qrcode') as HTMLElement;
    if (!qrCodeElement) return;

    import('html2canvas').then((html2canvas) => {
      html2canvas.default(qrCodeElement).then((canvas) => {
        const link = document.createElement('a');
        link.download = `${this.data.empID}_QRCode.png`;
        link.href = canvas.toDataURL();
        link.click();
      });
    });
  }


}
