import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Ejemplo } from './ejemplo';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';

describe('Ejemplo', () => {
  let component: Ejemplo;
  let fixture: ComponentFixture<Ejemplo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Ejemplo],
      providers: [
        provideAnimationsAsync(),
        providePrimeNG({ theme: { preset: Aura } })
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Ejemplo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crearse el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debe calcular el precio con IVA correctamente', () => {
    expect(component.precioFinal()).toBe(21420);
  });

  it('debe actualizar el precio al llamar a variarPrecio', () => {
    component.variarPrecio(1000);
    expect(component.producto().precio).toBe(19000);
    expect(component.precioFinal()).toBe(22610);
  });

  it('debe conmutar el estado del producto', () => {
    component.conmutarEstado();
    expect(component.producto().activo).toBe(false);
    expect(component.estadoTexto()).toContain('inactivo');
  });
});