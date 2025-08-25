import { RouterOutlet } from '@angular/router';
import { Component} from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { EmployeeService } from './services/employee.service';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  constructor(private employeeService: EmployeeService) {}
  title = 'my-crud-app';
  testError(){
    this.employeeService.getBrokenEndpoint().subscribe({
      next: (res) => console.log(res),
      error: (err) => console.error('Caught in component:', err)
    });
  }
}

