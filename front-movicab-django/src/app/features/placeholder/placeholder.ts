import { Component } from '@angular/core';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-placeholder',
  standalone: true,
  imports: [CardModule, TagModule],
  template: `
    <p-tag value="Fase I" severity="warn" [rounded]="true" />
    <p-card header="Pantalla en construcción" class="mt-4">
      <p class="m-0 text-slate-600">El layout ya está montado; esta pantalla se conecta a la API en su correspondiente ISS.</p>
    </p-card>
  `,
})
export class Placeholder {}