import { Component, input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  template: `
    <div class="flex flex-col items-center justify-center p-8 text-center bg-slate-50 rounded-lg border border-dashed border-slate-300 my-4">
      <i [class]="icon() + ' text-4xl text-slate-400 mb-3'"></i>
      <h3 class="text-base font-semibold text-slate-700">{{ message() }}</h3>
      @if (description()) {
        <p class="text-sm text-slate-500 mt-1 max-w-sm">{{ description() }}</p>
      }
    </div>
  `,
})
export class EmptyStateComponent {
  readonly message = input<string>('No hay datos disponibles.');
  readonly description = input<string>();
  readonly icon = input<string>('pi pi-inbox');
}
