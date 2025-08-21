import { Component, Input, HostBinding } from '@angular/core';
import { API_BASE_URL } from '../../app.config';
@Component({
  selector: 'app-search-card',
  standalone: true,
  imports: [],
  templateUrl: './search-card.component.html',
  styleUrl: './search-card.component.css'
})
export class SearchCardComponent {
  @Input() name: string = '';
  @Input() service: string = '';
  @Input() empId: string = '';
  @Input() profilePic: string = '';
  @Input() active = false;

  @HostBinding('class.active') get isActive() {
    return this.active;
  }


  getProfilePictureUrl(): string {
  if (!this.profilePic || this.profilePic === '') {
    const formatted = (this.name); 
    return `https://ui-avatars.com/api/?name=${formatted}&background=random&color=fff&rounded=true&length=2`;
  }
  const path = this.profilePic;
  return `${API_BASE_URL}${path.replace(/^.*\/uploads/, '/uploads')}`;
}

}
