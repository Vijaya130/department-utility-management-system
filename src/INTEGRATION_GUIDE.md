# Analytics Dashboard — Integration Guide

## What was added

| File | Action |
|------|--------|
| `src/AnalyticsDashboard.jsx` | **New file** — full analytics dashboard component |
| `src/App.jsx` | **Modified** — import + routing + nav button + quick access button |
| `src/App.css` | **Modified** — appended Recharts tooltip overrides |

---

## Step 1 — Install Recharts

```bash
cd department-system
npm install recharts
```

Recharts provides LineChart, BarChart, and PieChart components used by the dashboard.

---

## Step 2 — Copy files

Copy the three files from this folder into your project:

```
src/
├── AnalyticsDashboard.jsx   ← new, copy here
├── App.jsx                  ← replace with modified version
├── App.css                  ← replace with modified version
```

---

## Step 3 — Run

```bash
npm run dev
```

Log in as **Admin** → click **📊 Analytics** in the sidebar (or the Analytics Dashboard button on the Dashboard).

---

## How it works

```
Student List (from Supabase)
        ↓
  Select Student  →  shows name, avg SGPA, backlogs, certificate count
        ↓
  Select Category
    • Attendance    → semester-wise attendance % (derived from SGPA if not stored)
    • Academics     → 10th / 12th marks + sem 1–8 SGPA trend
    • Certificates  → achievement breakdown: Technical / Non-Technical / Online Courses / Workshops
    • Placements    → avg SGPA, backlogs, certificates, aptitude readiness
        ↓
  Select Chart Type
    • Line Chart  → best for trends over time
    • Bar Chart   → best for side-by-side comparisons
    • Pie Chart   → best for proportions / distributions
        ↓
  Visual Dashboard renders + interactive data table
```

---

## Notes

- **Attendance** is currently *derived* from SGPA because the database schema stores no raw attendance column. Add an `attendance` column to Supabase (JSON or per-sem fields) and update `buildAttendanceData()` to use real values.
- **Certificates** are parsed from the `achievements` free-text field by keyword matching. A dedicated `certificates` table would improve accuracy.
- **Placements** shows readiness indicators; connect a real placement table to show actual offer data.
- All charts switch instantly — use the mini toggle buttons in the chart header to swap chart types without going back to step 3.
