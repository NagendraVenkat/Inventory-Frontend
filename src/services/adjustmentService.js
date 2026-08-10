import api from "./api";

export const getAdjustmentProducts = async () => {
  const response = await api.get("/products?page=1&pageSize=100");

  return response.data;
};

export const createStockAdjustment = async (payload) => {
  const response = await api.post("/Stock/Adjust", payload);

  return response.data;
};
