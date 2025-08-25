# InmoFlow AI - Real Estate CRM/ERP

A comprehensive real estate CRM/ERP system with AI-powered features for property management, lead tracking, valuations, and marketing automation.

## Features

### 🏠 Property Management
- Complete CRUD operations for properties
- Media gallery with photo/video support
- Advanced filtering and search
- Property status tracking (draft, active, reserved, sold, rented)
- Interactive map view with property locations

### 👥 Lead Management
- Lead pipeline with drag-and-drop Kanban board
- Lead preferences and budget tracking
- Stage management (new, qualified, visiting, offer, won, lost)
- Lost reason tracking for analytics

### 🤖 AI-Powered Features
- **Smart Matching**: AI-powered lead-to-property matching with scoring
- **Property Valuation**: Automated price estimation with comparable analysis
- **Marketing Content**: AI-generated ads, emails, and video scripts
- **Multiple Styles**: Friendly, luxury, and investor-focused content

### 📅 Visit Scheduling
- Weekly calendar view for property visits
- Visit status tracking and notes
- ICS export for calendar integration
- Reminder notifications

### 📢 Multi-Portal Publishing
- Publish properties to multiple portals (Idealista, Fotocasa, etc.)
- Real-time publishing progress tracking
- Error handling and retry mechanisms
- URL tracking for published listings

### 📊 Analytics & Reporting
- Comprehensive KPI dashboard
- Sales funnel visualization
- Activity tracking and trends
- Property location mapping

### 📄 Contract Management
- Digital contract templates with variables
- Electronic signature simulation
- Contract status tracking
- PDF generation and storage

### ⚙️ Settings & Configuration
- User management with role-based access
- AI template customization
- Multi-language support (Spanish/English)
- Dark/light theme toggle

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS with dark mode support
- **State Management**: TanStack Query for server state
- **Forms**: React Hook Form with Zod validation
- **Tables**: TanStack Table with sorting/filtering
- **Charts**: Recharts for data visualization
- **Maps**: React Leaflet with fallback support
- **Routing**: React Router DOM
- **Internationalization**: react-i18next
- **Testing**: Vitest + Playwright
- **Mocking**: MSW (Mock Service Worker)

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd inmoflow-ai
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Demo Credentials

The application includes demo users for testing:

- **Admin**: admin@inmoflow.com / demo123
- **Agent**: agent@inmoflow.com / demo123

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test` - Run unit tests
- `npm run test:e2e` - Run end-to-end tests
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Demo Workflows

### A) Property Management Flow
1. Navigate to Properties → New Property
2. Fill in property details (title, price, address, features)
3. Add photos and set status to "active"
4. Go to Publishing page and select portals
5. Monitor publishing progress and view generated URLs

### B) Lead to Visit Flow
1. Go to Leads page and create a new lead
2. Set preferences (budget, location, requirements)
3. Navigate to AI Matching and select the lead
4. Review matching results with scores and reasons
5. Create a visit from a high-scoring match
6. Go to Schedule page and export ICS file

### C) Property Valuation
1. Navigate to Valuations page
2. Enter property details (location, features)
3. Get AI-powered price estimation
4. Review comparable properties and rationale
5. Use insights for pricing strategy

### D) Marketing Content Generation
1. Go to Marketing Studio
2. Select content type (ad, email, or reel script)
3. Choose property and style (friendly/luxury/investor)
4. Generate AI-powered content
5. Copy or print the generated content

### E) Contract Management
1. Navigate to Contracts page
2. Create new contract with property and client
3. Review generated contract with variables
4. Sign using the digital signature pad
5. Track contract status and completion

## Architecture

### File Structure
```
src/
├── app/                 # App configuration and providers
├── components/          # Reusable UI components
├── features/           # Feature-based modules
│   ├── auth/           # Authentication
│   ├── properties/     # Property management
│   ├── leads/          # Lead management
│   ├── matching/       # AI matching
│   ├── valuations/     # Property valuations
│   ├── schedule/       # Visit scheduling
│   ├── publishing/     # Portal publishing
│   ├── marketing/      # Content generation
│   ├── contracts/      # Contract management
│   ├── analytics/      # Analytics and reporting
│   └── settings/       # Application settings
├── ai/                 # AI service abstraction
├── mocks/              # MSW mock handlers
├── locales/            # Internationalization
└── styles/             # Global styles
```

### Key Design Patterns
- **Feature-based architecture** for scalability
- **Component composition** for reusability
- **Custom hooks** for business logic
- **Service layer** for API interactions
- **Mock-first development** with MSW

## AI Integration

The application includes a flexible AI service layer that supports both mock and HTTP implementations:

- **Mock AI Driver**: Deterministic algorithms for development/demo
- **HTTP AI Driver**: Integration with external AI services
- **Configurable**: Switch between implementations via environment variables

## Testing

### Unit Tests
```bash
npm run test
```

Tests cover:
- Form validation with Zod schemas
- AI matching algorithms
- Utility functions (ICS generation, etc.)
- Component rendering and interactions

### E2E Tests
```bash
npm run test:e2e
```

E2E tests cover complete user workflows:
- Authentication flow
- Property creation and publishing
- Lead management and matching
- Visit scheduling and export
- Contract creation and signing

## Deployment

Build the application for production:

```bash
npm run build
```

The built files will be in the `dist` directory, ready for deployment to any static hosting service.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite
6. Submit a pull request

## License

This project is licensed under the MIT License.