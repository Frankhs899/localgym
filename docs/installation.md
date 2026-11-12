# Instalación en la PC del gimnasio

Guía para instalar LocalGym en la computadora del gimnasio (decisión **D3**:
camino principal con Python + venv). Al terminar, esa PC sirve el sistema
completo — interfaz y API en un solo proceso y puerto — en la red local, el
servidor arranca solo con la PC, y los datos viven en una carpeta separada que
sobrevive a las actualizaciones. El staff entra desde cualquier navegador de
la red (PC, tablet o teléfono) con `http://<IP-de-la-PC>:8000`.

## Resumen de los pasos

| # | Paso | Resultado |
|---|---|---|
| 1 | Instalar Python y Node.js | Herramientas base listas |
| 2 | Copiar el código de la aplicación | Carpeta de la app (ej. `C:\LocalGym`) |
| 3 | Crear el entorno virtual | `backend\.venv` con las dependencias |
| 4 | Configurar `backend\.env` | Clave secreta, hosts y carpeta de datos |
| 5 | Preparar la base de datos | Migraciones + usuario administrador |
| 6 | Compilar la interfaz | `frontend\dist` |
| 7 | Probar el servidor | Sistema accesible en el puerto 8000 |
| 8 | Activar el autoarranque | El servidor inicia solo con la PC |

## Requisitos

- PC con **Windows 10 u 11** conectada a la red local del gimnasio.
- **Python 3.14** y **Node.js 24** con pnpm (solo se usan para instalar y
  actualizar; el día a día no los necesita).
- Para seguir la guía basta con saber copiar carpetas y editar un archivo de
  texto.

> **Importante — IP fija:** fija la IP de esta PC (reserva DHCP o IP estática
> en el router). Si la IP cambia, los accesos guardados por el staff dejan de
> funcionar y `LOCALGYM_ALLOWED_HOSTS` queda desactualizada.

## 1. Instalar Python y Node.js

1. Instala **Python 3.14** desde <https://www.python.org/downloads/>. Durante
   la instalación marca la casilla **"Add python.exe to PATH"**.
2. Instala **Node.js 24 LTS** desde <https://nodejs.org/>.
3. Habilita pnpm con la versión fijada del proyecto:

   ```bat
   corepack enable pnpm
   ```

4. Verifica las tres herramientas:

   ```bat
   python --version
   node --version
   pnpm --version
   ```

## 2. Copiar el código de la aplicación

Con Git (recomendado, facilita actualizar):

```bat
git clone https://github.com/Frankhs899/localgym.git C:\LocalGym
```

La rama `main` es la estable. Si no quieres usar Git: en GitHub, botón
**Code → Download ZIP** de la rama `main`, descomprime en `C:\LocalGym`.

## 3. Crear el entorno virtual

```bat
cd C:\LocalGym
python -m venv backend\.venv
backend\.venv\Scripts\pip install -r backend\requirements.txt
```

## 4. Configurar `backend\.env`

1. Copia la plantilla:

   ```bat
   copy backend\.env.example backend\.env
   ```

2. Abre `backend\.env` con un editor de texto y completa:

   **`LOCALGYM_SECRET_KEY`** — la clave secreta de esta instalación. Genera
   una con:

   ```bat
   backend\.venv\Scripts\python -c "from django.core.management.utils import get_random_secret_key as k; print(k())"
   ```

   **`LOCALGYM_ALLOWED_HOSTS`** — desde qué direcciones se puede entrar.
   Averigua la IP de esta PC con `ipconfig` (busca "Dirección IPv4") y pon:

   ```ini
   LOCALGYM_ALLOWED_HOSTS=localhost,127.0.0.1,192.168.1.50
   ```

   (reemplaza `192.168.1.50` por la IP real de la PC).

   **`LOCALGYM_DATA_DIR`** — la carpeta persistente de datos (base de datos y
   respaldos). Apúntala a una carpeta **fuera** del directorio de la app para
   que los datos sobrevivan a las actualizaciones:

   ```ini
   LOCALGYM_DATA_DIR=C:\LocalGymData
   ```

   Créala si no existe (el servidor también la crea solo al arrancar).

## 5. Preparar la base de datos

```bat
backend\.venv\Scripts\python backend\manage.py migrate
backend\.venv\Scripts\python backend\manage.py createsuperuser
```

`createsuperuser` crea tu usuario administrador para entrar al sistema.

## 6. Compilar la interfaz

```bat
cd C:\LocalGym\frontend
pnpm install
pnpm run build
```

Esto genera `frontend\dist`, la versión compilada que sirve el servidor.

## 7. Probar el servidor

Doble clic en `C:\LocalGym\scripts\start_server.bat`. El script prepara los
archivos estáticos y arranca el servidor en el puerto 8000.

- En la misma PC: abre <http://localhost:8000>.
- En otro equipo de la red: abre `http://<IP-de-la-PC>:8000`.

La primera vez, Windows Firewall pregunta si permitir el acceso: marca la
casilla de **redes privadas** y acepta. La ventana negra del servidor debe
quedar abierta mientras el sistema esté en uso.

## 8. Activar el autoarranque

Elige una de las dos opciones; el resultado es el mismo: el servidor arranca
cuando alguien inicia sesión en la PC.

### Opción A — Tarea programada (recomendada)

1. Pulsa `Win + R`, escribe `taskschd.msc` y acepta.
2. En el panel derecho, **Crear tarea…**
3. Pestaña **General**: nombre `LocalGym`.
4. Pestaña **Desencadenadores** → **Nueva…** → comienza la tarea: **Al
   iniciar sesión** (usuario actual) → **Aceptar**.
5. Pestaña **Acciones** → **Nueva…** → acción **Iniciar un programa** →
   examina hasta `C:\LocalGym\scripts\start_server.bat` → **Aceptar**.
6. Pestaña **Condiciones**: desmarca "Iniciar la tarea solo si el equipo está
   conectado a la corriente alterna" (laptops).
7. **Aceptar**. Prueba con clic derecho sobre la tarea → **Ejecutar**.

### Opción B — Acceso directo en la carpeta Inicio

1. Pulsa `Win + R`, escribe `shell:startup` y acepta.
2. Crea en esa carpeta un acceso directo a
   `C:\LocalGym\scripts\start_server.bat`.

Con cualquiera de las dos opciones aparece la ventana del servidor al iniciar
sesión: **explícale al staff no cerrarla**. Si se cierra por error, basta con
volver a ejecutar `start_server.bat`.

## Actualizar la aplicación

Los datos nunca se tocan: viven en `LOCALGYM_DATA_DIR`, fuera de la app.

```bat
cd C:\LocalGym
git pull
backend\.venv\Scripts\pip install -r backend\requirements.txt
backend\.venv\Scripts\python backend\manage.py migrate
cd frontend
pnpm install
pnpm run build
```

Reinicia el servidor (cierra su ventana y vuelve a ejecutar
`start_server.bat`).

## Respaldos

Todo lo importante vive en una sola carpeta: `LOCALGYM_DATA_DIR` — la base de
datos (`db.sqlite3`) y, dentro de `backups\`, los respaldos que genere el
sistema.

Hasta que la Fase 1 entregue el export/import desde la interfaz (issue #9),
el respaldo manual es simple: **con el sistema sin uso** (p. ej. al cierre),
copia `db.sqlite3` a una memoria USB o disco externo y guárdala fuera de la
PC. El sistema sin respaldo no debe existir.

## Solución de problemas

| Síntoma | Causa probable | Solución |
|---|---|---|
| Error 400 al entrar desde otro equipo | La IP no está en `LOCALGYM_ALLOWED_HOSTS` | Agrégala y reinicia el servidor |
| En la PC funciona pero en otros equipos no carga | Firewall bloquea el puerto 8000 | Permite Python en redes privadas en el Firewall |
| "Frontend build not found" en la página | Falta el paso 6 | `pnpm install` y `pnpm run build` en `frontend` |
| El puerto 8000 está ocupado | Otra aplicación lo usa | Ciérrala, o edita el puerto en `start_server.bat` |
| Dejó de funcionar después de cambiar la PC de red | La IP cambió | Fija la IP nueva, actualiza `LOCALGYM_ALLOWED_HOSTS` y avisa al staff el nuevo acceso |

## Lista de verificación

- [ ] El sistema responde en `http://localhost:8000` desde la PC
- [ ] Otro equipo de la red entra a `http://<IP-de-la-PC>:8000`
- [ ] El servidor arranca solo al reiniciar sesión en la PC
- [ ] `LOCALGYM_DATA_DIR` queda fuera de la carpeta de la aplicación
- [ ] Existe una copia de `db.sqlite3` guardada fuera de la PC
