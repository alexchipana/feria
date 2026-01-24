# Guía de Despliegue - Feria 16 de Julio

Sigue estos pasos detallados para configurar tu base de datos en Supabase y desplegar la aplicación en GitHub Pages.

---

## 1. Configuración de Supabase

### A. Crear Proyecto
1. Ve a [Supabase](https://supabase.com/) e inicia sesión.
2. Crea un **New Project**.
3. Ponle un nombre (ej. `feria-16-julio`) y una contraseña para la base de datos.
4. Espera a que el proyecto termine de configurarse.

### B. Ejecutar el Esquema (SQL)
1. En el menú lateral izquierdo de Supabase, ve a **SQL Editor**.
2. Haz clic en **New Query**.
3. Copia todo el contenido del archivo [schema.sql](file:///d:/Antigravity/mapa%20de%20la%20feria/supabase/schema.sql) de tu proyecto local.
4. Pégalo en el editor de Supabase y haz clic en **Run**. Esto creará todas las tablas y políticas de seguridad (RLS).

### C. Configurar el Almacenamiento (Storage)
1. Ve a **Storage** en el menú lateral.
2. Haz clic en **New Bucket**.
3. Ponle el nombre exacto: `stalls`.
4. **IMPORTANTE**: Activa la opción de **Public bucket**.
5. Haz clic en **Create Bucket**.

### D. Obtener Credenciales
1. Ve a **Project Settings** (el icono de engranaje) -> **API**.
2. Copia la `Project URL` y la `anon public API key`. Las necesitarás más adelante.

---

## 2. Configuración Local

1. En la raíz de tu proyecto local, crea un archivo llamado `.env` (si no existe).
2. Pega tus credenciales así:
   ```env
   VITE_SUPABASE_URL=tu_url_de_supabase
   VITE_SUPABASE_ANON_KEY=tu_anon_key_de_supabase
   ```

---

## 3. Subir a GitHub

### A. Inicializar Git
Abre una terminal en la carpeta del proyecto y ejecuta:
```bash
git init
git add .
git commit -m "Initial commit - Feria 16 de Julio Directory"
```

### B. Crear Repositorio en GitHub
1. Ve a [GitHub](https://github.com/) y crea un nuevo repositorio público.
2. Sigue las instrucciones de GitHub para conectar tu repositorio local (ej: `git remote add origin https://github.com/TU_USUARIO/TU_REPO.git`).
3. Sube el código:
   ```bash
   git branch -M main
   git push -u origin main
   ```

---

## 4. Despliegue en GitHub Pages

### A. Configurar GitHub Actions
He preparado el archivo de configuración para que el despliegue sea automático. Crea este archivo si no existe: `.github/workflows/deploy.yml`

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Install and Build
        run: |
          npm install
          npm run build
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}

      - name: Deploy
        uses: JamesIves/github-pages-deploy-action@v4
        with:
          folder: dist
```

### B. Configurar Secretos en GitHub
Para que GitHub Pages pueda conectarse a Supabase de forma segura:
1. En tu repositorio de GitHub, ve a **Settings** -> **Secrets and variables** -> **Actions**.
2. Crea dos **New repository secrets**:
   - `VITE_SUPABASE_URL`: (Pega tu Project URL de Supabase)
   - `VITE_SUPABASE_ANON_KEY`: (Pega tu anon public API key de Supabase)

### C. Activar GitHub Pages
1. En **Settings** -> **Pages**.
2. En **Build and deployment** -> **Source**, selecciona **GitHub Actions**.

¡Listo! Cada vez que hagas un `git push` a `main`, tu aplicación se actualizará automáticamente en tu URL de GitHub Pages.
