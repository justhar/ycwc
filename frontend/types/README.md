# Frontend Types

This folder contains all TypeScript type definitions used across the frontend application.

## Structure

- **auth.ts** - User authentication and context types
- **profile.ts** - User profile and academic information types
- **university.ts** - University data, matching, and favorites types
- **scholarship.ts** - Scholarship data types
- **task.ts** - Task tracker, task groups, and context types
- **chat.ts** - Chat, messages, and context types
- **api.ts** - API response wrapper types
- **index.ts** - Central export point for all types

## Usage

Import types from the central index:

```typescript
import type {
  User,
  ProfileData,
  Task,
  ChatContextType,
} from "@/types";
```

Or import from specific files:

```typescript
import type { LoginCredentials, AuthContextType } from "@/types/auth";
```

## Type Categories

### Context Types
Types ending with `ContextType` define React Context interfaces:
- `AuthContextType` - Authentication context
- `ChatContextType` - Chat context
- `GroupContextType` - Task groups context

### Data Types
Core data structures matching backend entities:
- `ProfileData`, `Task`, `University`, `Scholarship`, `Chat`

### Request/Response Types
API interaction types:
- `APIResponse<T>` - Generic API response wrapper
- `MatchingResponse` - University matching results
- `PaginatedResponse<T>` - Paginated data responses

## Best Practices

1. **Sync with backend** - Keep types aligned with backend types where they overlap
2. **Component props** - Define component prop types inline or in component files
3. **Type safety** - Use strict types, avoid `any` unless absolutely necessary
4. **Context types** - Include all state and dispatch functions in context types
