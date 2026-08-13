import api from "./api";

// Get products and suppliers required for Stock In screen
export const getStockInInitialData = async () => {
  const [productsResponse, suppliersResponse] = await Promise.all([
    api.get("/products?page=1&pageSize=100"),
    api.get("/Suppliers?page=1&pageSize=100"),
  ]);

  return {
    products: productsResponse.data,
    suppliers: suppliersResponse.data,
  };
};

// Create Stock In transaction
export const createStockIn = async (payload) => {
  const response = await api.post("/stock/in", payload);

  return response.data;
};
