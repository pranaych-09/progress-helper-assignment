import { Component,ViewChild } from '@angular/core';
import { MenuComponent } from '../menu/menu.component';
import { ViewComponent } from '../view/view.component';
import { RouterLink } from '@angular/router';
import { MatTooltip } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { EmployeeService } from '../services/employee.service';
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MenuComponent, ViewComponent, RouterLink, MatTooltip, MatButtonModule, MatIconModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  selectedEmployee: any;
  employeesList : any[] = [];
  constructor(private empService: EmployeeService) { }
  @ViewChild(MenuComponent) menuComponent!: MenuComponent;
  convertToCSV(objArray: any[]): string {
    if (!objArray.length) return '';

    const keys = Object.keys(objArray[0]);
    const header = keys.join(',');
    const rows = objArray.map(row =>
      keys.map(key => {
        const cell = row[key] !== null && row[key] !== undefined ? row[key] : '';
        // Escape commas and double quotes for safety
        return `"${String(cell).replace(/"/g, '""')}"`;
      }).join(',')
    );

    return [header, ...rows].join('\r\n');
  }

  onEmployeeSelected(employee: any) {
    this.selectedEmployee = employee;
  }
  onEmployeesListChanged(employees : any[]){
    this.employeesList = employees;
  }
  
  downloadHelpers() {
    if (!this.employeesList.length) {
      alert("No employee data available to download.");
      return;
    }

    const cleanedData = this.employeesList.map(emp => {
      const {createdAt, name, typeOfService, organizationName, email, phone, gender, empID, languagesKnown } = emp;

      const formattedDate = createdAt
        ? new Date(createdAt).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          })
        : '';

      return {
        EmployeeID: empID,
        Name: name,
        Service: typeOfService,
        Organisation: organizationName,
        Languages: languagesKnown,
        Email: email,
        Phone: phone,
        Gender: gender,
        JoinedOn: formattedDate,
      };
    });

    const csv = this.convertToCSV(cleanedData);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'helpers.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    console.log('Download initiated');
  }

  onHelperDeleted(empID : string){
    this.menuComponent.deleteEmployee(empID);
  }

}
