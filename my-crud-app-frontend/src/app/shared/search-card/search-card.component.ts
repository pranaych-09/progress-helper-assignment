import { Component, Input, HostBinding } from '@angular/core';

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

    const path = this.profilePic === '' ? '' : this.profilePic;
    const fallback = '/uploads/profile-pics/default.jpg';

    if (!path) return `http://localhost:3000${fallback}`;

    return `http://localhost:3000${path.replace(/^.*\/uploads/, '/uploads')}`;
  }

}
