# ShopEasy — Role-Based E-Commerce Platform

A full-stack e-commerce app with Admin / Sales Person / User roles, built for the Full Stack Developer Internship assessment.

## Stack
- **Frontend:** React (Vite) + React Router + Axios
- **Backend:** Node.js + Express + MongoDB (Mongoose)
- **Auth:** JWT + bcrypt password hashing
- **Image Upload:** Cloudinary (direct upload via Multer storage engine)
- **Payments:** Razorpay (test mode, order creation + signature verification)
- **Deployment:** Backend → Render, Frontend → Vercel

## Project Structure
```
ecommerce-app/
├── backend/     # Express API
└── frontend/    # React (Vite) app
```

## Local Setup

### Backend
```bash
cd backend
npm install
cp .env.example .env   # fill in real values
node seedAdmin.js      # creates admin@example.com / Admin@123
npm run dev            # runs on http://localhost:5000
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env   # fill in real values
npm run dev             # runs on http://localhost:5173
```

## Environment Variables

**backend/.env**
```
PORT=5000
MONGO_URI=...
JWT_SECRET=...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
RAZORPAY_KEY_ID=...
RAZORPAY_KEY_SECRET=...
CLIENT_URL=http://localhost:5173
```

**frontend/.env**
```
VITE_API_URL=http://localhost:5000/api
VITE_RAZORPAY_KEY_ID=...
```

## Test Login Credentials
| Role | Email | Password |
|---|---|---|
| Admin | admin@example.com | Admin@123 |
| Sales Person | register via /register, choose "Sales Person" | — |
| User | register via /register, choose "Buyer" | — |

> Self-registration is restricted to `user` and `sales_person` roles by design. Admin accounts are created only via `seedAdmin.js` or by an existing admin promoting a user's role from the Admin Dashboard.

## Role Enforcement (Backend)
- All product create/edit/delete routes require `protect` + `authorize("admin", "sales_person")` middleware.
- Sales Person ownership is checked server-side against `product.owner` before allowing edit/delete — not just hidden in the UI.
- Order visibility is scoped server-side: users see only their own orders, sales people see only orders containing their products, admins see everything.
- Role changes are admin-only (`/api/users/:id/role`).

## Payment Flow
1. Frontend requests `/api/orders/create-razorpay-order` — backend computes the total from DB prices (never trusts client-sent amounts) and creates a Razorpay order.
2. Razorpay checkout opens client-side.
3. On success, frontend sends the returned `razorpay_payment_id` / `razorpay_order_id` / `razorpay_signature` to `/api/orders/verify`.
4. Backend recomputes the HMAC-SHA256 signature using the Razorpay secret and compares it — only a match creates the Order record and clears the cart. This blocks a client from faking a successful payment.

## Deployment

### Backend → Render
1. New Web Service → connect this repo → root directory `backend`
2. Build command: `npm install`
3. Start command: `npm start`
4. Add all `backend/.env` variables under Environment.
5. Set `CLIENT_URL` to your deployed Vercel URL.

### Frontend → Vercel
1. Import repo → root directory `frontend`
2. Framework preset: Vite
3. Add `VITE_API_URL` (your Render backend URL + `/api`) and `VITE_RAZORPAY_KEY_ID`.
4. Deploy.

## Screenshots
_Add 2-3 screenshots here before submission: product listing, checkout, and admin dashboard._
