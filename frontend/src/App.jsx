import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import MainLayout from "./components/layout/MainLayout";
import LeadEnrollment from "./pages/LeadEnrollment";
import LeadFollowup from "./pages/LeadFollowup";
import Admission from "./pages/Admission";
import StudentDetails from "./pages/StudentDetails";
import StudentOverview from "./pages/StudentOverview";
import Certificate from "./pages/Certificate";
import Tracker from "./pages/Tracker";
import Reports from "./pages/Reports";
import Profile from "./pages/Profile";
import ManageUsers from "./pages/ManageUsers";
import AdmissionFormBuilder from "./pages/AdmissionFormBuilder";
import ActivityLogs from "./pages/ActivityLogs";
import Backup from "./pages/Backup";

// Simple Auth Guard
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem("token");
  return isAuthenticated ? children : <Navigate to="/" />;
};

function App() {
  const isAuthenticated = localStorage.getItem("token");

  return (
    <BrowserRouter>
      <Routes>
        {/* DEFAULT ROUTE → LOGIN or DASHBOARD */}
        <Route
          path="/"
          element={
            isAuthenticated ? <Navigate to="/dashboard" /> : <Login />
          }
        />

        {/* PROTECTED ROUTES */}
        <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/leads/enroll" element={<LeadEnrollment />} />
          <Route path="/leads/followup" element={<LeadFollowup />} />
          <Route path="/admission" element={<Admission />} />
          <Route path="/students" element={<StudentDetails />} />
          <Route path="/student/:rollNo" element={<StudentOverview />} />
          <Route path="/certificate" element={<Certificate />} />
          <Route path="/tracker" element={<Tracker />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/activity" element={<ActivityLogs />} />
          <Route path="/backup" element={<Backup />} />
          <Route path="/manage-users" element={<ManageUsers />} />
          <Route path="/settings/admission-fields" element={<AdmissionFormBuilder />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        {/* CATCH ALL */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
