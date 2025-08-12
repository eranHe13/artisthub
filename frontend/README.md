# 🎨 ArtistryHub Frontend

> Professional artist booking and management platform - Frontend Application

![Next.js](https://img.shields.io/badge/Next.js-15.4.2-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19.1.0-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Development](#development)
- [Architecture](#architecture)
- [Components](#components)
- [Custom Hooks](#custom-hooks)
- [API Integration](#api-integration)
- [Styling](#styling)
- [Deployment](#deployment)
- [Contributing](#contributing)

## 🌟 Overview

ArtistryHub Frontend is a modern, responsive web application built with Next.js 15 and React 19. It provides artists with a comprehensive dashboard to manage bookings, track earnings, update profiles, and interact with clients.

### Key Highlights
- **🚀 Modern Stack**: Next.js 15 with App Router, React 19, TypeScript 5
- **📱 Responsive Design**: Mobile-first approach with Tailwind CSS
- **🔧 Modular Architecture**: Clean separation of concerns with custom hooks
- **🎯 Type Safety**: Full TypeScript implementation
- **⚡ Performance Optimized**: React 19 features, lazy loading, optimized rendering

## ✨ Features

### 🎯 Core Features
- **Artist Dashboard** - Comprehensive overview of bookings and earnings
- **Booking Management** - Handle requests, approve/reject bookings
- **Profile Management** - Update artist information and photos
- **Calendar View** - Visual booking schedule with interactive calendar
- **Earnings Tracking** - Detailed financial analytics and reports
- **Real-time Updates** - Live booking status changes

### 🔐 Authentication & Security
- **Google OAuth Integration** - Secure authentication via Google
- **Session Management** - Persistent login state
- **Protected Routes** - Role-based access control

### 📱 User Experience
- **Responsive Design** - Works seamlessly on all devices
- **Dark Theme** - Modern dark UI with elegant styling
- **Interactive Components** - Smooth animations and transitions
- **Loading States** - Skeleton loading and progress indicators

## 🛠️ Tech Stack

### Frontend Framework
- **[Next.js 15](https://nextjs.org/)** - React framework with App Router
- **[React 19](https://react.dev/)** - UI library with latest features
- **[TypeScript 5](https://www.typescriptlang.org/)** - Type-safe JavaScript

### Styling & UI
- **[Tailwind CSS 4](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Lucide React](https://lucide.dev/)** - Beautiful icons
- **[Class Variance Authority](https://cva.style/)** - Component variants

### State Management & Data
- **Custom React Hooks** - Centralized state management
- **React Query Pattern** - Efficient data fetching and caching
- **Local Storage** - Client-side data persistence

### Authentication
- **[NextAuth.js](https://next-auth.js.org/)** - Authentication for Next.js
- **[@react-oauth/google](https://www.npmjs.com/package/@react-oauth/google)** - Google OAuth integration

### Additional Libraries
- **[React Calendar](https://www.npmjs.com/package/react-calendar)** - Interactive calendar component
- **[Cloudinary](https://cloudinary.com/)** - Image upload and management
- **[clsx](https://www.npmjs.com/package/clsx)** - Conditional classNames utility

## 📁 Project Structure

```
frontend/
├── 📁 src/
│   ├── 📁 app/                    # Next.js App Router
│   │   ├── 📁 hooks/              # Custom React hooks
│   │   │   ├── useArtistProfile.ts
│   │   │   ├── useBookings.ts
│   │   │   ├── useDashboardData.ts
│   │   │   ├── useDashboardStats.ts
│   │   │   ├── useUploadImage.ts
│   │   │   ├── index.ts
│   │   │   └── README.md
│   │   ├── 📁 types/              # TypeScript definitions
│   │   │   ├── booking.ts
│   │   │   ├── profile.ts
│   │   │   ├── dashboard.ts
│   │   │   ├── earnings.ts
│   │   │   └── calendar.ts
│   │   ├── 📁 dashboard/          # Dashboard pages
│   │   │   └── page.tsx
│   │   ├── 📁 artist/             # Artist pages
│   │   │   └── [artistId]/
│   │   │       ├── page.tsx
│   │   │       └── booking/
│   │   │           └── page.tsx
│   │   ├── 📁 auth/               # Authentication
│   │   │   └── callback/
│   │   │       └── page.tsx
│   │   ├── 📁 login/              # Login page
│   │   │   └── page.tsx
│   │   ├── layout.tsx             # Root layout
│   │   ├── globals.css            # Global styles
│   │   └── favicon.ico
│   ├── 📁 components/             # Reusable components
│   │   ├── DashboardSection.tsx
│   │   ├── ProfileSection.tsx
│   │   ├── RequestsSection.tsx
│   │   ├── EarningsSection.tsx
│   │   ├── CalendarSection.tsx
│   │   ├── BookingDetailDrawer.tsx
│   │   ├── SummaryCard.tsx
│   │   └── 📁 ui/                 # UI primitives
│   │       └── card.tsx
│   └── 📁 lib/                    # Utilities
│       ├── auth.tsx               # Authentication logic
│       └── utils.ts               # Helper functions
├── 📁 public/                     # Static assets
│   └── profile.png
├── package.json
├── tsconfig.json
├── next.config.ts
├── tailwind.config.js
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18.0 or later
- **npm** or **yarn** package manager
- **Backend API** running on `http://localhost:8000`

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Configure the following variables:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   NEXTAUTH_SECRET=your-secret-key
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   NEXTAUTH_URL=http://localhost:3000
   ```

4. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 💻 Development

### Available Scripts

```bash
# Development server with Turbopack
npm run dev

# Production build
npm run build

# Start production server
npm run start

# Run ESLint
npm run lint

# Type checking
npx tsc --noEmit
```

### Development Workflow

1. **Component Development**
   - Create components in `src/components/`
   - Use TypeScript for type safety
   - Follow the existing naming conventions

2. **Hook Development**
   - Create custom hooks in `src/app/hooks/`
   - Export from `index.ts` for easy imports
   - Document usage in the hooks README

3. **Type Definitions**
   - Add types in `src/app/types/`
   - Keep interfaces focused and reusable
   - Export types for component usage

4. **Styling**
   - Use Tailwind CSS utilities
   - Follow the existing color scheme
   - Maintain responsive design patterns

## 🏗️ Architecture

### Design Patterns

#### 1. **Custom Hooks Pattern**
Centralized data management and business logic:

```typescript
// Example: useDashboardData hook
const {
  artistProfile,
  bookings,
  dashboardStats,
  updateBookingStatus
} = useDashboardData();
```

#### 2. **Component Composition**
Modular, reusable components:

```typescript
// Dashboard composed of focused sections
<DashboardSection stats={dashboardStats} />
<RequestsSection bookings={bookings} />
<EarningsSection earnings={earnings} />
```

#### 3. **Type-First Development**
Strong typing throughout the application:

```typescript
interface BookingRequest {
  id: number;
  client_name: string;
  event_date: string;
  status: 'Pending' | 'Approved' | 'Close';
  // ... more properties
}
```

### State Management Strategy

- **Local State**: Component-specific UI state (`useState`)
- **Server State**: API data managed by custom hooks
- **Derived State**: Computed values using `useMemo`
- **Side Effects**: Handled in custom hooks with `useEffect`

## 🧩 Components

### Core Components

#### 1. **DashboardSection**
- Overview of key metrics
- Recent booking requests
- Quick actions

#### 2. **RequestsSection** 
- Filterable booking requests
- Status management
- Bulk operations

#### 3. **ProfileSection**
- Artist profile editing
- Image upload with Cloudinary
- Form validation

#### 4. **EarningsSection**
- Revenue analytics
- Monthly breakdowns
- Approved bookings list

#### 5. **CalendarSection**
- Interactive calendar view
- Booking visualization
- Date-based filtering

#### 6. **BookingDetailDrawer**
- Detailed booking information
- Edit booking details
- Status change actions

### UI Components

#### Card System
Consistent card-based layout:

```typescript
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>
    Content here
  </CardContent>
</Card>
```

## 🪝 Custom Hooks

### Data Management Hooks

#### `useDashboardData`
Master hook that orchestrates all dashboard data:

```typescript
const {
  artistProfile,
  bookings,
  dashboardStats,
  earningsStats,
  updateBookingStatus,
  refreshAllData
} = useDashboardData();
```

#### `useArtistProfile`
Manages artist profile data:

```typescript
const {
  artistProfile,
  profileLoading,
  updateArtistProfile
} = useArtistProfile();
```

#### `useBookings`
Handles booking operations:

```typescript
const {
  bookings,
  bookingsLoading,
  updateBookingDetails,
  updateBookingStatus
} = useBookings();
```

#### `useDashboardStats`
Calculates statistics and analytics:

```typescript
const {
  dashboardStats,
  earningsStats,
  statsLoading
} = useDashboardStats();
```

#### `useUploadImage`
Manages image uploads to Cloudinary:

```typescript
const {
  uploadImage,
  isUploading,
  uploadProgress
} = useUploadImage();
```

## 🌐 API Integration

### Base Configuration

```typescript
const API_BASE_URL = 'http://localhost:8000';

// API endpoints
const endpoints = {
  profile: '/api/artist/me',
  dashboard: '/api/artist/dashboard',
  bookings: '/api/bookings',
  updateBooking: (id: number) => `/api/bookings/${id}`,
  updateStatus: (id: number) => `/api/bookings/${id}/status`
};
```

### Error Handling

```typescript
try {
  const response = await fetch(endpoint, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' }
  });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  
  return await response.json();
} catch (error) {
  console.error('API Error:', error);
  // Handle error appropriately
}
```

## 🎨 Styling

### Design System

#### Colors
```css
/* Primary palette */
--background: #181c23;
--sidebar: #232733;
--text: #ffffff;
--text-secondary: #9ca3af;
--accent: #3b82f6;
--success: #10b981;
--warning: #f59e0b;
--danger: #ef4444;
```

#### Typography
- **Primary Font**: Geist Sans
- **Monospace**: Geist Mono
- **Sizes**: Responsive scale using Tailwind utilities

#### Spacing
- **Consistent Grid**: 4px base unit
- **Component Spacing**: Standardized gaps and padding
- **Responsive Breakpoints**: Mobile-first approach

### Component Styling

```typescript
// Example: Button variants using CVA
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-lg font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-blue-600 text-white hover:bg-blue-500",
        outline: "border border-gray-300 hover:bg-gray-50"
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-11 px-8"
      }
    }
  }
);
```

## 🚀 Deployment

### Build Process

1. **Type Checking**
   ```bash
   npx tsc --noEmit
   ```

2. **Linting**
   ```bash
   npm run lint
   ```

3. **Build**
   ```bash
   npm run build
   ```

### Environment Variables

Production environment setup:

```env
NEXT_PUBLIC_API_URL=https://your-api-domain.com
NEXTAUTH_SECRET=your-production-secret
NEXTAUTH_URL=https://your-domain.com
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### Deployment Options

#### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

#### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🤝 Contributing

### Development Guidelines

1. **Code Style**
   - Use TypeScript for all new code
   - Follow existing naming conventions
   - Write descriptive commit messages

2. **Component Guidelines**
   - Keep components focused and single-purpose
   - Use props for configuration, not children for complex data
   - Implement proper loading and error states

3. **Hook Guidelines**
   - Name hooks with `use` prefix
   - Return objects, not arrays for multiple values
   - Handle loading and error states

4. **Testing**
   - Write unit tests for utility functions
   - Test component rendering and interactions
   - Mock API calls in tests

### Pull Request Process

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Review Checklist

- [ ] TypeScript types are properly defined
- [ ] Components are responsive
- [ ] Error handling is implemented
- [ ] Loading states are handled
- [ ] Code follows existing patterns
- [ ] No console.log statements in production code

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Custom Hooks Guide](./src/app/hooks/README.md)

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙋‍♂️ Support

For questions and support:

- **Documentation**: Check the `/src/app/hooks/README.md` for detailed hook usage
- **Issues**: Create an issue in the repository
- **Discussions**: Use GitHub Discussions for questions

---

**Built with ❤️ using Next.js, React, and TypeScript**

*Last updated: $(date)*