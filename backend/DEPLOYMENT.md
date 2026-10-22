# Infi Electronics deployment

## Railway backend

1. In Railway, create a project named `Infi Electronics` and select **Deploy from GitHub repo**.
2. Select the `Infosys` repository and set the service **Root Directory** to `backend`.
3. Add a MySQL service to the same Railway project, then attach a volume to the backend service at `/app/uploads`.
4. Set the backend variables below. Obtain the database host, port, database name, user, and password from the Railway MySQL service.

```
SPRING_DATASOURCE_URL=jdbc:mysql://<host>:<port>/<database>
SPRING_DATASOURCE_USERNAME=<user>
SPRING_DATASOURCE_PASSWORD=<password>
APP_JWT_SECRET=<random value at least 32 characters>
APP_CORS_ALLOWED_ORIGINS=https://<your-vercel-domain>
APP_UPLOAD_DIR=/app/uploads
ADMIN_SEED_KEY=<one-time admin registration key>
RAZORPAY_KEY_ID=<Razorpay live key id>
RAZORPAY_KEY_SECRET=<Razorpay live key secret>
```

`ADMIN_SEED_KEY` is used only when `admin_keys` is empty. Remove it after the first admin key has been created.

## Vercel frontend

1. Import the same `Infosys` repository in Vercel and name the project `Infi Electronics`.
2. Set the Vercel project **Root Directory** to `frontend`.
3. Add `VITE_API_BASE_URL=https://<your-railway-domain>/api` to the Production environment.
4. Deploy. Copy the Vercel production URL into Railway's `APP_CORS_ALLOWED_ORIGINS`, then redeploy Railway.
