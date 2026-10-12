# Informe de Construcción - Laboratorio Django

## ISS-00 — Construcción Base

**Objetivo:** 
Crear el entorno virtual y el proyecto base de Django, aislando las dependencias del sistema operativo sin manipular el script `manage.py` de forma manual.

**Lo que se hizo:** 
- Se creó un entorno virtual aislado (`.venv`) usando Python 3.14.
- Se instaló la versión exacta de Django requerida (5.2.17) utilizando `pip`.
- Se generó la estructura raíz del proyecto (`config`) mediante el comando de la CLI de Django `django-admin startproject config .`.
- Se congelaron las dependencias instaladas en un archivo `requirements.txt`.
- Se elaboró un archivo `.gitignore` para excluir el entorno, archivos de caché y bases de datos locales del control de versiones.

**Evidencia:**
![alt text](<EVIDENCIAS_ISS--XX/ISS--00.png>)

---

## ISS-01 — Settings y selección del motor

**Objetivo:** 
Elegir un solo motor de base de datos por proceso leyendo las variables de configuración desde un archivo `.env`, sin escribir SQL y protegiendo las credenciales y secretos del proyecto.

**Lo que se hizo:** 
- Se instalaron los drivers necesarios para soportar PostgreSQL, MySQL, SQL Server y Oracle, además de `python-dotenv` para la lectura de variables de entorno.
- Se reestructuró la configuración de Django: se eliminó el archivo `settings.py` autogenerado y se reemplazó por un paquete modular `config/settings/`.
- Se crearon las plantillas de entorno (`.env.example` y `.env`) para almacenar el `DB_ENGINE` y las credenciales.
- Se implementó el archivo `config/database.py` encargado de mapear de forma dinámica el motor seleccionado hacia la configuración que entiende Django.
- Se parchearon los archivos `manage.py`, `wsgi.py` y `asgi.py` asegurando la carga temprana de las variables de entorno mediante `dotenv` y redirigiendo las ejecuciones al intérprete de Python correcto.

**Evidencia:**
![alt text](<EVIDENCIAS_ISS--XX/ISS--01.png>)

## ISS-02 — Apps client, product y sale

**Objetivo:** 
Crear las tres aplicaciones de negocio base (`client`, `product`, `sale`) utilizando la CLI de Django y registrarlas correctamente dentro del paquete modular `apps`.

**Lo que se hizo:** 
- Se crearon los directorios contenedores para cada aplicación y se inicializó la carpeta `apps/` como un módulo de Python agregando un archivo `__init__.py` vacío.
- Se generaron los archivos base de cada aplicación utilizando el comando `django-admin startapp` (ej. `python manage.py startapp client apps/client`), forzando su creación dentro del subdirectorio correspondiente.
- Se editaron los archivos de configuración de cada aplicación (`apps.py`) para ajustar el atributo `name` apuntando a su nueva ruta (ej. `apps.client`) y se agregó el atributo `label` para mantener nombres estables en la base de datos.
- Se registraron las tres aplicaciones en la lista `INSTALLED_APPS` del archivo `config/settings/__init__.py`.
- Se validó la correcta integración y registro de las aplicaciones mediante el comando de comprobación del sistema de Django.

**Evidencia:**
![alt text](<EVIDENCIAS_ISS--XX/ISS--02.png>)

## ISS-03 — Custom User antes de la primera migración

**Objetivo:** 
Definir un modelo de usuario personalizado para StoreLab extendiendo `django.contrib.auth` y fijar la directiva `AUTH_USER_MODEL` antes de aplicar cualquier migración a la base de datos, evitando conflictos estructurales futuros.

**Lo que se hizo:** 
- Se creó un módulo `apps/common/` (no registrado como aplicación de Django) que contiene el enumerador `RecordStatus` para estandarizar los estados `ACTIVE` e `INACTIVE` en todo el proyecto.
- Se generó la aplicación `security` mediante la CLI y se registró su respectivo módulo en `apps.py`.
- Se desarrolló un modelo `User` heredando de `AbstractUser` que delega la propiedad `is_active` al valor del nuevo campo de negocio `status`.
- Se configuró el `StoreUserManager` para que los usuarios regulares nazcan inactivos por defecto, mientras que los superusuarios nazcan activos.
- Se declaró explícitamente `AUTH_USER_MODEL = "security.User"` en la configuración principal **antes** de cualquier comando de migración.
- Se implementaron y ejecutaron exitosamente los tests de selección de base de datos (`DatabaseSelectionTests`).
- Se aplicó la primera migración (`makemigrations` y `migrate`), construyendo el esquema correcto del usuario en la base de datos PostgreSQL.

**Evidencia:**
![alt text](<EVIDENCIAS_ISS--XX/ISS--03.png>)

## ISS-04 — Modelo Client (Adaptado a Pasajero - MoviCab)

**Objetivo:** 
Implementar el modelo base abstracto para el control de estado y auditoría de fechas, y persistir la primera entidad de dominio adaptada a MoviCab (Pasajero) dentro de la aplicación `client`, cumpliendo con la estructura de pruebas del laboratorio.

**Lo que se hizo:** 
- Se creó el archivo `apps/common/models.py` (el cual no se registra como app) definiendo las clases abstractas `TimeStampedModel` (aporta `created_at` y `updated_at`) y `StoreLabModel` (aporta el campo `status` inactivo por defecto y su `CheckConstraint`).
- Se reescribió el modelo `Client` en `apps/client/models.py` para representar fielmente a la entidad **Pasajero** de MoviCab.
- Se mapearon los campos de negocio: `nombre` (con validador de longitud mínima) y `descripcion`, manteniendo el campo `email` único para satisfacer las pruebas del AC-04-04 del laboratorio.
- Se configuró la clase `Meta` para establecer el nombre físico de la tabla como `pasajeros` y se limitó el nombre del constraint a la longitud histórica permitida.
- Se delegó a la CLI la creación de la migración (`makemigrations client`) y se impactó la base de datos con éxito (`migrate`), creando la tabla `pasajeros`.

**Evidencia:**
![alt text](<EVIDENCIAS_ISS--XX/ISS--04.png>)

## ISS-05 — Empresa y Conductor (Relación 1:N)

**Objetivo:** 
Modelar las entidades principales del catálogo y garantizar la integridad referencial de la relación Empresa 1 → N Conductor, restringiendo la eliminación de entidades padre que tengan registros hijos asociados.

**Lo que se hizo:** 
- Se reescribió el archivo `apps/product/models.py` para definir los modelos `Empresa` y `Conductor`, ambos heredando de la clase base `StoreLabModel` para obtener la auditoría de fechas y el control de estado automático.
- Se implementó una clave foránea (`ForeignKey`) en el modelo `Conductor` referenciando a `Empresa`, configurada con `on_delete=models.RESTRICT` para impedir la eliminación de una empresa si esta tiene conductores vinculados.
- Se configuraron los atributos de negocio: `nit` (único), `razon_social` y `contacto_principal` para la empresa, y `nombre` y `descripcion` para el conductor.
- Se aplicaron validadores de longitud (`MinLengthValidator`) y restricciones de unicidad.
- Se generó la migración inicial de la aplicación (`makemigrations product`) y se consolidaron los cambios en la base de datos (`migrate`), creando las tablas físicas `empresas` y `conductores`.

**Evidencia:**
![alt text](<EVIDENCIAS_ISS--XX/ISS--05.png>)

## ISS-06 — Carrera y DetalleCarrera

**Objetivo:** 
Representar la entidad transaccional principal y su detalle con preservación de precio histórico, calculando correctamente los totales por línea y estableciendo el método de anulación (void) sin sustituir el detalle por una relación de muchos a muchos directa.

**Lo que se hizo:** 
- Se creó el archivo `apps/sale/managers.py` definiendo `CarreraQuerySet` y `CarreraManager` para habilitar futuras operaciones transaccionales.
- Se implementaron los modelos `Carrera` y `DetalleCarrera` heredando de `StoreLabModel` para garantizar la consistencia en auditoría y control de estado automático.
- Se agregaron claves foráneas en la cabecera apuntando a `Client` (Pasajero) y `Conductor`, restringiendo la eliminación con `on_delete=models.RESTRICT`.
- En el detalle, el método `save()` fue sobrescrito para calcular dinámicamente `total_linea` multiplicando `cantidad` por `precio_unitario`, preservando el valor cobrado en el momento del registro.
- Se implementó el método transaccional `void()` en la cabecera, el cual utiliza bloqueos de base de datos (`select_for_update()`) para asegurar la concurrencia y anular de manera en cascada las líneas asociadas cambiando su estado a inactivo.
- Se aplicaron las validaciones de montos no negativos mediante `CheckConstraint` a nivel de base de datos.
- Se generaron y ejecutaron las migraciones (`makemigrations sale` y `migrate`), construyendo con éxito las tablas físicas en el motor.

**Evidencia:**
![alt text](<EVIDENCIAS_ISS--XX/ISS--06.png>)

## ISS-07 — Serializers y JSON camelCase

**Objetivo:** 
Traducir los modelos de la base de datos a formato JSON garantizando que las respuestas y peticiones expongan las propiedades en `camelCase` (ej. `createdAt`), sin alterar los nombres originales de los campos en Python (`created_at`), y habilitar la comunicación CORS para la API.

**Lo que se hizo:** 
- Se instalaron los paquetes `djangorestframework`, `djangorestframework-camel-case` y `django-cors-headers`, y se actualizaron las dependencias en `requirements.txt`.
- Se modificó el archivo `config/settings/__init__.py` para registrar las nuevas aplicaciones, el middleware de CORS y configurar `REST_FRAMEWORK` con los renderers y parsers encargados de la transformación automática a camelCase.
- Se crearon los archivos `serializers.py` en las tres aplicaciones utilizando `ModelSerializer`:
  - En `client`: Se implementó el serializer para el Pasajero, añadiendo métodos de validación para normalizar el correo a minúsculas y convertir strings vacíos en nulos.
  - En `product`: Se desarrollaron los serializers para Empresa y Conductor, configurando `empresa_id` como escribible y exponiendo `empresa_nombre` como campo de solo lectura para reducir consultas adicionales desde el cliente.
  - En `sale`: Se estructuraron los serializers transaccionales (`Carrera` y `DetalleCarrera`), anidando el detalle dentro de la carrera principal como una lista de solo lectura.

**Evidencia:**
![alt text](<EVIDENCIAS_ISS--XX/ISS--07.png>)

## ISS-08 — Pasajeros con ModelViewSet

**Objetivo:** 
Publicar el CRUD de pasajeros con el tipo de vista que corresponde a un recurso homogéneo, exponiendo los endpoints iniciales sin autenticación (Fase I).

**Lo que se hizo:** 
- Se creó la vista `ClientViewSet` heredando de `ModelViewSet` para resolver automáticamente la lectura, listado, creación y actualización de los registros.
- Se sobrescribió el método de eliminación (`perform_destroy`) para interceptar la petición DELETE y aplicar una baja lógica, cambiando el estado del pasajero a inactivo en lugar de borrar la fila física.
- Se configuró temporalmente el permiso `AllowAny` para permitir el acceso público a los endpoints, preparándolos para la posterior integración de seguridad basada en tokens (Fase II).
- Se configuró el enrutamiento utilizando `SimpleRouter` en `apps/client/urls.py` para generar las rutas de la colección bajo el recurso `pasajeros`, y se registró en la configuración global `config/urls.py`.
- Se estructuraron y ejecutaron las pruebas unitarias mediante `APITestCase`, validando la creación de registros, las reglas de unicidad, el formato camelCase de respuesta HTTP, y garantizando que el borrado responda un código 204 conservando el registro en base de datos.

**Evidencia:**
![alt text](<EVIDENCIAS_ISS--XX/ISS--08.png>)

## ISS-09 — Catálogo con ModelViewSet

**Objetivo:** 
Publicar las entidades del catálogo operativo (Empresa y Conductor) utilizando el mismo criterio de CRUD homogéneo mediante un `ViewSet` base compartido.

**Lo que se hizo:** 
- Se creó una clase base abstracta `CatalogViewSet` heredando de `ModelViewSet` para centralizar la lógica común, incluyendo el filtrado opcional por parámetros de estado en la consulta y la personalización de la baja lógica a través de `perform_destroy`.
- Se implementaron los controladores `EmpresaViewSet` y `ConductorViewSet` para exponer las entidades asociadas al flujo operativo, asegurando la optimización de consultas mediante `select_related`.
- Se configuró el enrutamiento con `SimpleRouter` en `apps/product/urls.py` asignando las rutas correspondientes y registrándolas en el enrutador global del proyecto.
- Se reescribieron e implementaron las pruebas unitarias en `apps/product/tests.py`, cubriendo el ciclo de vida completo de creación, consulta, actualización parcial y borrado lógico de las entidades, además de validar las restricciones de integridad ante la eliminación de registros padre.

**Evidencia:**
![alt text](<EVIDENCIAS_ISS--XX/ISS--09.png>)

## ISS-10 — Conductores Disponibles con ListAPIView

**Objetivo:** 
Publicar una lectura filtrada específica (conductores disponibles) que no pertenece al CRUD estándar, justificando la implementación de una vista genérica (`ListAPIView`) para operaciones de solo lectura.

**Lo que se hizo:** 
- Se implementó la clase `AvailableConductorListAPIView` heredando de `ListAPIView` para automatizar la serialización de la colección sin habilitar métodos de escritura (POST, PUT, DELETE).
- Se definió la lógica de filtrado en `get_queryset` para retornar exclusivamente los conductores en estado activo que pertenecen a una empresa también activa, optimizando la consulta con `select_related`.
- Se parcheó el archivo `apps/product/urls.py` para registrar la ruta estática `conductores/disponibles/` explícitamente **antes** de las rutas dinámicas del `SimpleRouter`, evitando que el convertidor de parámetros colisione con la URL.
- Se agregó y ejecutó exitosamente el test `test_conductor_crud_and_available_filter` validando que la API retorna los registros correctos y que, al cambiar el estado del conductor a inactivo en la base de datos, este desaparece del listado sin ser eliminado físicamente.

**Evidencia:**
![alt text](<EVIDENCIAS_ISS--XX/ISS--10.png>)

## ISS-11 — Registro de carrera con APIView

**Objetivo:** 
Registrar una carrera como una única transacción atómica, garantizando la consistencia de los datos entre la cabecera, los detalles de cobro, las validaciones de estado de los actores involucrados y el cálculo exacto de los totales.

**Lo que se hizo:** 
- Se implementó el método `register` dentro del `CarreraQuerySet` en `apps/sale/managers.py` para encapsular toda la lógica de negocio y validación de la transacción en la capa del modelo.
- Se utilizó el bloque `with transaction.atomic():` para garantizar que la creación de la carrera y sus líneas de detalle ocurran bajo el principio de "todo o nada" (ante cualquier excepción, se ejecuta un *rollback* de la base de datos).
- Se aplicaron bloqueos de concurrencia mediante `select_for_update()` sobre los registros del pasajero y el conductor, validando estrictamente que ambos (y la empresa del conductor) se encuentren en estado activo antes de proceder.
- Se definieron los serializadores `SaleItemSerializer` y `SaleRegisterSerializer` para validar la estructura de la carga útil y mapear los errores de validación nativos de Django a excepciones comprensibles por DRF.
- Se construyeron las vistas `SaleRegisterAPIView` y `SaleCollectionAPIView` heredando de `APIView`, ya que la complejidad de la transacción de múltiples tablas requiere un control explícito sobre el método POST que `ModelViewSet` no proporciona.
- Se configuró la ruta transaccional manual (`carreras/`) en el archivo `apps/sale/urls.py`.
- Se reescribieron y ejecutaron las pruebas `SaleTransactionTests`, las cuales verificaron con éxito la correcta asignación de precios, la sumatoria de totales, el rechazo de actores inactivos y el *rollback* íntegro ante interrupciones forzadas simuladas.

**Evidencia:**
![alt text](<EVIDENCIAS_ISS--XX/ISS--11.png>)

## ISS-12 — Consulta y anulación de carreras

**Objetivo:** 
Permitir la lectura (listado y detalle) de una carrera con sus líneas de cobro y habilitar su anulación lógica, garantizando que el historial transaccional y los precios cobrados en su momento se mantengan intactos para auditoría.

**Lo que se hizo:** 
- Se construyó el controlador `CarreraReadViewSet` componiendo de forma granular los mixins de DRF (`ListModelMixin`, `RetrieveModelMixin`, `DestroyModelMixin` y `GenericViewSet`). Esto evita habilitar métodos de edición (PUT, PATCH) ya que los montos totales y detalles de una carrera son inmutables tras su registro.
- Se delegó la acción de eliminación sobrescribiendo el método `perform_destroy` para que ejecute el método `void()` del modelo, garantizando un borrado lógico, atómico e idempotente (cambio de estado a inactivo tanto en la cabecera como en los detalles).
- En `apps/sale/views.py`, se enlazó el método GET de la colección hacia la vista transaccional preexistente (`SaleCollectionAPIView`), reutilizando el queryset optimizado (`select_related` y `prefetch_related`) y su respectivo serializador.
- Se configuró explícitamente el enrutamiento del detalle en `apps/sale/urls.py` (`carreras/<int:pk>/`), asignando de forma manual los verbos HTTP GET y DELETE a sus respectivas acciones del ViewSet.
- Se agregaron nuevas pruebas unitarias al bloque de `SaleTransactionTests` comprobando que los montos históricos persisten correctamente (aun si las tarifas cambian después), que el listado expone los registros activos y que el proceso de anulación se ejecuta sin errores devolviendo código 204 y manteniendo las filas físicas en base de datos.

**Evidencia:**
![alt text](<EVIDENCIAS_ISS--XX/ISS--12.png>)

## ISS-13 — Django Admin

**Objetivo:** 
Habilitar la interfaz administrativa nativa de Django para explorar y gestionar las cinco entidades del negocio, configurando listas filtrables, buscadores y agrupamiento de campos, mientras se protegen las tablas transaccionales dejándolas en modo de solo lectura.

**Lo que se hizo:** 
- Se creó el perfil de superusuario del sistema (`createsuperuser`) para obtener acceso al panel de administración.
- En `apps/client/admin.py`, se registró el modelo de Pasajeros, configurando columnas editables en línea (`list_editable`), ordenamiento por defecto, y `fieldsets` para agrupar los datos personales separados de la auditoría.
- En `apps/product/admin.py`, se expuso el catálogo operativo (Empresas y Conductores). Se habilitó `autocomplete_fields` en el conductor para optimizar la asignación de su empresa, apoyado por `search_fields` en el modelo padre. Las consultas al listado de conductores fueron optimizadas sobrescribiendo `get_queryset` con `select_related("empresa")`.
- En `apps/sale/admin.py`, se registraron la Carrera y sus Detalles aplicando restricciones de seguridad: se anularon los métodos `has_add_permission` y `has_delete_permission` (retornando `False`) para impedir la alteración manual de los totales o la evasión de las reglas de negocio. 
- Se estructuró la vista de la Carrera incorporando un `TabularInline` de solo lectura (`extra=0`) para inspeccionar el detalle de cobro directamente desde la cabecera.
- Se validó la consistencia de toda la configuración mediante `python manage.py check`, arrojando cero problemas.

**Evidencia:**
![alt text](<EVIDENCIAS_ISS--XX/ISS--13.png>)

## ISS-14 — OpenAPI

**Objetivo:** 
Publicar el contrato interactivo de la API mediante un esquema generado automáticamente a partir de las vistas del sistema, evitando el mantenimiento de un archivo YAML manual y garantizando la coherencia entre el código y la documentación.

**Lo que se hizo:** 
- Se instaló la biblioteca `drf-spectacular` y se actualizó el archivo `requirements.txt`.
- Se configuró el generador de esquemas en `config/settings/__init__.py` dentro de la variable `REST_FRAMEWORK`.
- Se definieron los `SPECTACULAR_SETTINGS`, activando la conversión a formato `camelCase` para que la documentación de Swagger coincida con la serialización JSON del proyecto.
- Se agregaron las rutas literales de la documentación (`schema/`, `swagger-ui/` y `redoc/`) en el enrutador principal `config/urls.py` bajo el prefijo `api/`.
- Se decoraron las vistas transaccionales personalizadas en `apps/sale/views.py` utilizando `@extend_schema`, definiendo explícitamente los serializadores de entrada y salida para que Swagger pueda interpretar correctamente los métodos POST y GET que no heredan de ViewSets genéricos.
- Se verificó la consistencia estructural del esquema ejecutando `python manage.py spectacular --validate`, finalizando sin errores.

**Evidencia:**
![alt text](<EVIDENCIAS_ISS--XX/ISS--14.png>)

---

## Cierre de la Fase I — Business

**Resumen de la fase:** 
Esta fase establece el núcleo operativo y de negocio del sistema MoviCab sin depender de capas de seguridad o tokens (acceso OPEN temporal). Se ha completado la construcción de las cinco entidades principales del dominio: `Pasajero`, `Empresa`, `Conductor`, `Carrera` y `DetalleCarrera`. 

**Logros técnicos consolidados:**
- **Integridad referencial y estado:** Implementación de herencia base (`StoreLabModel`) para auditoría de fechas y control de borrado lógico (estado activo/inactivo). Uso estricto de restricciones `RESTRICT` en las claves foráneas.
- **Catálogo Operativo:** Exposición de endpoints bajo CRUDs homogéneos (`ModelViewSet`) para la gestión de actores del sistema, junto con lecturas especializadas (`ListAPIView`) para filtrar conductores disponibles.
- **Transaccionalidad (ACID):** El registro de carreras opera bajo el bloque `transaction.atomic()` y bloqueos `select_for_update()`, preservando el precio histórico cobrado, validando los estados de los actores y garantizando el *rollback* íntegro ante cualquier excepción.
- **Gestión Administrativa:** El Django Admin se configuró para inspección profunda, permitiendo correcciones sobre el catálogo pero bloqueando estrictamente la manipulación física o edición de totales en la tabla de carreras y detalles.

**Verificación Integral:**
Se ejecutó la suite completa de pruebas unitarias sobre las reglas de negocio de la Fase I.

**Evidencia:**
![alt text](<EVIDENCIAS_ISS--XX/ISS--14.png>)

## ISS-15 — RefreshToken

**Objetivo:** 
Persistir las sesiones de usuario mediante tokens de refresco (*refresh tokens*) en la base de datos, garantizando la seguridad al guardar únicamente el hash criptográfico del token y no su valor en texto claro, sin depender de la lista negra por defecto de SimpleJWT.

**Lo que se hizo:** 
- Se instaló la biblioteca `djangorestframework-simplejwt` y se configuraron las variables de entorno en `config/settings/__init__.py`, definiendo los tiempos de vida del Access Token y desactivando la rotación automática de la librería para gestionarla internamente.
- Se creó el módulo `apps/security/tokens.py` implementando la generación de cadenas aleatorias criptográficamente seguras (`secrets.token_urlsafe`) y su respectivo cifrado irreversible mediante SHA-256 (`hashlib.sha256`).
- Se definió el modelo `RefreshToken` en `apps/security/models.py`, enlazado mediante clave foránea al usuario del sistema (`User`). Este modelo almacena el `token_hash`, un `family_id` para agrupar cadenas de rotación, las fechas de expiración/revocación y el estado lógico de la sesión.
- Se generaron y aplicaron las migraciones correspondientes en la aplicación `security`, materializando exitosamente la tabla física `refresh_tokens` en la base de datos como base de la Fase II.

**Evidencia:**
![alt text](<EVIDENCIAS_ISS--XX/ISS--15.png>)

## ISS-16 — Role, RoleUser, Resource y ResourceRole

**Objetivo:** 
Modelar una matriz de autorización personalizada basada en roles (RBAC) para controlar el acceso a los distintos endpoints del sistema, reemplazando el sistema de permisos y grupos por defecto de Django por una estructura más granular y orientada a las reglas de negocio.

**Lo que se hizo:** 
- Se agregaron cuatro nuevos modelos en `apps/security/models.py`: `Role` (perfiles como ADMIN, DESPACHO, etc.), `RoleUser` (asignación de perfiles a usuarios), `Resource` (rutas y métodos HTTP de la API) y `ResourceRole` (los permisos efectivos otorgados a cada rol).
- Se implementó la clase de opciones `HttpMethod` para restringir los verbos HTTP permitidos (GET, POST, PUT, PATCH, DELETE).
- Se aplicó el principio de "denegación por defecto": todas las entidades y relaciones nacen con el estado `INACTIVE`, requiriendo una activación explícita para que el permiso tenga efecto real en el sistema.
- Se protegieron las tablas a nivel de base de datos definiendo restricciones de unicidad (`UniqueConstraint`) para evitar asignaciones duplicadas (usuario-rol, recurso-rol, método-ruta) y restricciones lógicas (`CheckConstraint`) para el estado de los registros.
- Se establecieron claves foráneas con `models.RESTRICT` para asegurar la integridad referencial y evitar el borrado accidental de configuraciones de seguridad en uso.
- Se generaron y aplicaron las migraciones en la base de datos, creando exitosamente las tablas físicas `roles`, `role_users`, `resources` y `resource_roles`.

**Evidencia:**
![alt text](<EVIDENCIAS_ISS--XX/ISS--16.png>)

## ISS-17 — Login OPEN

**Objetivo:** 
Proveer un endpoint público (OPEN) para que los usuarios demuestren su identidad mediante `username` o `email` y contraseña, entregando a cambio un Access Token temporal y un Refresh Token de sesión persistente.

**Lo que se hizo:** 
- Se crearon los serializadores en `apps/security/serializers.py` (`LoginSerializer`, `TokenPairSerializer`, etc.) para estandarizar la captura de credenciales y la emisión de la carga útil del token.
- Se implementó `LoginAPIView` en `apps/security/auth_views.py`. Se vació explícitamente la lista `authentication_classes = []` para evitar que el framework intente validar tokens preexistentes (o caducados) en los encabezados antes de leer el cuerpo de la petición.
- Se programó la lógica de autenticación que busca al usuario (por nombre o correo), verifica que su estado sea `ACTIVE`, comprueba su contraseña mediante `check_password()`, y responde con un código genérico `401 Unauthorized` si algún paso falla (evitando enumeración de usuarios).
- Se conectó la vista con SimpleJWT para emitir el Access Token, mientras que el Refresh Token se generó, hasheó y guardó utilizando nuestras funciones personalizadas y el modelo `RefreshToken` creado en el ISS-15.
- Se enrutó el endpoint en `apps/security/urls.py` bajo la ruta `auth/login/`.
- Se decoró la vista con `@extend_schema` para integrarla limpiamente a la documentación OpenAPI.
- Se desarrolló el utilitario de pruebas `create_active_user` y se ejecutaron los tests en `AuthFlowTests`, confirmando que el acceso legítimo genera los tokens correctamente (y guarda el hash en la base de datos) y que las credenciales inválidas o usuarios inactivos son rechazados de forma segura.

**Evidencia:**
![alt text](<EVIDENCIAS_ISS--XX/ISS--17.png>)

## ISS-18 — Refresh con rotación

**Objetivo:** 
Permitir la renovación del Access Token entregando un nuevo par de credenciales y rotando el Refresh Token en cada uso, aplicando una política de seguridad estricta: si se detecta la reutilización de un token anterior, se asume un compromiso y se revoca inmediatamente toda la familia de la sesión.

**Lo que se hizo:** 
- Se creó el controlador `RefreshAPIView` en `apps/security/auth_views.py` con acceso `OPEN` (`AllowAny`), ya que se encarga de validar un token de refresco que no requiere autorización Bearer previa en las cabeceras.
- Se encapsuló la lectura y actualización de la base de datos dentro de `transaction.atomic()` utilizando `select_for_update()` sobre el hash del token. Esto previene condiciones de carrera si se envían peticiones simultáneas de refresco.
- Se programó la lógica de rotación: un token válido genera uno nuevo heredando su `family_id` y marcando el anterior en el campo `replaced_by`. Si el token consultado ya había sido reemplazado o revocado (intento de reuso), el sistema revoca automáticamente toda la familia actualizando el campo `revoked_at` y pasando a `INACTIVE` todos los registros asociados a ese `family_id`.
- Se registró el endpoint en `apps/security/urls.py` bajo la ruta `auth/refresh/`.
- Se incorporó la prueba unitaria `test_refresh_rotates_and_reuse_revokes_family` en `AuthFlowTests`, validando con éxito la emisión del nuevo token y el bloqueo íntegro de la familia ante el intento de reutilización simulado.

**Evidencia:**
![alt text](<EVIDENCIAS_ISS--XX/ISS--18.png>)

## ISS-19 — Logout

**Objetivo:** 
Invalidar el token de refresco presentado por el cliente para cerrar la sesión activa, garantizando que el sistema no almacene información innecesaria de los Access Tokens (los cuales expiran de forma independiente por su propia firma criptográfica).

**Lo que se hizo:** 
- Se creó el serializador `LogoutSerializer` en `apps/security/serializers.py` para validar la presencia del parámetro `refresh` en el cuerpo de la petición.
- Se implementó la vista `LogoutAPIView` en `apps/security/auth_views.py` bajo un acceso público (`AllowAny`), dado que la credencial que autentica la acción es el propio Refresh Token y no una cabecera Bearer.
- Se programó la lógica de invalidación atómica utilizando transacciones concurrentes con `select_for_update()`: si el token ya había sido reemplazado previamente (lo que denota un potencial intento de reuso o suplantación), se procede a revocar toda la familia de la sesión; en cualquier otro caso, el token actual se marca como inactivo (`INACTIVE`) y se registra su marca de tiempo en `revoked_at`, respondiendo con un código `204 No Content`.
- Se configuró la ruta del endpoint en `apps/security/urls.py` bajo el recurso `auth/logout/`.
- Se desarrolló la prueba unitaria `test_logout_invalidates_refresh` dentro de `AuthFlowTests`, verificando que tras cerrar sesión de manera exitosa, el intento posterior de utilizar ese mismo token para refrescar la sesión es rechazado rigurosamente con un código `401 Unauthorized`.

**Evidencia:**
![alt text](<EVIDENCIAS_ISS--XX/ISS--19.png>)

## ISS-20 — Perfil JWT con token

**Objetivo:** 
Permitir que un usuario autenticado mediante su Access Token pueda consultar y actualizar su propio perfil (identidad y datos generales), asegurando que la vigencia del token se complemente con una validación en base de datos para rechazar de inmediato a usuarios desactivados.

**Lo que se hizo:** 
- Se implementó la clase de autenticación personalizada `StoreLabJWTAuthentication` en `apps/security/authentication.py`, heredando de SimpleJWT para añadir una verificación adicional sobre el usuario obtenido del token, asegurando que su estado permanezca activo (`ACTIVE`).
- Se registró esta nueva clase en `config/settings/__init__.py` dentro de `DEFAULT_AUTHENTICATION_CLASSES`.
- Se desarrolló el `ProfileSerializer` en `apps/security/serializers.py` para mapear los campos del usuario, protegiendo `username` y `status` como estrictamente de solo lectura y excluyendo la contraseña.
- Se implementó la vista `ProfileAPIView` en `apps/security/rbac_views.py` utilizando `RetrieveUpdateAPIView`, permitiendo los métodos GET y PATCH de forma exclusiva sobre el objeto del usuario en curso (`request.user`) sin requerir identificadores (`pk`) en la URL.
- Se configuró la ruta del recurso en `apps/security/urls.py` bajo la dirección `auth/profile/`.
- Se desarrolló y ejecutó con éxito la prueba unitaria `test_profile_requires_token_and_rejects_inactive_user`, comprobando que las peticiones anónimas son denegadas con código `401 Unauthorized`, que los cambios mediante PATCH se guardan correctamente, y que si un usuario pasa a estado inactivo, su token vigente es invalidado automáticamente.

**Evidencia:**
![alt text](<EVIDENCIAS_ISS--XX/ISS--20.png>)

## ISS-21 — HasResourceAccess

**Objetivo:** 
Implementar la clase de permisos personalizada `HasResourceAccess` para autorizar las solicitudes HTTP en función del método y el patrón de ruta del recurso, aplicando estrictamente el principio de denegación por defecto a lo largo de toda la cadena de relaciones del modelo RBAC.

**Lo que se hizo:** 
- Se creó el archivo `apps/security/permissions.py` conteniendo la clase `HasResourceAccess`, la cual hereda de `BasePermission` de Django REST Framework.
- Se programó la validación en `has_permission`, asegurando que el usuario esté autenticado y se encuentre en estado activo (`ACTIVE`), además de manejar adecuadamente las peticiones `OPTIONS` (preflight) y estandarizar el método `HEAD` como un `GET`.
- Se integró una consulta optimizada que verifica la existencia (`exists()`) de una concesión activa en la tabla `ResourceRole`, evaluando simultáneamente que el recurso, el rol, la asignación del usuario (`RoleUser`) y la relación misma se mantengan en estado activo (`ACTIVE`).
- Se garantizó la correcta diferenciación de códigos de estado HTTP según el estándar de Django REST Framework: devolviendo `401 Unauthorized` si no existe identidad autenticada, o `403 PermissionDenied` si el usuario se encuentra autenticado pero carece de la concesión activa requerida para el recurso.

**Evidencia:**
![alt text](<EVIDENCIAS_ISS--XX/ISS--21.png>)

# Informe de Implementación — ISS-22: RBAC sobre el negocio

## 1. Objetivo
Transición de los endpoints de negocio de MoviCab (pasajeros, empresas, conductores y carreras) desde el esquema abierto de la Fase I hacia la capa de seguridad estricta basada en **JWT + RBAC (Control de Acceso Basado en Roles)**. Garantizar que ningún recurso protegido sea accesible sin un token de autenticación válido y privilegios explícitamente concedidos en la matriz de seguridad.

---

## 2. Construcción y Componentes Modificados

### A. Vistas de Negocio (`views.py`)
En los viewsets y vistas de `apps.client`, `apps.product` y `apps.sale`, se reemplazó el permiso abierto por la combinación requerida de autenticación y validación de matriz de recursos:
* **Remoción**: `from rest_framework.permissions import AllowAny` / `permission_classes = [AllowAny]`
* **Adición**: 
  ```python
  from rest_framework.permissions import IsAuthenticated
  from apps.security.permissions import HasResourceAccess

  permission_classes = [IsAuthenticated, HasResourceAccess]
  ```

### B. Configuración Global (`config/settings/__init__.py`)
Se actualizó el comportamiento por defecto de Django REST Framework para cerrar el acceso globalmente:
```python
"rest_framework.permissions.IsAuthenticated",
```

### C. Helper de Pruebas Automatizadas (`apps/common/testing.py`)
Se incorporaron las funciones de siembra de roles y recursos (`grant` y `grant_crud`), encargadas de resolver dinámicamente las rutas de la API y asociar permisos activos:
```python
from django.urls import resolve
from apps.common.status import RecordStatus
from apps.security.models import Resource, ResourceRole, Role, RoleUser, User

def grant(user, method, path, role_name=None):
    role, _created = Role.objects.get_or_create(
        name=role_name or f"test-role-{user.pk}",
        defaults={"description": "Rol de prueba", "status": RecordStatus.ACTIVE},
    )
    RoleUser.objects.get_or_create(
        role=role,
        user=user,
        defaults={"status": RecordStatus.ACTIVE},
    )
    match = resolve(path)
    resource, _created = Resource.objects.get_or_create(
        method=method.upper(),
        route=match.route,
        defaults={
            "name": f"{method.upper()} {match.route}",
            "status": RecordStatus.ACTIVE,
        },
    )
    ResourceRole.objects.get_or_create(
        resource=resource,
        role=role,
        defaults={"status": RecordStatus.ACTIVE},
    )
    return role

def grant_crud(user, collection, detail):
    grant(user, "GET", collection)
    grant(user, "POST", collection)
    for method in ("GET", "PUT", "PATCH", "DELETE"):
        grant(user, method, detail)
```

---

## 3. Criterios de Aceptación y Verificación (GATE)

| Criterio | Descripción | Evidencia | Resultado |
| :--- | :--- | :--- | :--- |
| **AC-22-01** | Negocio con RBAC mediante usuario concedido | EVI-22-01: Suite de pruebas en verde (`apps.client`, `apps.product`, `apps.sale`) | **PASS** |
| **AC-22-02** | Deny by default (sin concesión responde con códigos de denegación) | EVI-22-02: Pruebas de carencia de privilegios (`403` / `401`) | **PASS** |
| **AC-22-03** | El perfil de usuario permanece aislado de la matriz RBAC | `ProfileAPIView.permission_classes` exclusivo de JWT | **PASS** |

---

## 4. Conclusión
El hito **ISS-22** ha sido implementado y verificado exitosamente. La suite de pruebas de MoviCab se encuentra completamente en verde, garantizando una arquitectura robusta, segura y alineada con los lineamientos de control de acceso basados en roles.

**Evidencia:**
![alt text](<EVIDENCIAS_ISS--XX/ISS--22.png>)

# Informe Técnico: Implementación y Verificación del ISS-23 (CRUD de la Matriz de Seguridad)

## 1. Resumen Ejecutivo
Se implementó y verificó de forma exitosa el conjunto completo de operaciones CRUD para la matriz de seguridad (`users`, `roles`, `role-users`, `resources`, y `resource-roles`) en el proyecto **MoviCab**. Se integró el patrón `SoftDeleteModelViewSet` para el manejo estricto de la baja lógica (cambio de estado a `INACTIVE` en lugar de eliminación física) y se validó el flujo de cifrado seguro de contraseñas mediante `set_password()`. 

Asimismo, se validó la cadena de autorización de extremo a extremo mediante la clase de pruebas automatizadas `SecurityMatrixApiTests`, garantizando que el consumo de cualquier recurso protegido bajo el modelo RBAC exija la concurrencia activa de todos sus eslabones.

---

## 2. Componentes Arquitectónicos Implementados

### 2.1. Serializers de Seguridad (`apps/security/serializers.py`)
* **`UserSerializer`**: Configurado con el campo `password` marcado como `write_only=True` para evitar la exposición de credenciales en respuestas HTTP. Se sobrescribieron los métodos `create` y `update` para asegurar que las contraseñas se procesen y almacenen cifradas mediante `user.set_password()`.
* **Serializers de la Matriz**: Se habilitaron los serializers basados en `ModelSerializer` para `Role`, `RoleUser`, `Resource` y `ResourceRole`.

### 2.2. Vistas y Baja Lógica (`apps/security/rbac_views.py`)
* **`SoftDeleteModelViewSet`**: Clase base para los ViewSets de la matriz que incorpora por defecto los permisos `[IsAuthenticated, HasResourceAccess]` y filtra los querysets según el parámetro de estado (`?status=`).
* **Baja Lógica (`perform_destroy`)**: Sobrescrita para interceptar las peticiones `DELETE` y actualizar el campo `status` a `RecordStatus.INACTIVE` preservando la integridad referencial.

### 2.3. Enrutamiento (`apps/security/urls.py`)
* Se integró un `SimpleRouter` de Django REST Framework para registrar de forma dinámica los cinco endpoints de la matriz:
  * `/api/users/`
  * `/api/roles/`
  * `/api/role-users/`
  * `/api/resources/`
  * `/api/resource-roles/`

---

## 3. Matriz de Criterios de Aceptación y Verificación (GATE)

| ID Criterio | Descripción del Requerimiento | Evidencia Técnica / Implementación | Estado |
| :--- | :--- | :--- | :--- |
| **AC-23-01** | El serializer del usuario no expone ni devuelve el campo de contraseña. | Atributo `password = serializers.CharField(write_only=True)` en `UserSerializer`. | **APROBADO** |
| **AC-23-02** | Las contraseñas son procesadas de manera segura mediante hash. | Invocación de `user.set_password()` en los hooks de creación y actualización. | **APROBADO** |
| **AC-23-03** | La eliminación de registros ejecuta baja lógica (`INACTIVE`). | Método `perform_destroy` modificado para mutar el estado a `INACTIVE`. | **APROBADO** |
| **AC-23-04** | El acceso a un recurso sin el rol asignado responde con `403 Forbidden`. | Verificado en las pruebas automatizadas (paso de validación sin permisos). | **APROBADO** |
| **AC-23-05** | La cadena completa activa (`User` + `RoleUser` + `Role` + `ResourceRole` + `Resource`) autoriza con `200 OK`. | Validación exitosa mediante el test automatizado `test_user_role_resource_chain`. | **APROBADO** |

---

## 4. Resultados de las Pruebas Automatizadas

La ejecución de las pruebas unitarias e integrales del módulo de seguridad arrojó un resultado exitoso sin errores en la base de datos de pruebas:

```bash
Found 2 test(s).
Creating test database for alias 'default'...
System check identified no issues (0 silenced).
.
.
----------------------------------------------------------------------
Ran 2 tests in 4.026s

OK
Destroying test database for alias 'default'...
```

* **`test_role_crud`**: Verifica el ciclo completo de creación, consulta por ID y baja lógica de los roles en la API.
* **`test_user_role_resource_chain`**: Evalúa de forma estricta los estados de denegación (`403 Forbidden`) y la concesión final de acceso (`200 OK`) al enlazar correctamente la matriz RBAC.

**Evidencia:**
![alt text](<EVIDENCIAS_ISS--XX/ISS--23.png>)

# Informe de Implementación — ISS-24: Semilla RBAC y Swagger con Bearer

## 1. Resumen Ejecutivo
Se configuró exitosamente la extensión de autenticación Bearer para `drf-spectacular` (`StoreLabJWTScheme`), garantizando que la interfaz de Swagger UI reciba tokens JWT de manera transparente sin prefijos manuales. Asimismo, se implementó el comando de gestión personalizado `seed_rbac` para poblar y sincronizar automáticamente la matriz de permisos de seguridad mediante resolución dinámica de rutas reales, asociando privilegios completos al rol `admin`.

## 2. Componentes Construidos y Modificados
* **Esquema OpenAPI (`apps/security/schema.py`)**: 
  * Creación de `StoreLabJWTScheme` heredando de `OpenApiAuthenticationExtension` para mapear `StoreLabJWTAuthentication` al esquema de seguridad `bearerAuth` (`type: http`, `scheme: bearer`, `bearerFormat: JWT`).
* **Configuración de Aplicación (`apps/security/apps.py`)**:
  * Adición del método `ready(self)` para importar implícitamente el módulo `schema` al iniciar el servidor de Django.
* **Comando de Siembra (`apps/security/management/commands/seed_rbac.py`)**:
  * Recorrido dinámico de muestras de rutas (`clients`, `product-types`, `products`, `sales`, y módulos de seguridad).
  * Uso de `resolve(path).route` para asegurar que las rutas guardadas utilicen el patrón exacto esperado por los permisos (`<int:pk>`).
  * Creación y reactivación del rol `admin` junto a la asociación masiva de recursos y la asignación opcional de usuarios vía `--username`.

---

## 3. Matriz de Criterios de Aceptación (GATE)

| Criterio | Descripción | Evidencia Técnica / Comando | Resultado |
| :--- | :--- | :--- | :--- |
| **AC-24-01** | El comando `seed_rbac` finaliza de forma correcta. | `python manage.py seed_rbac --username admin` | **PASS** |
| **AC-24-02** | Las rutas almacenadas utilizan el patrón estándar `<int:pk>`. | Verificación en base de datos (`Resource.route`) | **PASS** |
| **AC-24-03** | La validación del esquema con Spectacular no arroja fallos estructurales de Bearer. | `python manage.py spectacular --validate` (Exit Code 0) | **PASS** |


**Evidencias_1:**
![alt text](<EVIDENCIAS_ISS--XX/ISS--24.png>)

**Evidencias_2:**
![alt text](<EVIDENCIAS_ISS--XX/ISS--24-1.png>)


# Informe de Implementación — ISS-25: Pruebas 401 y 403

## 1. Resumen Ejecutivo
Se implementó y verificó con éxito la diferenciación estricta entre el código de estado HTTP `401 Unauthorized` (falta de identidad o identidad no vigente) y el código `403 Forbidden` (identidad vigente pero sin concesión de permisos RBAC). Mediante la incorporación de la clase `RbacTests`, se aseguró el cumplimiento de las políticas de seguridad corporativas, validando que cualquier eslabón inactivo dentro de la cadena (Rol, RoleUser, ResourceRole o Resource) deniegue el acceso de forma controlada.

## 2. Componentes Construidos y Modificados
* **Pruebas de Aislamiento y Denegación (`apps/security/tests.py`)**: 
  * Adición de la clase `RbacTests` para evaluar de manera explícita el comportamiento del sistema frente a solicitudes sin credenciales (anónimas) y solicitudes con identidad autenticada pero carentes de privilegios.
  * Verificación automatizada de la inactividad en los eslabones de la matriz RBAC, comprobando la respuesta `403 FORBIDDEN` ante rupturas en la cadena de autorización.

---

## 3. Matriz de Criterios de Aceptación (GATE)

| Criterio | Descripción | Evidencia Técnica / Comando | Resultado |
| :--- | :--- | :--- | :--- |
| **AC-25-01** | La suite de pruebas de las aplicaciones pasa de manera exitosa. | `python manage.py test apps` (8/8 pruebas OK) | **PASS** |
| **AC-25-02** | Existe un caso de prueba automatizado cuyo resultado esperado es `401`. | `test_missing_grant_is_403_and_missing_identity_is_401` | **PASS** |
| **AC-25-03** | Existe un caso de prueba automatizado cuyo resultado esperado es `403`. | `test_missing_grant_is_403_and_missing_identity_is_401` y `test_any_inactive_link_denies` | **PASS** |
| **AC-25-04** | Se comprueba que la ausencia de token de autenticación no genera un código `403`, sino `401`. | Validación explícita de petición anónima | **PASS** |

**Evidencias:**
![alt text](<EVIDENCIAS_ISS--XX/ISS--25.png>)