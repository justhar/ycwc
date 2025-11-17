# YCWC (Abroadly) Copilot Instructions

## Project Overview

YCWC is a comprehensive study abroad application platform designed to help students identify and apply to universities and scholarship opportunities. The platform combines AI-powered CV parsing and personalized recommendations with a modern, localized user experience.

**Tech Stack:**

- **Frontend:** Next.js 15 (App Router), TypeScript, Tailwind CSS, React Context API, shadcn/ui components
- **Backend:** Hono 4.9, TypeScript, Drizzle ORM with PostgreSQL
- **AI:** Google GenAI API for CV parsing and task recommendations
- **Internationalization:** next-intl (en/id) on frontend, Accept-Language headers on backend

---

## Architecture

### Full-Stack Structure

**Frontend** (`frontend/`):

- Next.js 15 with App Router and Turbopack
- Locale-based routing: `app/[locale]/` for multi-language support (en, id)
- Client components with React Context for state management
- shadcn/ui components with custom styling

**Backend** (`backend/`):

- Hono 4.9 lightweight server framework
- Modular route organization in `src/routes/`
- Drizzle ORM with PostgreSQL database
- JWT-based authentication with middleware pattern

### Database Schema

Key entities in `src/db/schema.ts`:

```
users: id (UUID), email, password (hashed), createdAt
profiles: userId, fullName, cvUrl, targetCountries (array), etc.
universities: id, name, country, ranking, etc.
scholarships: id, name, university_id, requirements, etc.
tasks: id, title, priority (MUST/NEED/NICE), status (todo/in_progress/completed), groupIds (JSON)
taskGroups: id, name, userId, displayOrder
chats: id, userId, title, createdAt
messages: id, chatId, role (user/assistant), content, createdAt
```

All tables use `pgEnum()` for type constraints. Relationships enforced with foreign keys.

### Authentication Flow

1. **Signup/Login** (`src/routes/auth.ts`): Password hashed with bcrypt, JWT token returned
2. **JWT Middleware** (`src/middleware/auth.ts`):
   - Validates token from Authorization header
   - Decodes user ID and attaches to context
   - Protected routes check for valid token
3. **Frontend** (`lib/api.ts`): Stores token in localStorage, includes in all API requests
4. **Token Refresh**: Handle 401 responses and redirect to `/signin` if token invalid

### AI Integration

**Service:** `src/utils/ai-service.ts`

- **CV Parsing:** `AIService.parseCVContent()` extracts skills, experience from uploaded PDFs
- **Recommendations:** `AIService.getTaskRecommendations()` suggests tasks based on user profile
- Uses Google GenAI with structured JSON responses
- Error handling with fallback for API failures

### Internationalization

**Backend** (`src/utils/i18n.ts`):

- Message keys stored in `src/messages/index.ts` with en/id translations
- Routes extract `Accept-Language` header, fallback to 'en'
- Functions like `i18n.t('key', lang)` return localized strings

**Frontend** (`i18n/routing.ts`, `next-intl`):

- Locale from URL: `/en/chat`, `/id/profile`
- `getCurrentLocale()` retrieves active locale for API calls
- All API requests include `lang` query parameter

---

## Key Patterns and Conventions

### Backend Patterns

**Route Organization:**

- Each route file (`src/routes/*.ts`) exports a router: `export default new Hono()`
- Mount in `src/index.ts`: `app.route('/api/tasks', tasksRouter)`
- Protect routes with: `router.use('*', authMiddleware)` before protected handlers

**Drizzle Schema Pattern:**

```typescript
export const tasks = pgTable("tasks", {
  id: uuid().defaultRandom().primaryKey(),
  userId: uuid().references(() => users.id),
  title: text().notNull(),
  priority: pgEnum("priority")("MUST", "NEED", "NICE").notNull(),
  status: pgEnum("status")("todo", "in_progress", "completed").notNull(),
  groupIds: json()
    .$type<string[]>()
    .default(sql`'[]'`),
});
```

**Database Queries in Routes:**

```typescript
const tasks = await db
  .select()
  .from(tasksTable)
  .where(eq(tasksTable.userId, userId));
```

### Frontend Patterns

**Context for State** (`contexts/AuthContext.tsx`, `ChatContext.tsx`, `GroupContext.tsx`):

- Provider wraps app in `layout.tsx` or component tree
- `useAuth()`, `useChat()`, `useGroup()` hooks access state
- Dispatch actions to update state

**API Calls** (`lib/api.ts`):

```typescript
export async function fetchTasks(userId: string) {
  const locale = getCurrentLocale();
  const response = await fetch(`${API_BASE_URL}/tasks?lang=${locale}`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
  return response.json();
}
```

**shadcn/ui Components:**

- Located in `components/ui/`
- Import and compose in page/component files
- Tailwind customization in `globals.css`

### Database Workflow

1. **Update Schema:** Modify tables in `src/db/schema.ts`
2. **Generate Migration:** `npm run db:generate` (from backend folder)
3. **Apply to DB:** `npm run db:push`
4. **Seed Data:** `npm run db:seed` (runs `src/scripts/seed.ts`)

### Task/Tracker System

**Task Model:**

- `priority`: MUST (deadline-critical), NEED (important), NICE (optional)
- `status`: todo, in_progress, completed
- `groupIds`: JSON array of group IDs for multi-group assignment
- Recommendations from AI based on profile

**Task Groups:**

- Organize tasks by category/timeline
- `displayOrder` controls UI ordering
- User can create/edit groups via API

---

## Development Workflows

### Backend (`backend/` folder)

**Local Development:**

```bash
npm run dev          # Start tsx watch mode on port 5000
npm run db:generate  # Create new migration after schema changes
npm run db:push      # Apply pending migrations
npm run db:seed      # Load initial seed data
```

**Environment Setup** (`.env`):

```
DATABASE_URL=postgresql://user:pass@localhost/ycwc
GOOGLE_API_KEY=your_api_key_here
```

**CORS Configuration** (in `src/index.ts`):

- Frontend domain (http://localhost:3000 for dev) added to CORS allowed origins

### Frontend (`frontend/` folder)

**Local Development:**

```bash
npm run dev    # Next.js with Turbopack on port 3000
npm run build  # Production build
npm run start  # Run production server
```

**Environment Setup** (`.env.local`):

```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

---

## Critical Files and Their Roles

### Backend

| File                                 | Purpose                                                   |
| ------------------------------------ | --------------------------------------------------------- |
| `src/index.ts`                       | App initialization, route mounting, CORS/middleware setup |
| `src/db/schema.ts`                   | All Drizzle table definitions with relationships          |
| `src/db/db.ts`                       | Database connection and query client                      |
| `src/middleware/auth.ts`             | JWT validation middleware for protected routes            |
| `src/routes/auth.ts`                 | Signup, login, logout endpoints                           |
| `src/routes/tasks.ts`                | CRUD operations for tasks                                 |
| `src/routes/chat.ts`                 | Chat and message endpoints                                |
| `src/routes/task-recommendations.ts` | AI-powered task suggestion endpoint                       |
| `src/utils/ai-service.ts`            | Google GenAI integration for CV parsing & recommendations |
| `src/utils/i18n.ts`                  | Message localization utility                              |
| `src/messages/index.ts`              | Translation keys (en/id)                                  |

### Frontend

| File                         | Purpose                                            |
| ---------------------------- | -------------------------------------------------- |
| `lib/api.ts`                 | All backend API calls with auth headers and locale |
| `app/layout.tsx`             | Root layout with AuthProvider, fonts, metadata     |
| `app/[locale]/layout.tsx`    | Locale layout with LocalizationProvider            |
| `contexts/AuthContext.tsx`   | User authentication state and dispatch             |
| `contexts/ChatContext.tsx`   | Chat/message state management                      |
| `i18n/routing.ts`            | Locale configuration and path definitions          |
| `i18n/request.ts`            | i18n middleware for locale detection               |
| `components/Navbar.tsx`      | Top navigation with user menu                      |
| `components/app-sidebar.tsx` | Locale-aware sidebar navigation                    |

---

## Common Tasks Guidance

### Adding a New API Route

1. **Create route file** in `backend/src/routes/newfeature.ts`:

```typescript
import { Hono } from "hono";
import { authMiddleware } from "../middleware/auth";

const router = new Hono();

router.get("/", authMiddleware, async (c) => {
  const userId = c.get("userId");
  // Your logic here
  return c.json({ data: [] });
});

export default router;
```

2. **Mount in** `src/index.ts`:

```typescript
import newFeatureRouter from "./routes/newfeature";
app.route("/api/newfeature", newFeatureRouter);
```

3. **Add frontend function** in `lib/api.ts` with locale and auth headers

### Modifying Database Schema

1. Update table in `src/db/schema.ts` (add columns, change types, add relationships)
2. Run `npm run db:generate` → creates timestamped migration file
3. Review migration in `drizzle/` folder
4. Run `npm run db:push` to apply
5. Update frontend types if needed

### Adding API Calls from Frontend

Always use `lib/api.ts` as the single point for backend communication:

```typescript
export async function createTask(title: string, priority: string) {
  const locale = getCurrentLocale();
  const response = await fetch(`${API_BASE_URL}/tasks?lang=${locale}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ title, priority }),
  });
  if (!response.ok) throw new Error("Failed to create task");
  return response.json();
}
```

### Using AI Service for Recommendations

**In** `backend/src/routes/task-recommendations.ts`:

```typescript
import { AIService } from "../utils/ai-service";

router.post("/", authMiddleware, async (c) => {
  const profile = await getProfile(userId); // Fetch user profile
  const recommendations = await AIService.getTaskRecommendations(profile);
  return c.json(recommendations);
});
```

The service returns structured task suggestions based on user's profile, country targets, and experience level.

---

## Code Style & Best Practices

- **TypeScript:** Strict mode enabled, explicit return types on all functions
- **Error Handling:** Try-catch blocks on API calls, meaningful error messages
- **Naming:** camelCase for variables/functions, PascalCase for classes/components
- **Comments:** Use for complex logic only; keep code self-documenting
- **Git:** Feature branches from main, descriptive commit messages, PR reviews before merge
