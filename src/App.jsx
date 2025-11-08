import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { useAuth } from "./hooks/useAuth";
import Navbar from "./components/layout/Navbar";
import Sidebar from "./components/layout/Sidebar";
import AppRoutes from "./routes/AppRoutes";
import ErrorBoundary from "./components/common/ErrorBoundary";
import DevLoginHelper from "./components/dev/DevLoginHelper";
import "./index.css";

/**
 * Main app content component
 * Handles layout and routing based on authentication state
 */
const AppContent = () => {
  const { isAuthenticated } = useAuth();

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex">
          {isAuthenticated && <Sidebar />}
          <main
            className={`flex-1 transition-all duration-300 ${
              isAuthenticated ? "lg:ml-64" : ""
            }`}
          >
            <AppRoutes />
          </main>
        </div>
        <DevLoginHelper />
      </div>
    </ErrorBoundary>
  );
};

/**
 * Root App component
 * Sets up providers and routing
 */
function App() {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <ErrorBoundary>
        <AuthProvider>
          <NotificationProvider>
            <AppContent />
          </NotificationProvider>
        </AuthProvider>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default App;
