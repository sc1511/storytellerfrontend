import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import LoginPage from './pages/LoginPage'
import HomePage from './pages/HomePage'
import StoryGeneratorPage from './pages/StoryGeneratorPage'
import StoryReaderPage from './pages/StoryReaderPage'
import OnboardingPage from './pages/OnboardingPage'
import ParentDashboard from './pages/ParentDashboard'
import NotFoundPage from './pages/NotFoundPage'
import BottomNav from './components/navigation/BottomNav'
import { ChildInfoBadge } from './components/ChildInfoBadge'
import { ProtectedRoute } from './components/ProtectedRoute'
import { useProfileStore } from './store/profileStore'
import './App.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
})

function RootRedirect() {
  const currentProfile = useProfileStore((state) => state.currentProfile)
  
  // Redirect: geen profiel -> login, wel profiel -> homepage
  return <Navigate to={currentProfile ? '/home' : '/login'} replace />
}

function AppContent() {
  const location = useLocation()
  const isOnboarding = location.pathname === '/onboarding'
  const isHomePage = location.pathname === '/home'
  const isStoryGenerator = location.pathname === '/generate'
  const isLogin = location.pathname === '/login'
  const isParentDashboard = location.pathname === '/parent'

  return (
    <>
        <div className={isOnboarding || isHomePage || isLogin ? 'overflow-x-hidden overflow-y-visible' : isStoryGenerator ? 'overflow-x-hidden overflow-y-hidden h-screen' : 'pb-16 overflow-x-hidden overflow-y-visible'}>
          {/* Child Info Badge - Shows on all pages except login, home, and parent dashboard */}
          {!isLogin && !isHomePage && !isParentDashboard && <ChildInfoBadge />}
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/parent" element={<ParentDashboard />} />
          <Route path="/" element={<RootRedirect />} />
          {/* Protected Routes - Require authentication */}
          <Route path="/home" element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          } />
          <Route path="/onboarding" element={
            <ProtectedRoute>
              <OnboardingPage />
            </ProtectedRoute>
          } />
          <Route path="/generate" element={
            <ProtectedRoute>
              <StoryGeneratorPage />
            </ProtectedRoute>
          } />
            <Route path="/story/:sessionId" element={
              <ProtectedRoute requireSession={true}>
                <StoryReaderPage />
              </ProtectedRoute>
            } />
          {/* 404 - Must be last */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>
      {!isOnboarding && !isHomePage && !isStoryGenerator && !isLogin && !isParentDashboard && <BottomNav />}
    </>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
