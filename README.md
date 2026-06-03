# AasaMedChem Management Platform

Enterprise Inventory, Quotation, and Order Management Platform designed with Next.js, Prisma, and Neon PostgreSQL.

## Features
- **Role-Based Access Control**: Admins, Sellers, and Buyers.
- **Dynamic Unit Conversions**: Seamlessly convert `g`, `kg`, `mL`, `L`, and `count` on the fly.
- **High Precision Financials**: Internal `DECIMAL` types ensure prices (in INR ₹) are perfectly precise regardless of unit scale.
- **Premium UI**: Glassmorphism aesthetic, Next.js App Router.

## Tech Stack
- **Frontend/Backend**: Next.js 15 (App Router)
- **Database**: Neon PostgreSQL
- **ORM**: Prisma (using v5 to ensure legacy Prisma schema url compatibility)
- **Styling**: Standard CSS (Design Tokens in `globals.css`)
- **Authentication**: Custom JWT with `bcryptjs`.

## Data Storage Strategy
### Base Unit Pattern
To prevent floating-point and conversion drift errors, **all items are stored based on their smallest atomic unit** (`g`, `mL`, or `count`). 
- `stockQuantity`: The amount of inventory available in the base unit.
- `unitPrice`: The price in INR (₹) per *single* base unit.

### Conversions
Conversions happen at runtime in the UI (`Quotation Builder`). When a seller selects a product (e.g. Chemical X, stored in `g`), they can choose an output unit of `kg` with quantity `2`. The UI calculates the required base units (`2 * 1000 = 2000g`) and multiplies by the base `unitPrice` to present the final cost. No data is lost, and the database only stores absolute metrics.

### High Precision
Both `stockQuantity` and `unitPrice` use Prisma's `Decimal` type which generates PostgreSQL `DECIMAL(65,30)` columns.

## Local Setup
1. `npm install`
2. Populate `.env` with `DATABASE_URL` (Neon Connection String) and `JWT_SECRET`.
3. `npx prisma db push` or `npx prisma migrate dev`
4. `npm run dev`

## Deployment to Vercel
1. Ensure your code is pushed to a GitHub repository.
2. Log into [Vercel](https://vercel.com/) and click "Add New Project".
3. Import your GitHub repository.
4. **Environment Variables**: Add your `DATABASE_URL` and `JWT_SECRET` in the Vercel dashboard.
5. Deploy. Vercel automatically detects Next.js. 

*(Alternatively, run `npx vercel --prod` directly from your CLI if you have the Vercel CLI installed and authenticated).*
