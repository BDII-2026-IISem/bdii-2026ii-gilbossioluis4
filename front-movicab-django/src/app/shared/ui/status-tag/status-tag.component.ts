import { Component, input } from '@angular/core';
import { TagModule } from 'primeng/tag';
import { Status } from '../../../core/models/api.model';

@Component({
  selector: 'app-status-tag',
  standalone: true,
  imports: [TagModule],
  template: `
    <p-tag 
      [severity]="status() === 'active' ? 'success' : 'danger'" 
      [value]="status() === 'active' ? 'Activo' : 'Inactivo'">
    </p-tag>
  `,
})
export class StatusTagComponent {
  readonly status = input.required<Status>();
}
