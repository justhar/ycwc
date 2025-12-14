# Backend Repositories

This folder contains all database query logic organized by domain entity. Each repository provides a clean interface for database operations using Drizzle ORM.

## Structure

- **user-repository.ts** - User CRUD operations (findById, findByEmail, create, update)
- **profile-repository.ts** - Profile management (findByUserId, create, update, exists)
- **task-repository.ts** - Task and subtask operations (findByUserId, create, update, delete, with subtasks)
- **task-group-repository.ts** - Task group management (findByUserId, create, update, reorder)
- **university-repository.ts** - University queries and favorites (findAll with filters, search, favorites)
- **scholarship-repository.ts** - Scholarship queries and favorites (findAll with filters, by university)
- **chat-repository.ts** - Chat and message operations (findByUserId, messages, create, delete)
- **index.ts** - Central export point for all repositories

## Repository Pattern Benefits

1. **Separation of Concerns** - Database logic isolated from business logic
2. **Reusability** - Query methods can be reused across services
3. **Testability** - Easy to mock repositories for unit testing
4. **Consistency** - Standardized patterns for database operations
5. **Maintainability** - Single place to update queries when schema changes

## Usage

Import repositories from the central index:

```typescript
import {
  userRepository,
  profileRepository,
  taskRepository,
} from "../repositories/index.js";

// Use repository methods
const user = await userRepository.findById(userId);
const profile = await profileRepository.findByUserId(userId);
const tasks = await taskRepository.findWithSubtasks(userId);
```

Or import specific repositories:

```typescript
import { userRepository } from "../repositories/user-repository.js";

const user = await userRepository.findByEmail(email);
```

## Best Practices

1. **Single Responsibility** - Each repository handles one entity/table
2. **Return Types** - Methods return null for not found, throw errors for failures
3. **Transactions** - Use db.transaction() for multi-step operations
4. **Type Safety** - Use types from `../types` for method parameters and returns
5. **Naming** - Use descriptive method names: `findById`, `findByUserId`, `create`, `update`, `delete`

## Common Patterns

### Find Operations

- `findById(id)` - Find single record by primary key
- `findByUserId(userId)` - Find records belonging to a user
- `findAll(params)` - Find all with optional filters/pagination

### Write Operations

- `create(data)` - Insert new record and return it
- `update(id, updates)` - Update record and return updated version
- `delete(id)` - Delete record

### Relational Operations

- `findWithSubtasks(userId)` - Fetch parent with nested children
- `addToFavorites(userId, itemId)` - Create many-to-many relationship
- `removeFromFavorites(userId, itemId)` - Delete many-to-many relationship
