# HabitOS - Lifetime Habit & Goal System

A beautiful, animated Progressive Web App (PWA) for tracking habits, goals, and productivity. Built with React, TailwindCSS, and Framer Motion.

## Features

- **Habit Tracking**: Track up to 30 habits with streaks, heatmaps, and win rates
- **Goal Planning**: Create yearly, quarterly, monthly, and weekly goals with milestones
- **Daily Planner**: Add tasks with priority levels and track completion
- **Weekly Planner**: Plan your week with task tracking
- **Analytics**: Beautiful charts showing productivity trends
- **History**: View past performance with calendar heatmaps
- **Cloud Sync**: Sign in with Google to sync data across devices via Google Drive
- **PWA**: Installable on mobile devices, works offline

## Tech Stack

- React 18
- Vite
- TailwindCSS
- Framer Motion
- Recharts
- Lucide Icons
- Canvas Confetti
- Google Drive API

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Build for Production

```bash
npm run build
```

The build output will be in the `dist` folder.

### Preview Production Build

```bash
npm run preview
```

## Google Cloud Sync Setup (Optional)

To enable Google sign-in and cloud sync:

1. **Create a Google Cloud Project**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project

2. **Enable Google Drive API**
   - Navigate to "APIs & Services" > "Library"
   - Search for "Google Drive API" and enable it

3. **Create OAuth Credentials**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Choose "Web application"
   - Add your authorized origins:
     - `http://localhost:5173` (for development)
     - `https://yourdomain.com` (for production)
   - Copy the Client ID

4. **Configure Environment Variable**
   ```bash
   # Create .env file with your Client ID
   cp .env.example .env
   # Edit .env and add your Google Client ID
   ```

5. **Restart the development server**
   ```bash
   npm run dev
   ```

## Project Structure

```
src/
├── components/      # Reusable UI components
├── pages/           # Page components
├── hooks/           # Custom React hooks
├── utils/           # Utility functions
└── styles/          # Global styles
```

## PWA Features

- Offline support with Service Worker
- Add to Home Screen
- Installable on iOS and Android
- Offline-first architecture

## Data Storage

By default, all data is stored locally in the browser using LocalStorage. No account or login required.

With Google sign-in enabled, you can:
- Save your progress to Google Drive
- Load your progress from any device
- Keep your data synchronized across devices

## License

MIT
