import { Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Dashboard from './pages/Dashboard';
import HabitTracker from './pages/HabitTracker';
import GoalPlanner from './pages/GoalPlanner';
import DailyPlanner from './pages/DailyPlanner';
import WeeklyPlanner from './pages/WeeklyPlanner';
import Analytics from './pages/Analytics';
import History from './pages/History';
import Settings from './pages/Settings';

function App() {
  return (
    <div className="min-h-screen bg-dark-900">
      <Navigation />
      <main>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/habits" element={<HabitTracker />} />
          <Route path="/goals" element={<GoalPlanner />} />
          <Route path="/daily" element={<DailyPlanner />} />
          <Route path="/weekly" element={<WeeklyPlanner />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/history" element={<History />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
