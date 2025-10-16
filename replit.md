# Overview

This is an educational ecosystem platform called "Parcero.eco" that teaches practical life skills not covered in traditional education. The platform is a comprehensive learning management system with blockchain integration, featuring token-based rewards for course completion and community engagement. It combines modern web technologies with Web3 functionality to create an incentivized learning environment focused on real-world skills like business, finance, wellness, and communication.

# User Preferences

Preferred communication style: Simple, everyday language.
Development approach: Only change what is specifically requested, nothing else.

# System Architecture

## Frontend Architecture
The frontend is built using **React 18** with **TypeScript** in a single-page application architecture. The UI leverages **shadcn/ui** components for consistent design, built on top of **Radix UI** primitives and styled with **Tailwind CSS**. The application uses **Wouter** for client-side routing and **TanStack Query** for state management and server communication. The design system follows a "new-york" style variant with a custom color palette centered around primary green (`hsl(158, 64%, 52%)`) and accent yellow (`hsl(43, 96%, 56%)`).

Key architectural decisions:
- Component-based architecture with reusable UI components
- Custom hooks for Web3 integration and mobile responsiveness
- Toast notifications for user feedback
- Responsive design with mobile-first approach
- Dark/light theme support built into the design system

## Backend Architecture
The backend uses **Express.js** with **TypeScript** in an ESM environment. The server architecture includes:
- RESTful API design with route-based organization
- Middleware for request logging and error handling
- Integration with Vite for development hot reloading
- Modular storage interface pattern for database abstraction

The server implements a comprehensive API covering:
- User management and authentication
- Course and module management
- Progress tracking and analytics
- Token transaction handling
- Community features and content management

## Database Architecture
The system uses **PostgreSQL** as the primary database with **Drizzle ORM** for type-safe database operations. The schema includes:
- Users table with role-based access (student, instructor, admin)
- Courses and course modules with hierarchical content structure
- User progress tracking with completion metrics
- Token transactions for blockchain integration
- Community posts and analytics tables
- Support for JSON content from external CMS integration

## Web3 Integration
The platform integrates with the **Polygon blockchain** for token-based rewards:
- Custom PARCERO token at address `0x3bd570B91c77788c8d3AB3201184feB93CB0Cf7f`
- MetaMask and WalletConnect integration
- Automatic token distribution for course completion
- Real-time balance checking and transaction history
- Connection to PolygonScan for transaction verification

## Content Management Integration
The system is designed to integrate with **Strapi CMS** for content management:
- Rich content storage in JSON format
- Course and module content synchronization
- Media asset management
- Content versioning and publishing workflow
- API-driven content updates

## Development Architecture
The project uses a **monorepo structure** with shared TypeScript types and utilities:
- `/client` - React frontend application
- `/server` - Express.js backend API
- `/shared` - Common schemas and types using Zod
- Build process combines Vite for frontend and esbuild for backend
- Development environment with hot reloading and error overlays

# External Dependencies

## Blockchain Services
- **Polygon Network**: Main blockchain for token transactions and smart contract interactions
- **PARCERO Token Contract**: Custom ERC-20 token at `0x3bd570B91c77788c8d3AB3201184feB93CB0Cf7f`
- **PolygonScan**: Block explorer integration for transaction verification
- **MetaMask/WalletConnect**: Web3 wallet providers for user authentication

## Database Services
- **PostgreSQL**: Primary database using Neon Database serverless platform
- **Drizzle ORM**: Type-safe database operations and migrations
- **Connection pooling**: Using `connect-pg-simple` for session management

## Content Management
- **Strapi CMS**: Headless CMS for course content and media management
- **Rich text content**: JSON-based content structure for flexible rendering
- **Media assets**: Integration for images, videos, and documents

## Development and Deployment
- **Vite**: Frontend build tool and development server
- **esbuild**: Backend build tool for production deployments
- **Replit**: Development environment with runtime error reporting
- **TypeScript**: Full-stack type safety with strict configuration

## UI and Design
- **shadcn/ui**: Component library built on Radix UI primitives
- **Tailwind CSS**: Utility-first CSS framework with custom design tokens
- **Radix UI**: Accessible UI component primitives
- **Lucide React**: Icon library for consistent iconography
- **Google Fonts**: Inter font family for typography

## Analytics and Monitoring
- Built-in analytics system for tracking user engagement and learning progress
- Course performance metrics and completion tracking
- Token distribution analytics and reward optimization
- Community activity monitoring and engagement metrics