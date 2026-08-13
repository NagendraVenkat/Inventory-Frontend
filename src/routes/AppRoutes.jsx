import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "../pages/Login/Login";
import Register from "../pages/Register/Register";
import ChangePassword from "../pages/ChangePassword/ChangePassword";

import Dashboard from "../pages/Dashboard/Dashboard";
import Products from "../pages/Products/Products";
import Categories from "../pages/Categories/Categories";
import Suppliers from "../pages/Suppliers/Suppliers";
import StockIn from "../pages/StockIn/StockIn";
import StockOut from "../pages/StockOut/StockOut";
import Adjustment from "../pages/Adjustment/StockAdjustment";
import Users from "../pages/Users/Users";
import TransactionDetail from "../pages/TransactionDetail/TransactionDetail";

import DashboardLayout from "../components/layout/DashboardLayout";
import ProtectedRoute from "./ProtectedRoute";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* =========================
            PUBLIC ROUTES
        ========================= */}

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        {/* =========================
            PROTECTED APPLICATION
        ========================= */}

        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            
            {/* =========================
                ADMIN + STAFF + USER
            ========================= */}

            <Route path="/dashboard" element={<Dashboard />} />

            <Route path="/products" element={<Products />} />

            <Route path="/categories" element={<Categories />} />

            <Route path="/suppliers" element={<Suppliers />} />

            <Route
              path="/transactions/:id"
              element={<TransactionDetail />}
            />

            <Route
              path="/change-password"
              element={<ChangePassword />}
            />

            {/* =========================
                ADMIN + STAFF
            ========================= */}

            <Route
              element={
                <ProtectedRoute allowedRoles={["Admin", "Staff"]} />
              }
            >
              <Route path="/stockin" element={<StockIn />} />

              <Route path="/stockout" element={<StockOut />} />
            </Route>

            {/* =========================
                ADMIN ONLY
            ========================= */}

            <Route
              element={
                <ProtectedRoute allowedRoles={["Admin"]} />
              }
            >
              <Route
                path="/adjustment"
                element={<Adjustment />}
              />

              <Route
                path="/users"
                element={<Users />}
              />
            </Route>

          </Route>
        </Route>

        {/* =========================
            DEFAULT ROUTE
        ========================= */}

        <Route
          path="/"
          element={<Navigate to="/login" replace />}
        />

        {/* =========================
            OPTIONAL 404 REDIRECT
        ========================= */}

        <Route
          path="*"
          element={<Navigate to="/login" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;