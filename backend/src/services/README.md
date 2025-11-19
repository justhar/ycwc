# Backend Services Layer

This folder contains the business logic layer (services) for the YCWC backend application. Services sit between controllers/routes and repositories, handling validation, business rules, and orchestrating data operations.

## Purpose

Services encapsulate business logic and validation rules, keeping controllers thin and repositories focused on data access. They ensure data integrity and enforce business constraints before persisting to the database.

## Structure

### Available Services

1. **auth-service.ts** - Authentication and authorization logic (register, login, JWT handling)
2. **profile-service.ts** - User profile management with validation
3. **task-service.ts** - Task and subtask business logic
4. **task-group-service.ts** - Task group management
5. **university-service.ts** - University data operations and favorites
6. **scholarship-service.ts** - Scholarship queries and favorites
7. **chat-service.ts** - Chat and message management

### Key Files

- **index.ts** - Exports all services for easy importing
- **README.md** - This documentation file

## Architecture

```
Controllers/Routes → Services → Repositories → Database
```

**Services are responsible for:**
- Input validation and sanitization
- Business rule enforcement
- Error handling with meaningful messages
- Orchestrating multiple repository calls
- Authorization checks (ownership verification)
- Data transformation and formatting

**Services should NOT:**
- Handle HTTP requests/responses directly (that's the controller's job)
- Execute database queries directly (use repositories instead)
- Contain route definitions or middleware

## Usage Pattern

### Importing Services

```typescript
import { authService, profileService, taskService } from '../services';
```

### Example: Using in a Route/Controller

```typescript
// In a route handler
app.post('/api/tasks', authMiddleware, async (c) => {
  const userId = c.get('userId');
  const body = await c.req.json();
  
  try {
    // Service handles validation and business logic
    const task = await taskService.createTask(userId, body);
    return c.json({ task });
  } catch (error: any) {
    return c.json({ error: error.message }, 400);
  }
});
```

## Service Patterns

### 1. Input Validation

All services validate input before calling repositories:

```typescript
async createTask(userId: number, taskData: { title: string }) {
  // Validate required fields
  if (!taskData.title || taskData.title.trim().length === 0) {
    throw new Error("Task title is required");
  }
  
  if (taskData.title.length > 200) {
    throw new Error("Task title is too long (max 200 characters)");
  }
  
  // Proceed with repository call
  return await taskRepository.create(userId, taskData);
}
```

### 2. Ownership Verification

Services verify user owns the resource before allowing operations:

```typescript
async updateTask(taskId: string, userId: number, updates: Partial<Task>) {
  // Verify task exists and user owns it
  const task = await taskRepository.findById(taskId);
  
  if (!task) {
    throw new Error("Task not found");
  }
  
  if (task.userId !== userId) {
    throw new Error("Unauthorized to update this task");
  }
  
  // Proceed with update
  return await taskRepository.update(taskId, userId, updates);
}
```

### 3. Business Rule Enforcement

Services enforce domain-specific constraints:

```typescript
async upsertProfile(userId: number, profileData: Partial<ProfileData>) {
  // Validate budget range
  if (profileData.budgetMin !== undefined && profileData.budgetMax !== undefined) {
    if (profileData.budgetMin > profileData.budgetMax) {
      throw new Error("Minimum budget cannot be greater than maximum budget");
    }
  }
  
  // Validate GPA scale
  if (profileData.scoreScale === "gpa4" && profileData.academicScore > 4.0) {
    throw new Error("GPA on 4.0 scale cannot exceed 4.0");
  }
  
  // Check if profile exists
  const existingProfile = await profileRepository.findByUserId(userId);
  
  if (existingProfile) {
    return await profileRepository.update(userId, profileData);
  } else {
    return await profileRepository.create(userId, profileData);
  }
}
```

### 4. Orchestrating Multiple Operations

Services coordinate multiple repository calls:

```typescript
async addToFavorites(userId: number, universityId: string) {
  // 1. Verify university exists
  const university = await universityRepository.findById(universityId);
  if (!university) {
    throw new Error("University not found");
  }
  
  // 2. Check if already favorited
  const favorites = await universityRepository.findFavorites(userId);
  const alreadyFavorited = favorites.some(fav => fav.universityId === universityId);
  
  if (alreadyFavorited) {
    throw new Error("University already in favorites");
  }
  
  // 3. Add to favorites
  return await universityRepository.addToFavorites(userId, universityId);
}
```

## Error Handling

Services throw descriptive errors that controllers can catch and return to clients:

```typescript
// Service throws error
throw new Error("Task title is required");

// Controller catches and returns appropriate HTTP response
try {
  const task = await taskService.createTask(userId, body);
  return c.json({ task });
} catch (error: any) {
  return c.json({ error: error.message }, 400);
}
```

## Common Validations

### String Length
```typescript
if (title.trim().length === 0) {
  throw new Error("Title is required");
}
if (title.length > 200) {
  throw new Error("Title is too long (max 200 characters)");
}
```

### Numeric Ranges
```typescript
if (score < 0 || score > 4.0) {
  throw new Error("GPA must be between 0 and 4.0");
}
```

### Date Validation
```typescript
const date = new Date(dateString);
if (isNaN(date.getTime())) {
  throw new Error("Invalid date format");
}
```

### Array Validation
```typescript
if (!Array.isArray(items)) {
  throw new Error("Items must be an array");
}
```

### Pagination
```typescript
if (page < 1) {
  throw new Error("Page number must be at least 1");
}
if (limit < 1 || limit > 100) {
  throw new Error("Limit must be between 1 and 100");
}
```

## Testing Services

Services are ideal for unit testing since they:
- Have clear input/output contracts
- Don't depend on HTTP layer
- Can mock repository dependencies
- Contain isolated business logic

## Next Steps

Services will be consumed by the **Controllers Layer** which handles HTTP requests/responses and calls the appropriate service methods.

Routes → Controllers → Services → Repositories → Database
