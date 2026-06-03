# AasaMedChem Smart Inventory & Quotation Management Platform

Enterprise-grade full-stack platform built with **Next.js 15 (App Router)**, **Neon PostgreSQL**, **Prisma ORM**, and **Tailwind-inspired glassmorphism styling**. The system supports Admin and Seller/User roles with advanced inventory management, automatic unit conversion to base-unit storage (grams, milliliters, count), quotation generation, order lifecycle tracking, audit logs, notifications, and real-time dashboards.

---

## 🛠️ Tech Stack

- **Core Framework**: Next.js 15 (App Router)
- **Database**: Neon PostgreSQL (Serverless SQL Database)
- **ORM**: Prisma ORM
- **Authentication**: JWT-based session handling with bcryptjs password hashing
- **PDF Generation**: `jspdf` for on-demand quotation & invoice downloads
- **Styling**: Modern, premium CSS with design tokens, glassmorphism elements, dark themes, and dynamic styling (in `src/app/globals.css`)
- **Export**: Built-in CSV exporting for inventory, orders, quotations, and transaction history

---

## 🏗️ System Architecture & Workflow

```mermaid
graph TD
    subgraph Frontend (Next.js 15 Client)
        Auth[Auth/Login Page] --> Dash[Role-based Dashboard]
        Dash --> Inv[Inventory Management]
        Dash --> Quote[Quotation Builder]
        Dash --> Ord[Order Lifecycle]
        Dash --> Aud[Audit Log Viewer]
    end

    subgraph Backend APIs
        API_Auth[API: Auth Login/Register]
        API_Prod[API: Products/SKUs]
        API_Quote[API: Quotations]
        API_Order[API: Orders]
        API_Stats[API: Aggregated Stats]
        API_Notif[API: Notifications]
        API_CSV[API: CSV Export]
    end

    subgraph Database (Neon PostgreSQL via Prisma)
        DB_User[(User Table)]
        DB_Prod[(Product Table)]
        DB_Quote[(Quotation Table)]
        DB_Order[(Order Table)]
        DB_Trans[(InventoryTransaction Table)]
        DB_Audit[(AuditLog Table)]
        DB_Notif[(Notification Table)]
    end

    Auth --> API_Auth --> DB_User
    Inv --> API_Prod --> DB_Prod
    Inv --> API_Prod --> DB_Trans
    Quote --> API_Quote --> DB_Quote
    Ord --> API_Order --> DB_Order
    Dash --> API_Stats
    Dash --> API_Notif --> DB_Notif
    Dash --> API_CSV
```

---

## 💾 Data Modeling & Precision Storage Strategy

### Base Unit Pattern
To prevent floating-point representation bugs, division errors, and conversion drift, **all quantites are normalized and stored in their smallest atomic base unit** (`g`, `mL`, or `count`).
- **Product Price**: Stored as price per base unit (e.g., price per 1 gram or 1 mL).
- **Product Stock**: Stored as count of base units.

### Supported Conversions
```
Weight Units (g base)  : g (x1), mg (x0.001), kg (x1000)
Volume Units (mL base) : mL (x1), L (x1000)
Count Units (count)    : count (x1)
```

### Schema Detail (`prisma/schema.prisma`)
All financial amounts, quantities, and decimals are stored as high-precision fields using the `Decimal` type to map to database `DECIMAL(20, 6)` or equivalent columns.
- **`Product`**: Tracks SKU, base price, category, status, and reorder levels.
- **`InventoryTransaction`**: Audit record for every stock-in, stock-out, or sale event.
- **`Quotation`**: Custom customer info, subtotal, 18% GST calculation, and total.
- **`Order`**: Tracks order status timeline (`PENDING` → `APPROVED` → `PROCESSING` → `SHIPPED` → `DELIVERED`).
- **`AuditLog`**: Logs every CRUD action with user reference, timestamps, and request context.

---

## 🔑 Role-Based Access Control

### 1. Admin Workflow
- Access to **Aggregated Stats** (Total Revenue, Inventory Value, Low Stock counts).
- Full **CRUD Inventory Management** (creating products, updating, deleting).
- Perform **Manual Stock Adjustments** (Stock In / Stock Out) which write to `InventoryTransaction` records.
- Access to **System Audit Trail** and **CSV Data Export**.
- Reviewing and **Approving Quotations** from DRAFT status.

### 2. Seller Workflow
- Access to **Product Catalog** with live filter, search, and stock level checks.
- Build quotations using **Quotation Builder** (converts any input unit like `kg`/`L` back to base units `g`/`mL` to verify pricing).
- Submit quotation in `DRAFT` status for Admin review.
- **Place Order** on approved quotations (triggers immediate stock reservation/deduction).

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18+ installed.
- PostgreSQL database URL (Neon DB recommended).

### 2. Installation
Clone the repository, navigate to the directory, and run:
```bash
npm install
```

### 3. Environment Setup
Create a `.env` file in the root folder with the following variables:
```env
DATABASE_URL="postgresql://user:password@hostname/dbname?sslmode=require"
JWT_SECRET="your-ultra-secure-jwt-passphrase"
```

### 4. Database Setup & Seeding
Push the database schema using Prisma:
```bash
npx prisma db push
```

Run the database seed script to set up demo accounts and pre-fill inventory:
```bash
npx tsx prisma/seed.ts
```

### 5. Running the Application
Start the development server:
```bash
npm run dev
```
Open `http://localhost:3000` to view the platform.

---

## 🧪 Demo Credentials

Use these accounts to sign in and test the system workflow:

- **Admin Account**:
  - Email: `admin@aasamedchem.com`
  - Password: `Password@123`
- **Seller Account**:
  - Email: `seller@aasamedchem.com`
  - Password: `Password@123`

---

## 📈 Platform Features

### 📄 Quotation PDF Generation
A clean PDF containing company name, client info, list of items with conversion details, unit prices, subtotal, 18% GST, and a computer-generated note can be generated by clicking the **"📄 PDF"** button next to any quotation.

### 📤 CSV Reporting
From the Admin dashboard, you can export four distinct logs:
- **Products**: Complete list of product details.
- **Orders**: Overview of all order statuses and values.
- **Quotations**: Summarized customer sales pipeline.
- **Inventory History**: Complete ledger of all stock mutations.

### 🔔 Real-Time Stock Notifications
An indicator on the top navigation alerts the admin immediately when any product falls below its configured `reorderLevel`. A notification record is saved and displayed inside the Notification drawer.
