# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `npm run dev` - Start development server with Turbopack
- `npm run build` - Run database migrations and build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm test` - Run Jest tests

### Database Operations
- `npm run db:generate` - Generate Drizzle schema migrations
- `npm run db:migrate` - Apply database migrations
- `docker-compose up` - Start PostgreSQL container for local development

### Testing
- `npm test` - Run all tests
- `npm test -- --watch` - Run tests in watch mode
- `npm test -- <test-file>` - Run specific test file

## Architecture Overview

This is a Next.js 15 ecommerce application following a 4-layer architecture pattern:

### 1. Database Layer (`/db`)
- **Schemas**: Drizzle ORM schemas in `/db/schemas/` (users, blog, credits, ecommerce)
- **Migrations**: SQL migrations in `/db/migrations/`
- Uses PostgreSQL with connection pooling via `postgres` library

### 2. Repository Layer (`/repositories`)
- Data access layer using Drizzle ORM
- Separate files for different domains (users, blogs, cart, products, etc.)
- Admin repositories in `/repositories/admin/` for admin operations
- Contains raw database queries and basic CRUD operations

### 3. Service Layer (`/services`)
- Business logic and use case orchestration
- Imports from repositories to compose complex operations
- Handles domain-specific logic and validation

### 4. Interface Layer (`/app` and `/components`)
- **Server Actions**: Located in `actions.ts` files organized by domain context
- **Components**: Server and client components using Next.js App Router
- **API Routes**: REST endpoints in `/app/api/`

## Key Technologies & Patterns

### State Management
- **Server Actions**: Primary data mutation mechanism using `next-safe-action`
- **Client State**: React hooks for local state, `useCart` hook for global cart state
- **Optimistic Updates**: Used in cart operations with `useOptimistic`

### Authentication System
- Custom session management with Arctic.js for OAuth
- Email/password and Google authentication
- Session validation in `lib/auth.ts`
- Protected routes using `authenticatedAction` and `unauthenticatedAction`

### Database Architecture
- **Users/Auth**: `users`, `sessions`, `accounts`, `confirmationEmailCode`
- **Blog**: `blogPosts`, `blogPostComment`
- **Credits**: `creditPackages`, `creditTransactions`
- **Ecommerce**: `categories`, `collections`, `products`, `productImages`, `productCollections`, `carts`, `cartItems`

### Form Handling
- React Hook Form with Zod validation
- Server-side validation using `next-safe-action`
- Separate validation schemas in `validations.ts` files

### Server Actions Pattern

**IMPORTANT**: Always use `authenticatedAction` or `unauthenticatedAction` instead of `actionClient` directly.

```typescript
// In actions.ts files - Import the proper action creators
import { authenticatedAction, unauthenticatedAction } from "@/lib/server-actions";

// For actions requiring authentication (admin, user-specific operations)
export const actionName = authenticatedAction
  .inputSchema(zodSchema)
  .action(async ({ parsedInput, ctx: { user } }) => {
    // Business logic via services
    // user object is available in ctx
    // Return data directly (no need to wrap in success object)
    return data;
  });

// For public actions (no authentication required)
export const publicActionName = unauthenticatedAction
  .inputSchema(zodSchema)
  .action(async ({ parsedInput }) => {
    // Business logic via services
    // Return data directly
    return data;
  });

// In components
const { execute, result, isExecuting, hasSucceeded, hasErrored } = useAction(actionName, {
  onSuccess: (result) => { 
    // result.data contains the action's returned data
    // Access data via result.data (e.g., result.data.products)
  },
  onError: (error) => { /* handle error */ }
});
```

**Key Differences from `actionClient`**:
- No need for manual try/catch blocks - error handling is automatic
- Authentication is handled automatically by `authenticatedAction`
- Return data directly instead of wrapping in success objects
- Use `.inputSchema()` instead of `.schema()`

### useAction Hook Usage

The `useAction()` hook provides full control over server action execution. Here's the correct usage pattern:

```typescript
const { 
  execute,        // Call action without return
  executeAsync,   // Call action with promise return
  result,         // Action execution result
  status,         // Current action status
  reset,          // Reset execution state
  isIdle,         // Boolean status checks
  isExecuting,
  hasSucceeded,
  hasErrored
} = useAction(safeActionFn, {
  onSuccess: (result) => {
    // result.data contains the successful action return value
    // Example: if action returns { store: {...} }, access via result.data.store
  },
  onError: (result) => {
    // result.serverError contains server-side errors
    // result.validationError contains input validation errors
  }
});

// Execute the action
execute({ inputData });

// Access result data
if (result?.data) {
  // Use result.data.yourProperty
}
```

**Important**: Always access returned data through `result.data`, not directly on `result`.

### Error Handling
- Custom error types in `lib/errors.ts`
- Sentry integration for error monitoring
- Consistent error responses via `shapeErrors` function
- Toast notifications for user feedback

## Admin Panel Architecture

The admin panel (`/app/admin`) provides CRUD operations for:
- **Products**: Full product management with categories, pricing, inventory
- **Categories**: Hierarchical product categorization
- **Collections**: Product groupings and relationships
- **Dashboard**: Statistics and quick actions

Admin repositories (`/repositories/admin/`) provide specialized queries for management operations.

## Cart System

- **Global State**: `useCart` hook provides real-time cart count across components
- **Session-based**: Uses cookies for guest users, merges to user account on login
- **Optimistic Updates**: Immediate UI feedback with server synchronization
- **Components**: `CartButton` (header), `AddToCartButton` (products), `CartItem` (cart page)

## File Upload & Media

- AWS S3 integration via `@aws-sdk/client-s3`
- Image compression and thumbhash generation
- Upload endpoints: `/api/images` (blog), `/api/upload/image` (products)

### File Management Pattern
All file uploads must use the utilities in `/lib/files.ts`:
- `uploadFileToBucket(fileStream, path)` - Upload files to S3
- `deleteFileFromBucket(path)` - Delete files from S3
- `getFileUrl(path)` - Get signed URLs for file access

Pattern used in services:
```typescript
// Generate unique path with timestamp
const timestamp = Date.now();
const path = `domain/subdomain_${timestamp}`;
await uploadFileToBucket(file.stream(), path);
// Store path in database for later reference
```

Examples:
- Blog posts: `posts/post_{id}_{timestamp}`
- Product images: `products/images/{timestamp}_{filename}`

## Email System

- Resend for email delivery
- React Email for template creation
- Templates in `/emails/` directory

## Development Guidelines

### Component Patterns
- Prefer Server Components over Client Components
- Use `"use client"` only when necessary (forms, interactions, browser APIs)
- Client components should be lean wrappers around server data

### Data Fetching

**CRITICAL RULE**: Components must NEVER import or call repositories or services directly. Always use server actions.

#### Server Components:
- **MUST** call server actions directly for data fetching
- **NEVER** import repositories or services directly
- Example: `const result = await getProductsAction({ page: "1" })`

#### Client Components: 
- **MUST** use Server Actions via `useAction` for ALL data operations
- **NEVER** import repositories or services directly
- Example: `const { execute: fetchData } = useAction(getDataAction)`

#### Proper Data Flow Architecture:
```
Server Component → Server Action → Service → Repository → Database
Client Component → useAction(Server Action) → Service → Repository → Database
```

#### Repository Access Rules:
- ✅ **Server Actions** can import services (preferred) or repositories
- ✅ **Services** can import repositories  
- ✅ **Server Components** can call server actions directly
- ✅ **Client Components** can call server actions via `useAction`
- ❌ **ALL Components** cannot import repositories directly
- ❌ **ALL Components** cannot import services directly
- ❌ **Components** should never skip the server action layer

#### Server Action Examples:
```typescript
// Server action for data fetching
export const getProductsAction = authenticatedAction
  .inputSchema(z.object({ page: z.string(), search: z.string().optional() }))
  .action(async ({ parsedInput }) => {
    return await adminProductService.getProducts(parsedInput);
  });

// Server component usage
const result = await getProductsAction({ page: "1" });

// Client component usage  
const { execute: fetchProducts } = useAction(getProductsAction, {
  onSuccess: (result) => setProducts(result),
});
```

**Why**: This ensures consistent data flow, proper error handling, authentication, and prevents server-only code from being bundled into client components.

### Server Action Organization

**IMPORTANT**: Organize server actions by domain context, not in a single global actions file.

#### Folder Structure Pattern:
```
/app/
  admin/
    products/
      actions.ts          ← Product-related actions
      page.tsx
      new/
        actions.ts        ← Product creation actions  
        page.tsx
    categories/
      actions.ts          ← Category-related actions
      page.tsx
    collections/
      actions.ts          ← Collection-related actions
      page.tsx
  blog/
    actions.ts            ← Blog listing actions
    [id]/
      actions.ts          ← Individual blog post actions
```

#### Action Naming Convention:
- Use descriptive names that include the domain context
- Examples: `getProductsPageDataAction`, `createProductAction`, `deleteProductAction`
- Import from context-specific files: `import { getProductsPageDataAction } from "./actions"`

#### Benefits:
- **Better organization** - Related actions are grouped together
- **Easier maintenance** - Changes to product logic stay in product folder
- **Clearer imports** - `./actions` vs long relative paths
- **Domain separation** - Each area of the app has its own action file

### Styling
- Tailwind CSS with shadcn/ui components
- Custom components in `/components/ui/`
- Mobile-first responsive design

### Testing
- Jest with React Testing Library
- Test files in `repositories/__tests__/`
- Database utilities in `/testing/`

## Environment Setup

1. Copy `.env.example` to `.env`
2. Start PostgreSQL: `docker-compose up`
3. Run migrations: `npm run db:migrate`
4. Start development: `npm run dev`

## Critical Files

- `lib/server-actions.ts` - Server action configuration with error handling
- `hooks/use-cart.ts` - Global cart state management
- `lib/auth.ts` - Authentication and session management
- `db/schemas/index.ts` - Database schema exports
- `env.ts` - Environment variable validation with t3-env