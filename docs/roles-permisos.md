# Roles y permisos (issue #4)

Cómo está organizado el acceso al sistema: quién inicia sesión, qué puede
hacer cada rol, y qué contrato cumple la API para que las issues de la Fase 1
(#5-#9) apliquen la matriz a sus recursos al construirlos.

## 1. Roles del staff

Solo el staff inicia sesión; los socios no son usuarios del sistema. Hay tres
roles:

| Rol | Quién es | Acceso a `/admin/` |
|---|---|---|
| **admin** | El dueño del gimnasio | Sí (es el único) |
| **recepcion** | Personal de recepción | No |
| **profesor** | Profesores | No |

- El dueño se crea por línea de comandos (`python manage.py createsuperuser`,
  pide nombre, apellido, teléfono y rol queda en `admin`) y es el único con
  acceso a `/admin/` (`is_staff=True`).
- Los demás cuentas de staff se crean y administran **desde `/admin/`**: alta
  con username, nombre, apellido, teléfono, rol y contraseña; después se puede
  editar el rol, el teléfono y desactivar la cuenta. Ningún formulario del
  admin concede privilegios de administrador.
- Sin internet no hay correos: si alguien olvida su contraseña, el dueño la
  resetea desde `/admin/` y cada quien cambia la suya desde **Mi perfil** en
  la aplicación.
- La identificación en pantalla es siempre **nombre y apellido**, nunca el
  username.

## 2. Matriz de permisos (contrato de la Fase 1)

Toda la Fase 1 se rige por esta matriz. "—" significa que el rol no ve el
recurso: para él no existe.

| Recurso | Admin | Recepción | Profesor |
|---|---|---|---|
| Socios | CRUD | CRUD | Solo lectura (+ estado de membresía) |
| Membresías | CRUD | CRUD | — |
| Pagos | CRUD | CRUD | — |
| Dashboard | Sí | Sí | — |
| Respaldos | Sí | — | — |
| Staff (usuarios) | CRUD (vía `/admin/`) | — | — |
| Mi perfil (contraseña propia) | ✓ | ✓ | ✓ |

Los recursos de negocio no existen todavía: la issue #4 entrega el
**mecanismo de enforcement** (modelo de roles, capa de permisos, contrato
404) verificado con tests. Cada issue de la Fase 1 declara su parte de la
matriz al construir sus vistas.

## 3. Contrato de la API

Reglas que cumplen todos los endpoints de negocio y que la SPA usa:

1. **404 para lo no autorizado.** Un recurso de negocio sin sesión, con la
   sesión vencida o sin permiso responde **404**, indistinguible de un
   recurso inexistente. Solo los endpoints de sesión tienen comportamiento
   definido sin sesión: `POST /api/auth/login/`, `POST /api/auth/logout/`,
   `GET /api/auth/csrf/` y `GET /api/me/`.
2. **403 solo por CSRF.** Todo write (POST/PUT/PATCH/DELETE) exige el header
   `X-CSRFToken` con el valor de la cookie `csrftoken` (patrón estándar de
   Django para SPA, mismo origen, cero CORS). Sin ese header válido la
   respuesta es **403** — el único 403 del contrato.
3. **Sesión vencida.** Ante un 404 en una llamada de datos, la SPA sondea
   `/api/me/`: si también responde 404, la sesión venció y se vuelve al login.

### Cómo declara sus permisos una vista de negocio

```python
class SocioViewSet(ModelViewSet):
    queryset = Socio.objects.all()
    serializer_class = SocioSerializer
    read_roles = ('admin', 'recepcion', 'profesor')   # GET/HEAD/OPTIONS
    write_roles = ('admin', 'recepcion')              # POST/PUT/PATCH/DELETE
```

La capa es *fail-closed*: una vista que no declara `read_roles`/`write_roles`
responde 404 a todo el mundo. El valor por defecto de DRF
(`apps.accounts.permissions.RoleRequired`) y la autenticación
(`apps.accounts.authentication.SessionAuthentication`) ya están configurados
en `backend/config/settings.py`; los tests de contrato viven en
`backend/apps/accounts/tests/test_permissions.py`.

## 4. Limitación conocida: HTTP plano en la red local

El sistema se sirve por **HTTP sin cifrar** dentro de la red local del
gimnasio (`http://<IP-de-la-PC>:8000`). Esto es una **decisión aceptada**:

- No hay internet en el gimnasio, así que el tráfico nunca sale de la LAN.
- El riesgo real es que alguien dentro de la red (misma oficina, misma
  conexión) intercepte credenciales o datos.
- Es **endurecible más adelante** (TLS local con certificado propio) sin
  cambiar el código de la aplicación; hasta que eso ocurra queda documentado
  aquí como limitación conocida.
