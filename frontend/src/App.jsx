import { Navigate, Route, Routes } from "react-router-dom";
import ActivityLogsPage from "./pages/ActivityLogsPage";
import AuthorsPage from "./pages/AuthorsPage";
import BookFormPage from "./pages/BookFormPage";
import BooksPage from "./pages/BooksPage";
import CategoriesPage from "./pages/CategoriesPage";
import DashboardPage from "./pages/DashboardPage";
import FinesPage from "./pages/FinesPage";
import IssueBookPage from "./pages/IssueBookPage";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import MemberFormPage from "./pages/MemberFormPage";
import MembersPage from "./pages/MembersPage";
import NotFoundPage from "./pages/NotFoundPage";
import ProfilePage from "./pages/ProfilePage";
import PublishersPage from "./pages/PublishersPage";
import ReportsPage from "./pages/ReportsPage";
import ReturnBookPage from "./pages/ReturnBookPage";
import { useAuth } from "./context/AuthContext";
import AppLayout from "./layouts/AppLayout";
import ProtectedRoute from "./routes/ProtectedRoute";

const STAFF_ROLES = ["admin", "librarian"];

function HomeRoute() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <LandingPage />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeRoute />} />
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="books" element={<BooksPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route element={<ProtectedRoute roles={STAFF_ROLES} />}>
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="books/new" element={<BookFormPage />} />
            <Route path="books/:id/edit" element={<BookFormPage />} />
            <Route path="members" element={<MembersPage />} />
            <Route path="members/new" element={<MemberFormPage />} />
            <Route path="members/:id/edit" element={<MemberFormPage />} />
            <Route path="authors" element={<AuthorsPage />} />
            <Route path="categories" element={<CategoriesPage />} />
            <Route path="publishers" element={<PublishersPage />} />
            <Route path="issue" element={<IssueBookPage />} />
            <Route path="return" element={<ReturnBookPage />} />
            <Route path="fines" element={<FinesPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="activity" element={<ActivityLogsPage />} />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
