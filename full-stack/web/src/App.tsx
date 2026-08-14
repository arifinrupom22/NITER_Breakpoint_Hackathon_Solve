import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ToastProvider } from './components/ui';
import Home from './pages/home/Home';
import About from './pages/About';
import Academics from './pages/Academics';
import Departments from './pages/Departments';
import Admissions from './pages/Admissions';
import Research from './pages/Research';
import Notices from './pages/Notices';
import NewsEventsPage from './pages/NewsEventsPage';
import CampusLife from './pages/CampusLife';
import StudentServices from './pages/StudentServices';
import Transport from './pages/transport/Transport';
import TransportLive from './pages/transport/TransportLive';
import DriverConsole from './pages/transport/DriverConsole';
import PortalLogin from './pages/portal/PortalLogin';
import StudentPortal from './pages/portal/StudentPortal';
import TeacherPortal from './pages/portal/TeacherPortal';
import AdminPortal from './pages/portal/AdminPortal';

export default function App() {
  return (
    <ToastProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/academics" element={<Academics />} />
          <Route path="/departments" element={<Departments />} />
          <Route path="/admissions" element={<Admissions />} />
          <Route path="/research" element={<Research />} />
          <Route path="/notices" element={<Notices />} />
          <Route path="/news-events" element={<NewsEventsPage />} />
          <Route path="/campus-life" element={<CampusLife />} />
          <Route path="/student-services" element={<StudentServices />} />
          <Route path="/transport" element={<Transport />} />
          <Route path="/transport/live" element={<TransportLive />} />
          <Route path="/transport/driver" element={<DriverConsole />} />
          <Route path="/portal/student" element={<PortalLogin role="student" />} />
          <Route path="/portal/teacher" element={<PortalLogin role="teacher" />} />
          <Route path="/portal/admin" element={<PortalLogin role="admin" />} />
        </Route>
        <Route path="/portal/student/dashboard" element={<StudentPortal />} />
        <Route path="/portal/teacher/dashboard" element={<TeacherPortal />} />
        <Route path="/portal/admin/dashboard" element={<AdminPortal />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </ToastProvider>
  );
}
