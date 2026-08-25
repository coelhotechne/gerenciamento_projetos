import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import RequirePermission from "./routes/RequirePermission";
import { PERMISSIONS } from "./auth/permissions";
import DashboardLayout from "./layouts/DashboardLayout";
import Login from "./pages/Login";
import Overview from "./pages/Overview";
import Applications from "./pages/Applications";
import UsersPermissions from "./pages/UsersPermissions";
import Subscriptions from "./pages/Subscriptions";
import Monitoring from "./pages/Monitoring";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Overview />} />
            <Route path="aplicacoes" element={<Applications />} />
            <Route
              path="usuarios"
              element={
                <RequirePermission permission={PERMISSIONS.USERS_VIEW}>
                  <UsersPermissions />
                </RequirePermission>
              }
            />
            <Route
              path="assinaturas"
              element={
                <RequirePermission permission={PERMISSIONS.BILLING_VIEW}>
                  <Subscriptions />
                </RequirePermission>
              }
            />
            <Route path="monitoramento" element={<Monitoring />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
