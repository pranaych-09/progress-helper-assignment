import { Component, OnInit, EventEmitter,Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { EmployeeService } from '../services/employee.service';
import { SearchCardComponent } from '../shared/search-card/search-card.component';
import { MatCardModule } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatOption } from '@angular/material/core';
import { MatSelectTrigger } from '@angular/material/select';
import { MatFormField } from '@angular/material/select';
type SortOption = 'nameAsc' | 'nameDesc' | 'empIDAsc' | 'empIDDesc' | null;

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, FormsModule, SearchCardComponent, MatCardModule,MatIcon,MatOption,MatSelectTrigger,MatFormField],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css',
})
export class MenuComponent implements OnInit {
  @Output() employeeSelected = new EventEmitter<any>();
  @Output() employeesListChanged = new EventEmitter<any[]>();
  searchTerm = '';
  selectedServices: string[] = [];
  selectedOrganizations: string[] = [];
  allServices = ['Cleaning','Driving','Security','Maintenance'];
  organizationNames = ['ASBL', 'Inncircles', 'A2Z Helpers', 'Urban Company'];
  showFilter = false;

  sortOption: SortOption = null;

  employees: any[] = [];
  total: number = 0;

  selectedEmpID = '';
  constructor(private empService: EmployeeService) {}

  ngOnInit() {
    this.fetchEmployees();
  }
  selectEmployee(emp : any) {
    console.log('Selected Employee enti ante :', emp);
    this.selectedEmpID = emp.empID;
    this.employeeSelected.emit(emp);
  }
  selectEmployeeFromBackend(data : any[]){
    this.employees = data;
    if(data.length>0){
      this.selectedEmpID = data[0].empID;

      this.employeeSelected.emit(data[0]);
    }
    this.employeesListChanged.emit(this.employees);
  }

  isName(value: string): boolean {
    return /^[a-zA-Z\s]+$/.test(value);
  } 
  isEmployeeId(value: string): boolean {
    return /^EMP\d+$/i.test(value);
  }

  isPhone(value: string): boolean {
    return /^[0-9]+$/.test(value);
  } 
  fetchEmployees() {
    const query: any = {};
    this.searchTerm = this.searchTerm.trim();
    if (this.searchTerm) {
      if (this.isEmployeeId(this.searchTerm)) {
        query.empID = this.searchTerm;
      } else if (this.isName(this.searchTerm)) {
        query.name = this.searchTerm;
      } else if (this.isPhone(this.searchTerm)) {
        query.phone = this.searchTerm;
      }
      else{
        query.empID = -1;
      }
      // console.log('Query:', query);
    }

    if (this.selectedServices.length) {
      query.typeOfService = this.selectedServices;
    }
    if (this.selectedOrganizations.length) {
      query.organizationName = this.selectedOrganizations;
    }
    this.empService.getEmployees(query).subscribe({
      next: (data : any) => {
        this.employees = this.sortList(data);
        this.total = this.total==0 ?data.length : this.total;
        this.selectEmployeeFromBackend(data);
      },
      error: (err : any) => {
        console.error('Search failed', err);
      },
    });
  }

  sortList(list: any[]) {
    if (!this.sortOption) return list;

    const sorted = [...list];
    console.log('Sorting by:', this.sortOption);
    switch (this.sortOption) {
      case 'nameAsc':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case 'nameDesc':
        return sorted.sort((a, b) => b.name.localeCompare(a.name));
      case 'empIDAsc':
        return sorted.sort((a, b) => a.empID.localeCompare(b.empID));
      case 'empIDDesc':
        return sorted.sort((a, b) => b.empID.localeCompare(a.empID));
      default:
        return list;
    }
    
  }

  toggleFilter() {
    this.showFilter = !this.showFilter;
  }

  toggleService(service: string, event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      this.selectedServices.push(service);
    } else {
      this.selectedServices = this.selectedServices.filter((s) => s !== service);
    }
  }

  toggleOrganization(organization: string, event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      this.selectedOrganizations.push(organization);
    } else {
      this.selectedOrganizations = this.selectedOrganizations.filter((o) => o !== organization);
    }
  }

  applyFilter() {
    this.fetchEmployees();
    this.closeFilter();
  }

  closeFilter(){
    this.showFilter = false;
  }
  onSearchInput() {
    console.log('Search input changed:', this.searchTerm);
    this.fetchEmployees();
  }

  onSortChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value as SortOption;
    this.sortOption = value;
    this.employees = this.sortList(this.employees);
    this.selectEmployeeFromBackend(this.employees);
  }

  resetAll() {
    this.searchTerm = '';
    this.sortOption = null;
    this.selectedServices = [];
    this.selectedOrganizations = [];
    this.showFilter = false;
    this.fetchEmployees();
  }
  clearSearch(){
    this.searchTerm='';
    this.onSearchInput();
  }
}
