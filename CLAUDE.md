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
- **Server Actions**: Located in `actions.ts` files within each route folder
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
```typescript
// In actions.ts files
export const actionName = actionClient
  .schema(zodSchema)
  .action(async ({ parsedInput }) => {
    // Business logic via services
    // Return data or throw errors
  });

// In components
const { execute, isExecuting } = useAction(actionName, {
  onSuccess: (result) => { /* handle success */ },
  onError: (error) => { /* handle error */ }
});
```

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
- Upload endpoint at `/api/images`

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
- Server Components: Direct service/repository calls
- Client Components: Server Actions via `useAction`
- No client-side data fetching libraries (SWR, React Query)

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