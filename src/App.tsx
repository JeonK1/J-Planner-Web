import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { RootLayout } from '@/components/layout/RootLayout'
import { ErrorBoundary } from '@/components/ErrorBoundary'

const EntryPage = lazy(() =>
  import('@/pages/EntryPage').then((m) => ({ default: m.EntryPage })),
)
const CreatePlanPage = lazy(() =>
  import('@/pages/CreatePlanPage').then((m) => ({ default: m.CreatePlanPage })),
)
const PlanPage = lazy(() =>
  import('@/pages/PlanPage').then((m) => ({ default: m.PlanPage })),
)
const NotFoundPage = lazy(() =>
  import('@/pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })),
)

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Suspense
          fallback={
            <div className="flex h-screen items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
            </div>
          }
        >
          <Routes>
            <Route element={<RootLayout />}>
              <Route path="/" element={<EntryPage />} />
              <Route path="/create" element={<CreatePlanPage />} />
              <Route path="/plan/:planId" element={<PlanPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App
