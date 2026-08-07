import { BrowserRouter, Routes, Route } from "react-router-dom";

import DashboardLayout from "../components/layout/DashboardLayout";

import Login from "../pages/Login/Login";
import Dashboard from "../pages/Dashboard/Dashboard";
import Categories from "../pages/Categories/Categories";
import Suppliers from "../pages/Suppliers/Suppliers";
import Products from "../pages/Products/Products";
import StockIn from "../pages/StockIn/StockIn";
import StockOut from "../pages/StockOut/StockOut";
import Adjustment from "../pages/Adjustment/Adjustment";
import Users from "../pages/Users/Users";
import TransactionDetail from "../pages/TransactionDetail/TransactionDetail";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Login Page */}
        <Route path="/" element={<Login />} />

        {/* Pages with Sidebar + Navbar */}
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/products" element={<Products />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/suppliers" element={<Suppliers />} />
          <Route path="/stockin" element={<StockIn />} />
          <Route path="/stockout" element={<StockOut />} />
          <Route path="/adjustment" element={<Adjustment />} />
          <Route path="/users" element={<Users />} />
          <Route path="/transactions/:id" element={<TransactionDetail />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
