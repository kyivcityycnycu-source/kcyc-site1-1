
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { TeamSection } from './components/TeamSection';
import { ProjectsSection } from './components/ProjectsSection';
import { OpportunitiesSection } from './components/OpportunitiesSection';
import { ContactsSection } from './components/ContactsSection';
import { SupportSection } from './components/SupportSection';
import { AboutSection } from './components/AboutSection';
import { DocumentsSection } from './components/DocumentsSection';
import { AdminLogin } from './pages/AdminLogin';
import { AdminDashboard } from './pages/AdminDashboard';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SEO } from './components/SEO';
import { initGA, trackPageView } from './services/analytics';

// Component to scroll to top on route change and track page views
const AnalyticsTracker = () => {
  const { pathname } = useLocation();
  const prevPathname = React.useRef(pathname);
  
  useEffect(() => {
    // Initialize GA only once
    initGA();
    
    // Set scroll restoration to manual to handle it ourselves
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  React.useLayoutEffect(() => {
    // Check if we should scroll to top
    // We skip scrolling if we are just opening or closing a modal
    const isModalRoute = (path: string) => {
      return path.match(/^\/projects\/.+/) || 
             path.match(/^\/opportunities\/.+/) || 
             path.match(/^\/team\/.+/);
    };

    const isBaseRouteOfModal = (path: string, prevPath: string) => {
      if (path === '/projects' && prevPath.startsWith('/projects/')) return true;
      if (path === '/opportunities' && prevPath.startsWith('/opportunities/')) return true;
      if (path === '/team' && prevPath.startsWith('/team/')) return true;
      if (path === '/' && (prevPath.startsWith('/projects/') || prevPath.startsWith('/opportunities/') || prevPath.startsWith('/team/'))) return true;
      return false;
    };

    const openingModal = isModalRoute(pathname);
    const closingModal = isBaseRouteOfModal(pathname, prevPathname.current);

    if (!openingModal && !closingModal) {
      window.scrollTo(0, 0);
    }

    prevPathname.current = pathname;
  }, [pathname]);

  useEffect(() => {
    // Track page view
    trackPageView(pathname);
  }, [pathname]);

  return null;
};

// Protected Route Component using AuthContext
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// Layout for Public Pages (With Navbar and Footer)
const PublicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex flex-col min-h-screen font-sans text-gray-800 bg-white dark:bg-gray-950 dark:text-gray-100 transition-colors duration-300">
    <SEO />
    <Navbar />
    <main className="flex-grow">
      {children}
    </main>
    <Footer />
  </div>
);

const AppContent = () => {
  const location = useLocation();
  
  // The `backgroundLocation` is the location we were at before opening the modal
  // This allows us to keep the background stable while the modal is open
  const backgroundLocation = location.state?.backgroundLocation;

  return (
    <>
      <AnalyticsTracker />
      
      {/* 
        Main Routes: 
        If we have a backgroundLocation, we render the background routes 
        using that location, so the background stays the same.
      */}
      <Routes location={backgroundLocation || location}>
        {/* Admin Routes (No Navbar/Footer) */}
        <Route path="/login" element={<AdminLogin />} />
        <Route 
          path="/admin/dashboard" 
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />

        {/* Public Routes */}
        <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
        <Route path="/about" element={<PublicLayout><AboutSection /></PublicLayout>} />
        <Route path="/team" element={<PublicLayout><TeamSection /></PublicLayout>} />
        <Route path="/projects" element={<PublicLayout><ProjectsSection /></PublicLayout>} />
        <Route path="/opportunities" element={<PublicLayout><OpportunitiesSection /></PublicLayout>} />
        <Route path="/documents" element={<PublicLayout><DocumentsSection /></PublicLayout>} />
        <Route path="/contacts" element={<PublicLayout><ContactsSection /></PublicLayout>} />
        <Route path="/support" element={<PublicLayout><SupportSection /></PublicLayout>} />
        
        {/* 
          Direct access routes: 
          If someone visits a modal URL directly, backgroundLocation will be null,
          so these routes will render the full section as the main content.
        */}
        <Route path="/team/:id" element={<PublicLayout><TeamSection /></PublicLayout>} />
        <Route path="/projects/:id" element={<PublicLayout><ProjectsSection /></PublicLayout>} />
        <Route path="/opportunities/:id" element={<PublicLayout><OpportunitiesSection /></PublicLayout>} />
      </Routes>

      {/* 
        Modal Overlay Routes:
        If we have a backgroundLocation, it means we are in a modal state.
        We render the modal route on top of the background.
        The components themselves (TeamSection, ProjectsSection, etc.) 
        handle the modal display based on the :id param.
      */}
      {backgroundLocation && (
        <Routes>
          <Route path="/team/:id" element={<TeamSection onlyModal={true} />} />
          <Route path="/projects/:id" element={<ProjectsSection onlyModal={true} />} />
          <Route path="/opportunities/:id" element={<OpportunitiesSection onlyModal={true} />} />
        </Routes>
      )}
    </>
  );
};

const App = () => {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <AuthProvider>
          <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <AppContent />
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
};

export default App;
