import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Signin, Signup } from './authentication';
import Home from './dashboard/Home';
import Resources from './dashboard/Resources';
import ResourceDetail from './dashboard/ResourceDetail';
import ResourceEdit from './dashboard/ResourceEdit';
import ResourceTypes from './dashboard/ResourceTypes';
import ResourcePlatforms from './dashboard/ResourcePlatforms';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Topbar } from './Topbar';

const App = () => {
  return (
    <>
      <Topbar />
      <BrowserRouter>
        <Routes>
          {/* Redirect root to signin */}
          <Route path='/' element={<Navigate to="/signin" replace />} />

          {/* Public routes */}
          <Route path='/signup' element={<Signup />} />
          <Route path='/signin' element={<Signin />} />

          {/* Protected routes */}
          <Route
            path='/home'
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />

          <Route
            path='/resources'
            element={
              <ProtectedRoute>
                <Resources />
              </ProtectedRoute>
            }
          />

          <Route
            path='/resources/:id'
            element={
              <ProtectedRoute>
                <ResourceDetail />
              </ProtectedRoute>
            }
          />

          <Route
            path='/resources/:id/edit'
            element={
              <ProtectedRoute>
                <ResourceEdit />
              </ProtectedRoute>
            }
          />

          <Route
            path='/settings/types'
            element={
              <ProtectedRoute>
                <ResourceTypes />
              </ProtectedRoute>
            }
          />

          <Route
            path='/settings/platforms'
            element={
              <ProtectedRoute>
                <ResourcePlatforms />
              </ProtectedRoute>
            }
          />

          {/* Catch all - redirect to signin */}
          <Route path='*' element={<Navigate to="/signin" replace />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App