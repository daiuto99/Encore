# Encore

## Overview

Encore is a musician's tool for creating and managing song setlists with both online editing capabilities and offline performance mode. The application allows users to upload song files (.md/.txt), organize them into multiple sets, and perform using an optimized performance interface. The key architectural constraint is that while creation requires an internet connection, the exported setlist becomes a fully self-contained, offline-capable HTML file.

## Recent Changes

### August 2025 - Major Feature Updates
- **Comprehensive Vocal Harmony System**: Implemented unlimited multiple harmony sections per song using {harmony}...{/harmony} syntax with purple gradient styling
- **Song Preview Workflow**: Added direct song preview by clicking songs in Song Library
- **Song Deletion**: Added song deletion functionality with confirmation dialogs and proper cleanup from sets
- **UI/UX Improvements**: Fixed responsive layout issues, renamed "Available Songs" to "Song Library", simplified display to show only song titles
- **Set Assignment Logic**: Implemented proper one-song-per-set logic with either "Add to Set" button OR "Set #" badge display
- **Branding Update**: Rebranded from "Setlist Builder" to "Encore" with custom logo integration
- **Layout Optimization**: Maintained clean vertical stacking: Folder Library → Upload Zone → Song Library → Sets → Song Viewer
- **Header Proportions**: Fixed header bar scaling with logo height (h-10) matching button heights exactly, maintaining consistent proportions across responsive states
- **Editor Preview Consistency**: Aligned formatting between song editor preview mode and main song viewer using identical CSS classes and typography
- **Production Deployment**: Successfully deployed to custom domain `encore.sonicink.com` with proper SSL certificate and DNS configuration
- **iPad/Safari Compatibility**: Enhanced folder library messaging for iPad/Safari users, clarifying that automatic folder sync requires Chrome/Edge while drag & drop upload works universally
- **Song Counting Bug Fix**: Resolved critical issue where loaded setlists showed incorrect available song counts due to ID mismatch between allSongs and sets after import/export cycles. Implemented name-based fallback matching for reliable song assignment tracking
- **Enhanced Search Precision**: Improved song library search to only search titles and artists instead of full song content, with smart parsing for "Title - Artist" formats and word-based matching for better results
- **Song Drag-and-Drop Reordering**: Implemented comprehensive song reordering within sets using both up/down arrow buttons and touch-friendly drag-and-drop with bright purple visual drop indicators for iPad compatibility

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **UI Library**: Shadcn/ui components built on Radix UI primitives with Tailwind CSS for styling
- **State Management**: Custom React hooks with local state management (no external state library)
- **Routing**: Wouter for lightweight client-side routing
- **Data Fetching**: TanStack Query for server state management

### Component Structure
- **Modular Design**: Components organized by feature (setlist management, song viewing, performance mode)
- **UI Components**: Comprehensive design system with reusable components (buttons, cards, dialogs, etc.)
- **Responsive Design**: Mobile-first approach with specific optimizations for iPad performance mode

### Key Features Implementation
- **File Upload**: Drag-and-drop interface for .md/.txt song files with validation
- **Folder Library**: File System Access API integration for automatic song syncing from iCloud Drive/Google Drive folders with auto-sync on connection
- **Song Management**: Library system with search functionality and set organization
- **Performance Mode**: Optimized full-screen interface with touch gestures, keyboard shortcuts, and wake lock
- **Theme System**: Light/dark mode toggle with CSS custom properties
- **Font Scaling**: Dynamic font size adjustment (50-200%) using CSS variables

### Backend Architecture
- **Server**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM for schema management
- **Storage**: Neon serverless database for production, in-memory storage for development
- **Session Management**: Connect-pg-simple for PostgreSQL session storage

### Data Schema
- **Songs**: ID, name, content, duration
- **Sets**: ID, name, songs array, color theme
- **App State**: Comprehensive state including setlist name, current positions, UI preferences

### Export/Import System
- **Offline Export**: Generates self-contained HTML files with embedded JSON state and parsing libraries
- **Automatic Folder Export**: When connected to a folder, exports automatically save to a "sets" subdirectory
- **State Preservation**: Maintains all user data and preferences in exported files
- **Import Capability**: Restores complete application state from previously exported files

### Performance Optimizations
- **Touch Gestures**: Swipe navigation for mobile/tablet interfaces
- **Keyboard Shortcuts**: Arrow key navigation and escape key handling
- **Wake Lock**: Prevents screen sleep during performance mode
- **Responsive Breakpoints**: Optimized layouts for different screen sizes

### Development Tooling
- **Build System**: Vite with hot module replacement and development server
- **Code Quality**: TypeScript for type safety, ESLint configuration ready
- **Database Migrations**: Drizzle Kit for schema management and migrations
- **Development Features**: Replit integration with error overlay and cartographer plugins

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL connection for production database
- **drizzle-orm**: Type-safe SQL ORM for database operations
- **drizzle-kit**: Database schema management and migration tool

### UI and Styling
- **@radix-ui/react-***: Comprehensive collection of unstyled, accessible UI primitives
- **tailwindcss**: Utility-first CSS framework for styling
- **class-variance-authority**: Type-safe component variants
- **clsx**: Conditional className utility

### React Ecosystem
- **@tanstack/react-query**: Server state management and caching
- **@hookform/resolvers**: Form validation resolvers
- **wouter**: Lightweight React router
- **react-hook-form**: Forms with minimal re-renders

### Development Tools
- **vite**: Fast build tool and development server
- **typescript**: Type checking and enhanced developer experience
- **@replit/vite-plugin-***: Replit-specific development plugins

### Utility Libraries
- **date-fns**: Date manipulation and formatting
- **nanoid**: Unique ID generation
- **zod**: Schema validation and type inference
- **embla-carousel-react**: Touch-friendly carousel component
- **cmdk**: Command palette component

### Build and Deployment
- **esbuild**: Fast JavaScript bundler for production builds
- **tsx**: TypeScript execution for development server
- **postcss**: CSS processing with autoprefixer