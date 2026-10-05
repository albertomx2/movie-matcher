# Movie Matcher

Prototipo web para decidir qué película ver en grupo. Permite crear o entrar en una sala mediante código, buscar películas, proponerlas, votar y registrar películas vistas y puntuaciones.

## Arquitectura

Next.js 14, React 18, TypeScript y Tailwind. TMDB proporciona catálogo e imágenes; Supabase almacena salas, participantes, películas y votos y actualiza la sala mediante Realtime.

**No es un catálogo propio ni un servicio de streaming.** El nombre del participante y el código de sala no constituyen autenticación segura.

## Preparar y arrancar

Requisitos: Node.js 20, npm, proyecto Supabase dedicado y acceso a la API de TMDB.

```bash
git clone https://github.com/albertomx2/movie-matcher.git
cd movie-matcher
npm ci
```

Crea `.env.local` con estos nombres exactos:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_publica
NEXT_PUBLIC_TMDB_API_KEY=tu_clave_tmdb
```

Después:

```bash
npm run dev
```

Abre http://localhost:3000. Reinicia el servidor después de cambiar variables. Para una build: `npm run build` y `npm start`.

## Base de datos: requisito pendiente

**El repositorio no incluye migraciones SQL reproducibles. Arrancar Next.js no basta para crear salas.** Es necesario preparar un esquema compatible con `src/lib/supabase.ts` y las consultas de `src/hooks/useRoom.ts`:

- `rooms`: identificador y código único.
- `users`: participantes de una sala; no confundir con Supabase Auth.
- `movies`: identificador TMDB y datos del catálogo.
- `room_movies`: película propuesta, autor y estado.
- `votes`: voto de un participante por propuesta.
- `ratings`: puntuaciones de películas vistas.

Definir claves, relaciones, valores predeterminados y restricciones compatibles con las inserciones/upserts. Habilitar Realtime en las tablas que escucha `useRoom`. No desactivar RLS ni otorgar acceso abierto para hacer funcionar el prototipo: falta diseñar una autorización real de salas antes de usarlo públicamente.

Guía oficial: [Next.js con Supabase](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs).

## Estructura y pruebas

- `src/app`: inicio y ruta `/room/[code]`.
- `src/components/features`: búsqueda, votación, listado y decisión.
- `src/hooks/useRoom.ts`: persistencia y suscripciones.
- `src/lib/tmdb.ts`: peticiones al catálogo.

```bash
npx tsc --noEmit
npm run lint
npm run build
```

No hay suite de tests automatizados. Prueba crear una sala y entrar desde dos navegadores, añadir una película, votar y marcarla como vista. Esta revisión documenta el código; no verifica tu servicio Supabase ni tus claves.

## Privacidad y límites

Toda variable `NEXT_PUBLIC_` se incorpora al navegador. Nunca pongas allí una clave secreta o service-role. La clave TMDB se usa directamente en el cliente: revisar sus condiciones y trasladar llamadas al servidor si se necesita mantenerla privada. No subir `.env.local` ni datos reales. Revisar y actualizar dependencias antiguas antes de un despliegue público.
