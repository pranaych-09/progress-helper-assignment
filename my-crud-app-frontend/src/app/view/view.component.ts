import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card'; // optional but helps if you're using <mat-card>
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { DeleteConfirmDialogComponent } from '../shared/dialog-box/dialog-box.component';
import { RouterLink } from '@angular/router';
import { QrDialogComponent } from '../shared/qr-dialog/qr-dialog.component';
@Component({
  selector: 'app-view',
  standalone: true,
  imports: [QrDialogComponent,CommonModule, MatCardModule, MatIconModule, MatButtonModule, MatDialogModule, DeleteConfirmDialogComponent, RouterLink],
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.css'],
})
export class ViewComponent {
  @Input() employee: any;

  constructor(private dialog: MatDialog, private router: Router) {
    
  }

  qrcode(){
    const dialogRef = this.dialog.open(QrDialogComponent, {
          data: { empID: this.employee.empID },
          disableClose: true, 
        });

        dialogRef.afterClosed().subscribe(() => {
          this.router.navigate(['/']);
        });
  }

  getProfilePictureUrl(): string {
    console.log("THis is loggifng :", this.employee);
    if ('kyc' in this.employee) {
      console.log(this.employee.kyc);
    }
    const path = this.employee?.profilePicture;
    const fallback = '/uploads/profile-pics/default.jpg';

    if (!path) return `http://localhost:3000${fallback}`;

    return `http://localhost:3000${path.replace(/^.*\/uploads/, '/uploads')}`;
  }


  getDocumentUrl(path: string): string {
    return `http://localhost:3000${path.replace(/^.*\/uploads/, '/uploads')}`;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  onEdit() {
    console.log('Edit Employee ID:', this.employee._id);
    // this.router.navigate(['/form', this.employee._id]);
  }

  onDelete() {
    const dialogRef = this.dialog.open(DeleteConfirmDialogComponent,
      {
        data: { employee: this.employee }
      }
    );

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        fetch(`http://localhost:3000/api/employees/${this.employee.empID}`, {
          method: 'DELETE',
        })
          .then((res) => res.json())
          .then(() => window.location.reload());
      }
    });
    console.log('Delete Employee ID:', this.employee._id);
  }
}
