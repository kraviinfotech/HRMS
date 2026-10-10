# Kravi Infotech HRMS

A full-stack Human Resource Management System for Kravi Infotech.

## Project Structure

- `frontend/` - React, Vite, Tailwind, React Router, Axios, React Hook Form, Zod, Recharts, Lucide icons.
- `backend/` - Node.js, Express, MongoDB, Mongoose, Zod validation, cookie sessions, CSRF, Brevo SMTP, PDF generation, tests.

## Local Setup

Open two VS Code PowerShell terminals.

Backend terminal:

```powershell
cd E:\projectflutter\kravi-hrms\backend
Copy-Item .env.example .env
notepad .env
npm install
npm run dev
```

Frontend terminal:

```powershell
cd E:\projectflutter\kravi-hrms\frontend
npm install
npm run dev
```

The frontend does not need a local `.env` for API calls. It calls `/api`, and Vite proxies that to the backend during development.

Default local URLs:

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000/api`
- Health check: `http://localhost:5000/api/health`

## MongoDB

Install or start MongoDB locally, then set:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/kravi_hrms
```

The URI must include the intended database name. For Atlas or other hosted MongoDB providers, include `/kravi_hrms` before the query string. In production the backend refuses to start if the database name is omitted, because MongoDB would otherwise default to `test`.

Use a separate database for tests or staging. Do not run destructive tests against production employee data.

## Secure Initial Admin Bootstrap

There is no universal default admin password. For a persistent database, configure these values in `backend/.env`:

```env
INITIAL_ADMIN_EMAIL=admin@example.com
INITIAL_ADMIN_PASSWORD=UseAStrongPassword123
INITIAL_ADMIN_NAME=Kravi HR Admin
RESET_ADMIN_PASSWORD=false
```

Then run:

```powershell
cd E:\projectflutter\kravi-hrms\backend
npm run admin:ensure
```

If the admin exists but the configured password must be reset, temporarily set `RESET_ADMIN_PASSWORD=true`, run the command once, then set it back to `false`. Existing sessions for that admin are revoked after a password reset.

You can also create the first admin through the bootstrap endpoint. Configure:

```env
BOOTSTRAP_SECRET=replace-with-a-long-one-time-secret
```

With the backend running, call the endpoint from PowerShell:

```powershell
$base = "http://localhost:5000/api"
$csrfResponse = Invoke-RestMethod -Uri "$base/auth/csrf" -Method Get -SessionVariable web
$csrf = $csrfResponse.data.csrfToken
$body = @{
  email = "admin@example.com"
  password = "UseAStrongPassword123"
  name = "Kravi HR Admin"
  secret = "replace-with-a-long-one-time-secret"
} | ConvertTo-Json
Invoke-RestMethod -Uri "$base/auth/bootstrap" -Method Post -WebSession $web -Headers @{ "x-csrf-token" = $csrf } -ContentType "application/json" -Body $body
```

After the first admin exists, the bootstrap endpoint rejects additional admin bootstrap attempts.

## Brevo SMTP

Set these in `backend/.env` for employee invitations, activation OTPs, and password reset OTPs:

```env
BREVO_SMTP_HOST=smtp-relay.brevo.com
BREVO_SMTP_PORT=587
BREVO_SMTP_USER=your-brevo-login
BREVO_SMTP_KEY=your-brevo-smtp-key
EMAIL_FROM="Kravi HRMS <hrms@kraviinfotech.com>"
```

If SMTP is not configured, the API logs that email delivery was skipped. Production activation and password recovery require working SMTP.

## Core Workflows

- Admin creates invited employee accounts.
- Employee activates account with OTP and logs in.
- Cookie sessions use HTTP-only cookies; the frontend does not store auth tokens in localStorage.
- CSRF tokens are issued by `/api/auth/csrf` and sent in `x-csrf-token`.
- Employees can check in/out, submit timesheets, apply leave, view salary records, download released payslips, upload permitted documents, and create tickets.
- Admins manage employees, attendance correction approvals, timesheet reviews, tasks, leaves, payroll drafts/finalization, tickets, announcements, holidays, documents, reports, settings, joining letters, and audit logs.

## Payroll Notes

Indian payroll calculations are configurable in company settings. The included PF, ESI, Maharashtra PT, and TDS logic is an estimate-oriented rules engine with effective-date metadata. Verify current statutory applicability, employee eligibility, exemptions, salary structure, and rounding requirements with a qualified payroll professional before finalizing payroll.

## Quality Commands

Backend:

```powershell
cd E:\projectflutter\kravi-hrms\backend
npm run lint
npm test
npm audit
```

Frontend:

```powershell
cd E:\projectflutter\kravi-hrms\frontend
npm run lint
npm run build
npm audit
```

Integration tests are skipped unless `TEST_MONGODB_URI` is provided. Example:

```powershell
cd E:\projectflutter\kravi-hrms\backend
$env:TEST_MONGODB_URI = "mongodb://127.0.0.1:27017/kravi_hrms_test"
npm test
```

## Production Checklist

- Set `NODE_ENV=production`.
- Set `USE_MEMORY_DB=false`.
- Ensure `MONGODB_URI` includes the explicit production database name.
- Use HTTPS and set secure cookie-compatible origins.
- Set `CLIENT_ORIGIN` to the deployed frontend origin.
- Set `COOKIE_DOMAIN` only when the frontend and API intentionally share a parent domain.
- Set `TRUST_PROXY=true` behind a trusted proxy/load balancer.
- Use strong secrets and do not commit `.env`.
- Configure Brevo SMTP and verify sender/domain records.
- Configure MongoDB backups, least-privilege database access, and retention policies.
- Store uploads on managed private storage for production rather than local disk.
- Review statutory payroll settings before locking payroll.

## Generated Package

The delivery ZIP is `KRAVI-HRMS.zip` at the project root. It excludes `node_modules`, `.env`, logs, `dist`, coverage, and temporary files.
