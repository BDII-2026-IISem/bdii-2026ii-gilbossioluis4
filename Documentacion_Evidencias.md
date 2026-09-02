# Documentación y Evidencias — Instalación y Arranque de 4 motores de BD

**Fecha:** 2026-09-02

## Resumen
Este documento recoge el paso a paso utilizado para instalar y levantar cuatro motores de bases de datos (MySQL, PostgreSQL, MSSQL Server y Oracle XE) —junto con las referencias usadas— y describe cada evidencia almacenada en: C:\Users\GILBO\OneDrive\Escritorio\Evidencias wsl2

## Referencias utilizadas
- Introducción a bases de datos: https://tecnogua.com/academic/site/bd/introduccion/
- MySQL instalación: https://tecnogua.com/academic/site/bd/instalacion/mysql/
- PostgreSQL instalación: https://tecnogua.com/academic/site/bd/instalacion/postgresql/
- MSSQL Server instalación: https://tecnogua.com/academic/site/bd/instalacion/mssql/
- Oracle instalación: https://tecnogua.com/academic/site/bd/instalacion/oracle/

## Requisitos previos
- Máquina con WSL2 / Windows con privilegios de administrador.
- Conexión a internet para descargar binarios/containers.
- Espacio disponible para imágenes/instaladores.

## Pasos generales aplicados (comunes a todos los motores)
- Descargar paquete o usar imagen Docker/paquete nativo según la referencia.
- Instalar dependencias necesarias (libc, openssl, herramientas de red) en WSL2 si aplica.
- Configurar puertos y usuarios básicos (root/sa/oracle/postgres).
- Iniciar servicio y verificar conectividad con cliente CLI.

## Pasos específicos por motor

**MySQL:**
- Seguir la guía de la referencia para instalar el servidor MySQL (paquete .deb o .msi según entorno).
- Crear usuario administrador y habilitar arranque automático.
- Arrancar la primera instancia y ejecutar `mysql --version` y `systemctl status mysql` (o equivalente en WSL2).

**PostgreSQL:**
- Instalar el paquete oficial (apt/yum/msi) o usar imagen Docker.
- Inicializar cluster si fuese necesario (`initdb`) y crear rol `postgres` con contraseña.
- Arrancar servicio y comprobar con `psql -U postgres -c "\l"`.

**MSSQL Server:**
- Descargar e instalar paquete oficial o ejecutar imagen Docker (mcr.microsoft.com/mssql/server).
- Configurar contraseña de `sa` y aceptar términos (EULA).
- Arrancar el servicio y comprobar con `sqlcmd -S localhost -U sa -P <password> -Q "SELECT @@VERSION"`.

**Oracle (XE):**
- Usar instalador oficial o imagen Docker de Oracle XE según la guía.
- Configurar listener y crear usuario `SYS`/`SYSTEM` y esquema de prueba.
- Verificar listener con `lsnrctl status` y probar conexión con `sqlplus`.

## Evidencias (carpeta: C:\Users\GILBO\OneDrive\Escritorio\Evidencias wsl2)
- **comprobacion de oracle.png**: Captura mostrando checks internos de Oracle (estado de servicios / instancias). Describe: salida de comandos de verificación y estado del listener.
- **comprobacion final 4 motores (healthy).png**: Imagen final donde se muestra que los cuatro motores están en estado "healthy" (monitor o salida de comprobación consolidada).
- **evidencia final oracle XE .png**: Captura final de Oracle XE con instancia disponible y conexión exitosa desde cliente.
- **evidencia Listener activo.png**: Imagen del `lsnrctl status` o interfaz equivalente que muestra el Listener de Oracle en estado "ACTIVE".
- **instalacion de oracle.png**: Evidencia del proceso de instalación de Oracle (logs o pantallas del instalador) y pasos completados.
- **instalacion mysql_server.png**: Captura de la instalación de MySQL Server (progreso o resultado del instalador / apt output).
- **levantamineto del primer motor MySQL.png**: Imagen que demuestra el arranque del primer motor MySQL y conexión a la base de datos (cliente conectado).
- **segundo motor funcionando postgres.png**: Evidencia del segundo motor (o segundo servicio) PostgreSQL en ejecución; muestra `ps`/`systemctl` o `psql` exitoso.
- **verficacion de oracle.png**: (Nota: nombre con typo) Otra captura de verificación de Oracle que complementa `comprobacion de oracle.png`.
- **verificacion de postgres.png**: Captura que muestra la verificación/consulta exitosa en PostgreSQL (`psql` o logs de arranque).

Para cada evidencia anterior se recomienda incluir en la carpeta junto a la imagen un archivo de texto corto (por ejemplo `comprobacion_de_oracle.md`) con:
- Comando exacto ejecutado.
- Timestamp (fecha y hora) de la captura.
- Resultado esperado y resultado obtenido.

## Ejemplo de comandos ejecutados (resumen)
- MySQL (arranque/estado):

```bash
sudo systemctl start mysql
sudo systemctl status mysql
mysql -u root -p -e "SHOW DATABASES;"
```

- PostgreSQL (arranque/consulta):

```bash
sudo systemctl start postgresql
sudo -u postgres psql -c "\l"
```

- MSSQL (Docker / servicio):

```bash
# Docker
docker run -e 'ACCEPT_EULA=Y' -e 'SA_PASSWORD=Your_password123' -p 1433:1433 -d mcr.microsoft.com/mssql/server:2019-latest
# Verificación
/opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P 'Your_password123' -Q "SELECT @@VERSION"
```

- Oracle (listener/check):

```bash
# lsnrctl status
lsnrctl status
# sqlplus connection
sqlplus system@localhost/XE
```

## Recomendaciones finales
- Juntar junto a cada imagen una nota con los comandos exactos y el contexto (WSL2/Windows/Docker).
- Mantener copia de las credenciales usadas en un lugar seguro (no dentro de la carpeta pública de evidencias).
---
Documento generado automáticamente y guardado en el proyecto.
