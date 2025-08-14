import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import './App.css';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import NewsPage from './pages/NewsPage';
import ReportsPage from './pages/ReportsPage';
import SectionsPage from './pages/SectionsPage';
// import TransitionalJusticePage from './pages/TransitionalJusticePage';
import DigitalRightsPage from './pages/DigitalRightsPage';
import AboutUsPage from './pages/AboutUsPage';
import ContactUsPage from './pages/ContactUsPage';
// AdminPanel import removed - no longer needed
import Login from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import AboutEdit from './pages/admin/AboutEdit';
import UserManagement from './pages/admin/UserManagement';
import Settings from './pages/admin/Settings';
import AdminLayout from './pages/admin/AdminLayout';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { SiteSettingsProvider } from './hooks/useSiteSettings';
import Sections from './pages/admin/Sections';
import SectionDetailsPage from './pages/SectionDetailsPage';
import AddArticle from './pages/admin/AddArticle';
import ActivityLog from './pages/admin/ActivityLog';
import ArticleManagement from './pages/admin/ArticleManagement';
import EditArticle from './pages/admin/EditArticle';
import NewsManagement from './pages/admin/NewsManagement';
import AddNews from './pages/admin/AddNews';
import EditNews from './pages/admin/EditNews';
import ReportsManagement from './pages/admin/ReportsManagement';
import AddReport from './pages/admin/AddReport';
import EditReport from './pages/admin/EditReport';
import SocialSidebar from './components/SocialSidebar';
import ReportDetails from './pages/ReportDetails';
import ArticleDetailsPage from './pages/ArticleDetailsPage';
import NewsDetailsPage from './pages/NewsDetailsPage';
import PermissionsPage from './pages/admin/PermissionsPage';
import BackupPage from './pages/admin/BackupPage';
import Profile from './pages/admin/Profile';
import ContentManagement from './pages/admin/ContentManagement';
import MessagesPage from './pages/admin/MessagesPage';
import InternalReportsPage from './pages/admin/ReportsPage';

function RequireAdminAuth({ children }) {
  const location = useLocation();
  const { user, loading } = useAuth();

  if (loading) {
    return <div style={{textAlign:'center',marginTop:100,fontSize:24}}>جاري التحقق من الصلاحية...</div>;
  }

  if (!user) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
}

function AppContent({ darkMode, setDarkMode }) {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  return (
    <div className="App">
      {!isAdminRoute && <Header darkMode={darkMode} setDarkMode={setDarkMode} />}
      <main className="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/sections" element={<SectionsPage />} />
          <Route path="/reports/:id" element={<ReportDetails />} />
          <Route path="/digital-rights" element={<DigitalRightsPage />} />
          <Route path="/about-us" element={<AboutUsPage />} />
          <Route path="/contact-us" element={<ContactUsPage />} />
          <Route path="/admin/login" element={<Login />} />
          <Route path="/admin/*" element={
            <RequireAdminAuth>
              <AdminLayout />
            </RequireAdminAuth>
          }>
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="about-edit" element={<AboutEdit />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="settings" element={<Settings />} />
            <Route path="sections" element={<Sections />} />
            <Route path="add-article" element={<AddArticle />} />
            <Route path="edit-article/:id" element={<EditArticle />} />
            <Route path="activity-log" element={<ActivityLog />} />
            <Route path="articles" element={<ArticleManagement />} />
            <Route path="news" element={<NewsManagement />} />
            <Route path="add-news" element={<AddNews />} />
            <Route path="edit-news/:id" element={<EditNews />} />
            <Route path="add-report" element={<AddReport />} />
            <Route path="reports" element={<ReportsManagement />} />
            <Route path="edit-report/:id" element={<EditReport />} />
            <Route path="permissions" element={<PermissionsPage />} />
            <Route path="backup" element={<BackupPage />} />
            <Route path="profile" element={<Profile />} />
            <Route path="content" element={<ContentManagement />} />
            <Route path="messages" element={<MessagesPage />} />
            <Route path="internal-reports" element={<InternalReportsPage />} />
          </Route>
          <Route path="/sections/:slug" element={<SectionDetailsPage />} />
          <Route path="/articles/:id" element={<ArticleDetailsPage />} />
          <Route path="/news/:id" element={<NewsDetailsPage />} />
        </Routes>
      </main>
      {!isAdminRoute && <Footer />}
      <SocialSidebar />
    </div>
  );
}

function App() {
  const [dbStatus, setDbStatus] = useState('checking'); // 'checking' | 'ok' | 'error'
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true';
  });

  useEffect(() => {
    const checkDb = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/health`);
        const data = await res.json();
        if (data.status && data.status.toLowerCase() === 'ok') {
          setDbStatus('ok');
        } else {
          setDbStatus('error');
        }
      } catch {
        setDbStatus('error');
      }
    };
    checkDb();
  }, []);

  useEffect(() => {
    document.body.classList.toggle('dark-mode', darkMode);
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  if (dbStatus === 'checking') {
    return <div style={{textAlign:'center',marginTop:100,fontSize:24}}>جاري التحقق من الاتصال بقاعدة البيانات...</div>;
  }
  if (dbStatus === 'error') {
    return <div style={{textAlign:'center',marginTop:100,fontSize:24,color:'red'}}>تعذر الاتصال بقاعدة البيانات. يرجى التأكد من تشغيل السيرفر والمحاولة مرة أخرى.</div>;
  }

  return (
    <SiteSettingsProvider>
      <AuthProvider>
        <Router>
          <AppContent darkMode={darkMode} setDarkMode={setDarkMode} />
        </Router>
      </AuthProvider>
    </SiteSettingsProvider>
  );
}

export default App;
