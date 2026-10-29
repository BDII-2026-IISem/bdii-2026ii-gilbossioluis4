import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';
import { Construir } from './construir';

describe('Construir', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Construir],
      providers: [
        provideNoopAnimations(),
        providePrimeNG({ theme: { preset: Aura } }),
      ],
    }).compileComponents();
  }, 30000);

  async function crearPantalla(): Promise<{ fixture: ComponentFixture<Construir>; compilado: HTMLElement }> {
    const fixture = TestBed.createComponent(Construir);
    fixture.detectChanges();
    await fixture.whenStable();
    return { fixture, compilado: fixture.nativeElement as HTMLElement };
  }

  function opcionDelMenu(compilado: HTMLElement, texto: string): HTMLButtonElement {
    const botones = Array.from(compilado.querySelectorAll('aside button, p-drawer button, nav button, button')) as HTMLButtonElement[];
    const encontrado = botones.find((b) => b.textContent?.includes(texto));
    if (!encontrado) {
      throw new Error(`No se encontró la opción de menú "${texto}".`);
    }
    return encontrado;
  }

  it('should compose the layout and start on Inicio', async () => {
    const { compilado } = await crearPantalla();
    expect(compilado.querySelector('h1')?.textContent?.trim()).toBe('Inicio');
  }, 15000);

  it('should render the five menu options', async () => {
    const { compilado } = await crearPantalla();
    ['Inicio', 'Clientes', 'Tipos de producto', 'Productos', 'Ventas'].forEach((opcion) => {
      expect(opcionDelMenu(compilado, opcion)).toBeTruthy();
    });
  }, 15000);

  it('should always show the menu button, not only on small screens', async () => {
    const { compilado } = await crearPantalla();
    const botonMenu = compilado.querySelector('header button[aria-label="Abrir menú de navegación"]');
    expect(botonMenu).toBeTruthy();
  }, 15000);

  it('should change the title without navigating when an option is chosen', async () => {
    const { fixture, compilado } = await crearPantalla();
    opcionDelMenu(compilado, 'Clientes').click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(compilado.querySelector('h1')?.textContent?.trim()).toBe('Clientes');
  }, 15000);

  it('should open the mobile drawer when the header requests it', async () => {
    const { fixture, compilado } = await crearPantalla();
    const botonHeader = compilado.querySelector('header button[aria-label="Abrir menú de navegación"]') as HTMLButtonElement;
    botonHeader.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.componentInstance.drawerVisible()).toBe(true);
  }, 15000);

  it('should hide the fixed aside on desktop instead of opening the drawer', async () => {
    const { fixture, compilado } = await crearPantalla();
    const botonHeader = compilado.querySelector('header button[aria-label="Abrir menú de navegación"]') as HTMLButtonElement;
    botonHeader.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.asideVisible()).toBe(false);
  }, 15000);

  it('should close the drawer after choosing an option', async () => {
    const { fixture, compilado } = await crearPantalla();
    fixture.componentInstance.drawerVisible.set(true);
    fixture.detectChanges();

    opcionDelMenu(compilado, 'Ventas').click();
    fixture.detectChanges();

    expect(fixture.componentInstance.drawerVisible()).toBe(false);
  }, 15000);
});
