# Modern React TypeScript Application

A modern React TypeScript application built with Vite, Redux Toolkit, Axios, and SCSS.

## Technologies Used

- **React 19**: The latest version of React for building user interfaces
- **TypeScript**: For type safety and better developer experience
- **Vite**: Fast and modern build tool
- **Redux Toolkit**: State management with simplified Redux setup
- **Axios**: HTTP client for API requests
- **SCSS**: CSS preprocessor for styling

## Project Structure

```
frontend/
├── public/              # Static assets
├── src/
│   ├── api/             # API configuration and services
│   ├── components/      # Reusable components
│   │   └── Button/      # Example component with index.ts, Button.tsx, Button.scss
│   ├── pages/           # Application pages
│   │   └── Home/        # Example page with index.ts, Home.tsx, Home.scss
│   ├── store/           # Redux store configuration
│   │   ├── hooks.ts     # Typed Redux hooks
│   │   ├── index.ts     # Store configuration
│   │   └── slices/      # Redux slices
│   ├── styles/          # Global styles
│   │   ├── global.scss  # Global style rules
│   │   └── variables.scss # SCSS variables
│   ├── types/           # TypeScript type declarations
│   ├── App.tsx          # Main App component
│   └── main.tsx         # Application entry point
├── .env                 # Environment variables
├── .env.example         # Example environment variables
├── tsconfig.json        # TypeScript configuration
├── vite.config.ts       # Vite configuration
└── package.json         # Project dependencies and scripts
```

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on `.env.example`
4. Start the development server:
   ```bash
   npm run dev
   ```

## Available Scripts

- `npm run dev`: Start the development server
- `npm run build`: Build the application for production
- `npm run lint`: Run ESLint to check for code issues
- `npm run preview`: Preview the production build locally

## Features

- Modern React with functional components and hooks
- Type-safe development with TypeScript
- State management with Redux Toolkit
- API integration with Axios
- Component-based architecture
- SCSS modules for component styling
- Global styles and variables
- Path aliases for cleaner imports
