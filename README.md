# Modern Kanban Board Application

A full-stack Kanban board application built with Angular and NestJS, featuring a modern UI with Tailwind CSS and real-time updates.

## Features

- 📋 Create and manage multiple Kanban boards
- 🎯 Drag-and-drop cards between columns
- 👥 Assign users to cards
- 🏷️ Add labels and due dates
- 🔄 Real-time updates using WebSockets
- 🎨 Modern UI with Tailwind CSS and Shadcn
- 📱 Responsive design for all devices

## Tech Stack

### Frontend
- Angular 17
- Tailwind CSS
- Shadcn UI
- RxJS
- Angular Signals
- NgRx (for complex state management)

### Backend
- NestJS
- TypeORM
- PostgreSQL
- WebSocket (Socket.io)
- JWT Authentication

### Shared
- TypeScript
- Shared Types Library
- ESLint + Prettier

## Project Structure

```
valinor/
├── frontend/          # Angular application
├── backend/           # NestJS application
└── shared-types/      # Shared TypeScript interfaces
```

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm (v9 or later)
- PostgreSQL (v14 or later)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd valinor
```

2. Install dependencies for all projects:
```bash
# Install shared-types dependencies
cd shared-types
npm install
npm run build

# Install backend dependencies
cd ../backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. Configure environment variables:
```bash
# Backend (.env)
DATABASE_URL=postgresql://user:password@localhost:5432/kanban
JWT_SECRET=your-secret-key
PORT=3000

# Frontend (.env)
API_URL=http://localhost:3000
WS_URL=ws://localhost:3000
```

4. Start the development servers:

```bash
# Terminal 1 - Backend
cd backend
npm run start:dev

# Terminal 2 - Frontend
cd frontend
npm start
```

The application will be available at:
- Frontend: http://localhost:4200
- Backend API: http://localhost:3000
- Swagger Documentation: http://localhost:3000/api

## Development

### Code Style

- Follow Angular and NestJS best practices
- Use TypeScript strict mode
- Follow the Angular style guide
- Use proper typing with shared interfaces
- Write unit tests for components and services

### Testing

```bash
# Run frontend tests
cd frontend
npm run test

# Run backend tests
cd backend
npm run test
```

### Building for Production

```bash
# Build shared types
cd shared-types
npm run build

# Build backend
cd ../backend
npm run build

# Build frontend
cd ../frontend
npm run build
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Security

- All endpoints are protected with JWT authentication
- Input validation using class-validator
- CORS protection
- Rate limiting
- Helmet security headers
- SQL injection protection with TypeORM

## License

This project is licensed under the ISC License.
