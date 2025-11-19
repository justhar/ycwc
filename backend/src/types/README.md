# Backend Types

This folder contains all TypeScript type definitions used across the backend application.

## Structure

- **auth.ts** - Authentication types (login, registration, JWT)
- **profile.ts** - User profile and academic information types
- **university.ts** - University data and matching types
- **scholarship.ts** - Scholarship data types
- **task.ts** - Task tracker and task group types
- **chat.ts** - Chat and message types
- **ai.ts** - AI service types (CV parsing, matching results)
- **index.ts** - Central export point for all types

## Usage

Import types from the central index:

```typescript
import type {
  ProfileData,
  UniversityMatch,
  Task,
  Chat,
} from "../types/index.js";
```

Or import from specific files:

```typescript
import type { LoginRequest, AuthResponse } from "../types/auth.js";
```

## Best Practices

1. **Use `type` imports** - Always import types with `import type` for better tree-shaking
2. **Keep types synchronized** - When updating database schema, update corresponding types
3. **Shared types** - Types like `ProfileData` should match frontend types for consistency
4. **Enum types** - Use string literal unions for enums (e.g., `TaskPriority = "MUST" | "NEED" | "NICE"`)
