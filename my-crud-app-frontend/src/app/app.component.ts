import { RouterOutlet } from '@angular/router';
import { Component} from '@angular/core';
import { CommonModule } from '@angular/common'; // Needed f
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'my-crud-app';
}
