# ComicShop - BE + FE (TSX) + PostgreSQL

Fumetteria pixel-art (progetto `esercizio-u5w3d2`), pronta per il deploy su Render.

| Parte | Tecnologia | In locale | Su Render |
|---|---|---|---|
| Backend | Spring Boot 4.1.1, Java 21, Spring Security + JWT, Maven wrapper | `be` sulla 8080 | Web Service (Docker) |
| Frontend | React 19, Vite, TypeScript, Redux Toolkit (RTK Query), React Router | `fe` sulla 5173 | Static Site |
| Database | PostgreSQL | locale sulla 5432 | Render PostgreSQL |

## Endpoint principali

| Metodo | Percorso | Accesso |
|---|---|---|
| POST | `/api/auth/register`, `/api/auth/login` | pubblico |
| POST | `/api/auth/logout` | autenticato |
| GET | `/api/items/**` | pubblico |
| POST / DELETE | `/api/items/{id}/favourites` | autenticato |
| GET | `/actuator/health` | pubblico (health check di Render) |

Al primo avvio vengono creati i ruoli, l'utente admin e il catalogo (da Open Library).

## Avvio in locale

1. PostgreSQL sulla 5432 e database creato:
   ```
   createdb -U postgres eshopcomics
   ```
   Credenziali diverse da `postgres` / `postgres`: variabili `DB_URL`, `DB_USERNAME`,
   `DB_PASSWORD`, oppure `be/src/main/resources/application.yml`.
2. Doppio clic su `avvia.cmd`, oppure:
   ```
   cd be && .\mvnw.cmd spring-boot:run
   cd fe && npm install && npm run dev
   ```
3. http://localhost:5173 - admin di default: `admin` / `Admin@12345`.

## Deploy su Render

1. Repository Git con `be/`, `fe/`, `render.yaml` nella radice.
2. **New > Blueprint**, si sceglie la repo: nascono `comicshop-db`, `comicshop-be`, `comicshop-fe`.
3. Variabili `sync: false` da impostare (senza `/` finale negli indirizzi):

   | Servizio | Variabile | Valore |
   |---|---|---|
   | `comicshop-be` | `ALLOWED_ORIGIN` | `https://comicshop-fe.onrender.com` |
   | `comicshop-be` | `ADMIN_PASSWORD` | password dell'admin in produzione |
   | `comicshop-fe` | `VITE_API_URL` | `https://comicshop-be.onrender.com` |

   `JWT_SECRET` viene generata da Render, `DATABASE_URL` arriva dal database.
4. **Manual Deploy** di entrambi (`VITE_API_URL` e' letta in fase di build).

## Struttura

```
render.yaml                 blueprint: database + backend + frontend
avvia.cmd                   avvio locale
be/
  Dockerfile                usato solo da Render
  src/main/java/com/example/demo/
    DemoApplication.java
    config/DatabaseUrl.java   DATABASE_URL -> formato JDBC
    config/*Seeder.java       ruoli, admin e catalogo al primo avvio
    security/SecurityConfig.java  JWT + CORS da ALLOWED_ORIGIN
    controller/ service/ repository/ model/ dto/ ...
  src/main/resources/application.yml
fe/
  src/store/apiSlice.ts     RTK Query, base da VITE_API_URL
  src/pages/ src/components/
  .env.example
```
