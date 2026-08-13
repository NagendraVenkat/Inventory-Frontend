import api from "./api";

export const getStockOutProducts = async () => {
  const response = await api.get("/products?page=1&pageSize=100");

  return response.data;
};

export const createStockOut = async (payload) => {
  const response = await api.post("/Stock/Out", payload);

  return response.data;
};
