
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
// import { Employee } from './my-crud-app-backend/src/models/employee.model';  //

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private apiUrl = 'http://localhost:3000/api/employees';
  private configUrl = 'http://localhost:3000/config'; 

  constructor(private http: HttpClient) {
    console.log('EmployeeService initialized');
  }

  createEmployee(formData: FormData): Observable<any> {
    return this.http.post<any>(this.apiUrl, formData);
  }
  getEmployees(filters: any = {}, page: number, limit: number,sortOption:any): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl, {
      params: {
        ...filters,
        page:page.toString(),
        limit:limit.toString(),
        sortOption
      }
    });
  }
  getEmployeeById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/get/${id}`);
  }
  updateEmployee(empID: string, updates: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${empID}`, updates);
  }

  getConfig(): Observable<{ secretKey:String }> {
    return this.http.get<{ secretKey: string }>(this.configUrl);
  }
}
