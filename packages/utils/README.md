# @tmlmobilidade/utils

A collection of utility functions and helpers for the TML Mobilidade Go monorepo, providing common functionality for batching operations, caching, HTTP requests, object manipulation, permissions, and more.

## Installation 1

```bash
npm install @tmlmobilidade/utils
```

## Features

### Batching

Utilities for processing large datasets in chunks to avoid memory issues and improve performance.

- **`performInChunks`** - Processes large arrays in configurable chunks with async operations

### Caching

In-memory cache implementation with TTL (time-to-live) support.

- **`Cache`** - A simple key-value cache with automatic expiration

### Generic Utilities

Path-based object manipulation utilities with full TypeScript support.

- **`getValueAtPath`** - Retrieves a value from an object using a dot-notation path
- **`setValueAtPath`** - Sets a value at a dot-notation path, creating intermediate objects/arrays as needed
- **`DotPath`** - TypeScript type for generating all possible paths in an object
- **`PathValue`** - TypeScript type for retrieving the value type at a specific path

### HTTP Utilities

Comprehensive HTTP client utilities with retry logic, error handling, and SWR integration.

- **`fetchData`** - Fetches data with automatic retry, exponential backoff, and error handling
- **`multipartFetch`** - Sends multipart form data requests
- **`uploadFile`** - Uploads files using multipart form data
- **`swrFetcher`** - SWR-compatible fetcher with authentication
- **`standardSwrFetcher`** - SWR-compatible fetcher without authentication
- **`HttpResponse`** - Response wrapper with data, error, and status code
- **`WithPagination`** - Type helper for paginated responses

### Object Manipulation

Utilities for comparing, converting, flattening, and merging objects.

- **`compareObjects`** - Deep comparison of objects, returning differences
- **`convertObject`** - Converts objects to match a Zod schema shape
- **`flattenObject`** - Flattens nested objects using dot notation
- **`mergeObjects`** - Deep merges objects and arrays with deduplication

### Permissions

Permission checking utilities for role-based access control.

- **`getPermission`** - Retrieves a permission from a list by scope and action
- **`hasPermission`** - Checks if a permission exists in a list
- **`hasPermissionResource`** - Checks if a value exists in a permission's resource
- **`hasAPIResourcePermission`** - Fastify-specific permission check for API resources

### Singleton Proxy

Utility for creating proxies around async singleton classes.

- **`asyncSingletonProxy`** - Creates a proxy that delays method access until singleton instance is initialized

### Query Validation

Utilities for validating and parsing query parameters.

- **`validateQueryParams`** - Validates query parameters against a Zod schema

## Usage Examples

### Batching

```typescript
import { performInChunks } from '@tmlmobilidade/utils';

const largeDataset = Array.from({ length: 10000 }, (_, i) => ({ id: i }));

await performInChunks(largeDataset, async (chunk) => {
  await processChunk(chunk);
}, 1000); // Process 1000 items at a time
```

### Caching

```typescript
import { Cache } from '@tmlmobilidade/utils';

const cache = new Cache<string, User>(60000); // 60 second TTL

cache.set('user:123', user);
const user = cache.get('user:123');
cache.delete('user:123');
```

### Path Operations

```typescript
import { getValueAtPath, setValueAtPath } from '@tmlmobilidade/utils';

const obj = { user: { profile: { name: 'John' } } };

// Get nested value
const name = getValueAtPath(obj, 'user.profile.name'); // 'John'

// Set nested value (creates intermediate objects if needed)
setValueAtPath(obj, 'user.profile.email', 'john@example.com');
```

### HTTP Requests

```typescript
import { fetchData, uploadFile, swrFetcher } from '@tmlmobilidade/utils';

// GET request with retry
const response = await fetchData<User>('/api/users/123');
if (response.isOk()) {
  console.log(response.data);
}

// POST request
const createResponse = await fetchData<User>(
  '/api/users',
  'POST',
  { name: 'John', email: 'john@example.com' }
);

// File upload
const uploadResponse = await uploadFile<{ url: string }>('/api/upload', file);

// SWR integration
const data = await swrFetcher<User[]>('/api/users');
```

### Object Manipulation

```typescript
import { compareObjects, flattenObject, mergeObjects, convertObject } from '@tmlmobilidade/utils';
import { z } from 'zod';

// Compare objects
const prev = { name: 'Alice', age: 30 };
const curr = { name: 'Alice', age: 31 };
const diff = compareObjects(prev, curr);
// { age: { curr_value: 31, prev_value: 30 } }

// Flatten object
const nested = { a: { b: 1, c: { d: 2 } } };
const flat = flattenObject(nested);
// { 'a': { b: 1, c: { d: 2 } }, 'a.b': 1, 'a.c': { d: 2 }, 'a.c.d': 2 }

// Merge objects
const merged = mergeObjects({ a: 1, b: 2 }, { b: 3, c: 4 });
// { a: 1, b: 3, c: 4 }

// Convert to schema
const schema = z.object({ name: z.string(), age: z.number() });
const converted = convertObject({ name: 'John', age: 30, extra: 'ignored' }, schema);
// { name: 'John', age: 30 }
```

### Permissions

```typescript
import { hasPermission, hasPermissionResource } from '@tmlmobilidade/utils';

const permissions = [
  { scope: 'users', action: 'read', resource: { userId: ['123', '456'] } },
  { scope: 'users', action: 'write', resource: { userId: ['*'] } }
];

// Check if permission exists
if (hasPermission(permissions, 'users', 'read')) {
  // User has read permission
}

// Check resource-specific permission
if (hasPermissionResource({
  permissions,
  scope: 'users',
  action: 'read',
  resource_key: 'userId',
  value: '123'
})) {
  // User has permission for resource '123'
}
```

### Query Validation

```typescript
import { validateQueryParams } from '@tmlmobilidade/utils';
import { z } from 'zod';

const schema = z.object({
  page: z.coerce.number().min(1),
  limit: z.coerce.number().min(1).max(100)
});

// In a Fastify route handler
const params = validateQueryParams(req.query, schema);
// Throws HttpException if validation fails
```

### Singleton Proxy

```typescript
import { asyncSingletonProxy } from '@tmlmobilidade/utils';

class Database {
  private static instance: Database | null = null;

  static async getInstance(): Promise<Database> {
    if (!this.instance) {
      this.instance = await this.initialize();
    }
    return this.instance;
  }

  async query(sql: string) {
    // ...
  }
}

// Create proxy that handles async initialization
const db = asyncSingletonProxy(Database);
await db.query('SELECT * FROM users'); // Automatically waits for initialization
```

## License

AGPL-3.0-or-later

## Repository

[GitHub](https://github.com/tmlmobilidade/go)