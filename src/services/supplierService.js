import api from "./api";

export const getSuppliers = () => {
  return api.get("/Suppliers", {
    params: {
      page: 1,
      pageSize: 100,
    },
  });
};