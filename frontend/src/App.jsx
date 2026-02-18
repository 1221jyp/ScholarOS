import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import InstructorAssignments from './pages/InstructorAssignments';
import StudySessions from './pages/StudySessions';
import Students from './pages/Students';
import Instructors from './pages/Instructors';
import Attendance from './pages/Attendance';
import Grades from './pages/Grades';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="assignments" element={<InstructorAssignments />} />
          <Route path="study-sessions" element={<StudySessions />} />
          <Route path="students" element={<Students />} />
          <Route path="instructors" element={<Instructors />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="grades" element={<Grades />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
