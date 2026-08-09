import api from "./api";

export const getProducts = ({
  search = "",
  categoryId = "",
  page = 1,
  pageSize = 10,
} = {}) => {
  return api.get("/products", {
    params: {
      search,
      categoryId: categoryId || undefined,
      page,
      pageSize,
    },
  });
};

export const createProduct = (productData) => {
  return api.post("/products", productData);
};

export const getProductById = (id) => {
  return api.get(`/products/${id}`);
};

export const updateProduct = (id, productData) => {
  return api.put(`/products/${id}`, productData);
};

export const deactivateProduct = (id) => {
  return api.delete(`/products/${id}`);
};