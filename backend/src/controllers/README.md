# Backend Controllers Layer

This folder contains the HTTP request/response handling layer (controllers) for the YCWC backend application. Controllers sit between routes and services, managing HTTP-specific logic.

## Purpose

Controllers handle incoming HTTP requests, extract parameters, call the appropriate service methods, and format responses. They keep routes thin and focused on path definitions while delegating business logic to services.

## Structure

### Available Controllers

1. **auth-controller.ts** - Authentication endpoints (register, login, logout, getCurrentUser)
2. **profile-controller.ts** - User profile operations (get, update, delete)
3. **task-controller.ts** - Task and subtask CRUD operations
4. **task-group-controller.ts** - Task group management
5. **university-controller.ts** - University queries, search, and favorites
6. **scholarship-controller.ts** - Scholarship queries, search, and favorites
7. **chat-controller.ts** - Chat and message operations

### Key Files

- **index.ts** - Exports all controllers for easy importing
- **README.md** - This documentation file

## Architecture

```
Routes → **Controllers** → Services → Repositories → Database
```

**Controllers are responsible for:**
- Extracting data from HTTP requests (body, params, query, headers)
- Calling service methods with extracted data
- Handling service errors and mapping to appropriate HTTP status codes
- Formatting responses with proper structure
- Internationalization (language parameter handling)
- HTTP-specific concerns (status codes, headers)

**Controllers should NOT:**
- Contain business logic (that's in services)
- Execute database queries directly (use services/repositories)
- Perform complex validation (services handle that)

## Usage Pattern

### Importing Controllers

```typescript
import { authController, taskController } from '../controllers';
```

### Example: Using in a Route

```typescript
import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth';
import { taskController } from '../controllers';

const router = new Hono();

// Public routes
router.post('/register', (c) => authController.register(c));
router.post('/login', (c) => authController.login(c));

// Protected routes
router.use('*', authMiddleware);
router.get('/tasks', (c) => taskController.getTasks(c));
router.post('/tasks', (c) => taskController.createTask(c));
router.put('/tasks/:id', (c) => taskController.updateTask(c));
router.delete('/tasks/:id', (c) => taskController.deleteTask(c));

export default router;
```

## Controller Patterns

### 1. Request Data Extraction

Controllers extract data from various sources:

```typescript
async createTask(c: Context) {
  const userId = c.get('userId');              // From middleware context
  const body = await c.req.json();             // Request body
  const taskId = c.req.param('id');            // URL parameter
  const lang = c.req.query('lang') || 'en';    // Query parameter
  
  // Call service...
}
```

### 2. Service Call with Error Handling

```typescript
async getTask(c: Context) {
  try {
    const userId = c.get('userId');
    const taskId = c.req.param('id');
    
    const task = await taskService.getTaskById(taskId, userId);
    
    return c.json({ task });
  } catch (error: any) {
    const status = error.message.includes('not found') ? 404 : 500;
    return c.json({ error: error.message }, status);
  }
}
```

### 3. HTTP Status Code Mapping

Controllers map service errors to appropriate HTTP status codes:

```typescript
catch (error: any) {
  // Determine appropriate status code
  let status = 500;
  
  if (error.message.includes('not found')) {
    status = 404;
  } else if (error.message.includes('Unauthorized')) {
    status = 403;
  } else if (error.message.includes('required') || error.message.includes('invalid')) {
    status = 400;
  }
  
  return c.json({ error: error.message }, status);
}
```

### 4. Internationalized Responses

Controllers use the i18n utility for localized messages:

```typescript
async createTask(c: Context) {
  try {
    const userId = c.get('userId');
    const body = await c.req.json();
    const lang = c.req.query('lang') || 'en';
    
    const task = await taskService.createTask(userId, body);
    
    return c.json({
      message: i18n.t('task.createSuccess', lang),
      task,
    }, 201);
  } catch (error: any) {
    return c.json({
      error: error.message || i18n.t('task.createError', 'en'),
    }, 400);
  }
}
```

### 5. Query Parameter Parsing

Controllers parse and validate query parameters:

```typescript
async getUniversities(c: Context) {
  const params = {
    country: c.req.query('country'),
    type: c.req.query('type') as 'public' | 'private' | undefined,
    minRanking: c.req.query('minRanking') 
      ? parseInt(c.req.query('minRanking')!) 
      : undefined,
    maxRanking: c.req.query('maxRanking')
      ? parseInt(c.req.query('maxRanking')!)
      : undefined,
    page: c.req.query('page') ? parseInt(c.req.query('page')!) : 1,
    limit: c.req.query('limit') ? parseInt(c.req.query('limit')!) : 20,
  };
  
  const universities = await universityService.getAllUniversities(params);
  
  return c.json({ universities });
}
```

## HTTP Status Codes Used

### Success Codes
- **200 OK** - Successful GET, PUT, PATCH, DELETE requests
- **201 Created** - Successful POST requests that create resources

### Client Error Codes
- **400 Bad Request** - Invalid input, validation errors
- **401 Unauthorized** - Authentication failed (invalid credentials)
- **403 Forbidden** - User not authorized to access resource (ownership check failed)
- **404 Not Found** - Resource does not exist

### Server Error Codes
- **500 Internal Server Error** - Unexpected server errors

## Response Format

### Success Response
```json
{
  "message": "Task created successfully",
  "task": { ... }
}
```

### Error Response
```json
{
  "error": "Task title is required"
}
```

### List Response
```json
{
  "tasks": [ ... ]
}
```

## Common Controller Methods

### CRUD Operations
- `get{Resource}s()` - List all resources
- `get{Resource}()` - Get single resource by ID
- `create{Resource}()` - Create new resource
- `update{Resource}()` - Update existing resource
- `delete{Resource}()` - Delete resource

### Special Operations
- `search{Resource}s()` - Search resources by query
- `addToFavorites()` - Add resource to user favorites
- `removeFromFavorites()` - Remove from favorites
- `updateStatus()` - Update resource status
- `toggle{Action}()` - Toggle boolean state

## Testing Controllers

Controllers can be tested by:
1. Mocking the Hono Context object
2. Mocking service layer methods
3. Verifying correct service calls
4. Checking response format and status codes

## Integration with Routes

Routes define paths and HTTP methods, then delegate to controllers:

```typescript
// routes/tasks.ts
import { Hono } from 'hono';
import { taskController } from '../controllers';
import { authMiddleware } from '../middleware/auth';

const router = new Hono();

router.use('*', authMiddleware);

router.get('/', (c) => taskController.getTasks(c));
router.get('/:id', (c) => taskController.getTask(c));
router.post('/', (c) => taskController.createTask(c));
router.put('/:id', (c) => taskController.updateTask(c));
router.delete('/:id', (c) => taskController.deleteTask(c));

export default router;
```

This keeps route files minimal and focused on path definitions, with all logic in controllers.

## Next Steps

Now that the Controllers layer is complete, the existing routes need to be refactored to use these controllers instead of handling logic directly. This will:
- Reduce code duplication
- Improve testability
- Maintain consistent error handling
- Enable easier maintenance

The refactored architecture will be:
```
Routes (thin path definitions) → Controllers (HTTP logic) → Services (business logic) → Repositories (data access) → Database
```
