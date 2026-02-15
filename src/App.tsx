import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { RootLayout } from '@/components/layout/RootLayout'
import { EntryPage } from '@/pages/EntryPage'
import { CreatePlanPage } from '@/pages/CreatePlanPage'
import { PlanPage } from '@/pages/PlanPage'
import { NotFoundPage } from '@/pages/NotFoundPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<RootLayout />}>
          <Route path="/" element={<EntryPage />} />
          <Route path="/create" element={<CreatePlanPage />} />
          <Route path="/plan/:planId" element={<PlanPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
