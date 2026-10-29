import { Directive, TemplateRef, ViewContainerRef, effect, inject, input } from '@angular/core';
import { SessionStore } from '../../core/services/session.store';

@Directive({
  standalone: true,
  selector: '[appHasPermission]',
})
export class HasPermissionDirective {
  private readonly session = inject(SessionStore);
  private readonly templateRef = inject(TemplateRef<unknown>);
  private readonly viewContainer = inject(ViewContainerRef);

  readonly appHasPermission = input.required<string>();

  constructor() {
    effect(() => {
      const permKey = this.appHasPermission();
      const allowed = this.session.canPermission(permKey);

      this.viewContainer.clear();
      if (allowed) {
        this.viewContainer.createEmbeddedView(this.templateRef);
      }
    });
  }
}
