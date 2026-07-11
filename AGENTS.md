# AGENTS.md

## Cursor Cloud specific instructions

This is a single **Laravel 11 + Inertia.js + React (Vite)** app ("Mas Que Surf", a Spanish-language surf school / surf shop). PHP 8.3, Composer, Node 22 and MySQL 8 are provisioned by the startup update script. Standard commands live in `composer.json` (`composer dev`, scripts) and `package.json`.

### Running the app (dev)
- Start everything with `composer dev` (runs `php artisan serve` on port 8000, `php artisan queue:listen`, and `npm run dev`/Vite). App: `http://localhost:8000`.
- The Vite dev server binds to IPv6 `http://[::1]:5173` and writes `public/hot`. The rendered pages reference that `[::1]` URL for JS, so use a browser that can reach IPv6 localhost. Access the app through the Laravel server on port 8000, not Vite directly.
- MySQL is not managed by systemd here; start it with `sudo service mysql start` if it is not already running. DB `mas_que_surf`, user `root`, empty password over `127.0.0.1:3306`.

### Non-obvious gotchas
- **Case-sensitive import bugs (break on Linux/CI):** the code has import paths whose casing does not match the real files, which works on case-insensitive macOS/Windows but fails on Linux with Vite `Failed to resolve import`. Known mismatches: `@/Components/*` and `@/Layouts/*` (real dirs are lowercase `components`/`layouts`) and `../components/Menu_principal` (real file is `Menu_Principal.jsx`). The startup update script creates compatibility symlinks (`resources/js/Components -> components`, `resources/js/Layouts -> layouts`, `resources/js/components/Menu_principal.jsx -> Menu_Principal.jsx`) and git-excludes them so the app runs unmodified on Linux. **Do not commit these symlinks** (they collide with the real files on case-insensitive filesystems). The real fix is for the maintainer to correct the import casing. To re-detect mismatches after code changes you can scan imports vs. real file casing under `resources/js`. (`resources/js/layouts/Layout2_login_inicio.jsx` imports a genuinely missing `Menu_login` component, but that layout is unused/dead code so it does not affect the app.)
- `google/cloud-firestore` requires the `ext-grpc` PHP extension which is NOT installed (the app forces REST transport in `config/google.php`, so gRPC is unused at runtime). Composer must be run with `--ignore-platform-req=ext-grpc`.
- The production asset build is effectively broken: `vite.config.js` only lists `resources/css/app.css` as input, but `resources/views/app.blade.php` `@vite`s `resources/js/app.jsx` + page components. So `npm run build` produces a manifest missing `app.jsx`, and serving without the Vite dev server yields `ViteException: Unable to locate file in Vite manifest: resources/js/app.jsx`. Always run the Vite dev server (`npm run dev` / `composer dev`) for development; do not rely on `npm run build`.
- Because Inertia renders the root blade (which needs Vite), Feature tests that render pages return 500 unless the Vite dev server hot file is present. This is a pre-existing repo issue, not an environment problem.
- Seed data: `php artisan migrate --seed` (or `db:seed`) creates 40 products, images, taquilla plans and a fixed admin `admin@example.com` / `password` (plus 10 faker users). Note the tienda "Añadir al carrito" button is disabled unless the logged-in user has a `numeroTaquilla` assigned; the seeded faker users get one, the fixed admin does not.

### Lint / test
- Lint: `./vendor/bin/pint --test` (reports many pre-existing style violations; `./vendor/bin/pint` would auto-fix).
- Tests: `php artisan test` (Pest/PHPUnit). Tests run against the MySQL `mas_que_surf` DB via `RefreshDatabase` (sqlite lines in `phpunit.xml` are commented out). Several default Breeze auth/profile tests fail out-of-the-box because the app customized the User model (fields `nombre`/`apellido`/`telefono`) and routes — these failures are pre-existing, not caused by environment setup.
