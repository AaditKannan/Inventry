# Inventry

Community-driven robotics inventory and part lending platform for FTC/robotics teams.

## Features

- **Team Management**: Create and join robotics teams
- **Inventory Management**: Track parts, quantities, and conditions
- **Part Lending**: Request and manage part loans between teams
- **Map View**: Visualize team locations and available inventory
- **Invoice Parsing**: Upload and parse invoices to automatically add parts
- **Real-time Updates**: Track request status and transaction history

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui, Radix UI
- **Database**: Supabase (PostgreSQL) with Row Level Security
- **Authentication**: Supabase Auth (Magic Link + OAuth)
- **Maps**: MapLibre GL (open source alternative to Mapbox)
- **Forms**: React Hook Form + Zod validation
- **State Management**: Zustand + React Query
- **Email**: Resend for notifications

## Quick Start

### Prerequisites

- Node.js 20+
- pnpm
- Supabase account

### Development Setup

1. **Clone and install dependencies**
   ```bash
   git clone <your-repo>
   cd inventry
   pnpm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Fill in your Supabase and other API keys
   ```

3. **Set up Supabase**
   - Create a new Supabase project
   - Run the SQL from `supabase/schema.sql` in the SQL editor
   - Configure Auth settings (Email + OAuth providers)
   - Create Storage bucket `invoices`

4. **Start development server**
   ```bash
   pnpm dev
   ```

5. **Seed local data (optional)**
   ```bash
   pnpm seed:local
   ```

### Environment Variables

```bash
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
RESEND_API_KEY=your_resend_api_key
MAPBOX_TOKEN=your_mapbox_token
INVENTRY_FROM_EMAIL=notifications@inventry.app
```

## Project Structure

```
src/
├── app/                 # Next.js App Router
│   ├── (auth)/         # Authentication routes
│   ├── app/            # Protected app routes
│   └── globals.css     # Global styles
├── components/          # Reusable components
│   └── ui/             # shadcn/ui components
├── lib/                 # Utility functions
│   ├── supabase/       # Supabase client config
│   └── env.ts          # Environment validation
├── types/               # TypeScript type definitions
└── scripts/             # Build and utility scripts
```

## Database Schema

The app uses a PostgreSQL database with the following main entities:

- **profiles**: User profiles linked to teams
- **teams**: Robotics teams with location data
- **parts**: Part definitions (global catalog)
- **inventory_items**: Team-specific part inventory
- **requests**: Part lending requests between teams
- **transactions**: Actual part transfers
- **locations**: Team storage locations
- **invoices**: Invoice uploads and parsed data

All tables have Row Level Security (RLS) enabled to ensure data isolation between teams.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.
