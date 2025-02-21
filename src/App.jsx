import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import ActiveDenials from './components/ActiveDenials'
import AppealsInProgress from './components/AppealsInProgress'
import './App.css'

// Placeholder component for routes
const PageContent = ({ title }) => (
  <main className="p-6">
    <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
      {title}
    </h1>
    <p className="mt-2 text-gray-600 dark:text-gray-300">
      Content for {title} page
    </p>
  </main>
);

function App() {
  const [isMobile, setIsMobile] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
      setIsSidebarOpen(window.innerWidth >= 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)

    return () => {
      window.removeEventListener('resize', checkMobile)
    }
  }, [])

  return (
    <Router>
      <div className="fixed inset-0 bg-white dark:bg-gray-900">
        <Sidebar
          isMobile={isMobile}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Main Content */}
        <div className={`h-full transition-all duration-300 ease-in-out overflow-auto
                      ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
          {/* Mobile Menu Button */}
          {isMobile && !isSidebarOpen && (
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="fixed top-4 left-4 z-50 p-2 rounded-md bg-white dark:bg-gray-800 shadow-lg"
            >
              <svg
                className="w-6 h-6 text-gray-600 dark:text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          )}

          {/* Routes */}
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<PageContent title="Denial Overview" />} />
            <Route path="/active-denials" element={<ActiveDenials />} />
            <Route path="/appeals" element={<AppealsInProgress />} />
            <Route path="/new-appeal" element={<PageContent title="New Appeal" />} />
            <Route path="/bulk-resubmit" element={<PageContent title="Bulk Resubmit" />} />
            <Route path="/trends" element={<PageContent title="Trends" />} />
            <Route path="/financial-impact" element={<PageContent title="Financial Impact" />} />
            <Route path="/appeal-letters" element={<PageContent title="Appeal Letters" />} />
            <Route path="/clinical-evidence" element={<PageContent title="Clinical Evidence" />} />
            <Route path="/coding-reference" element={<PageContent title="Coding Reference" />} />
            <Route path="/ehr-integration" element={<PageContent title="EHR Patient Chart" />} />
            <Route path="/billing-integration" element={<PageContent title="Billing System" />} />
            <Route path="/user-assignments" element={<PageContent title="User Assignments" />} />
            <Route path="/audit-logs" element={<PageContent title="Audit Logs" />} />
            <Route path="/settings" element={<PageContent title="Settings" />} />
          </Routes>
        </div>
      </div>
    </Router>
  )
}

export default App
