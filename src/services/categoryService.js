import api from "./api";

export const getCategories = async (
  search = "",
  page = 1,
  pageSize = 100
) => {
  const response = await api.get("/categories", {
    params: {
      search,
      page,
      pageSize,
    },
  });

  return response.data;
};

export const getCategoryById = async (id) => {
  const response = await api.get(`/categories/${id}`);
  return response.data;
};

export const createCategory = async (category) => {
  const response = await api.post("/categories", category);
  return response.data;
};

export const updateCategory = async (id, category) => {
  const response = await api.put(`/categories/${id}`, category);
  return response.data;
};

export const deleteCategory = async (id) => {
  const response = await api.delete(`/categories/${id}`);
  return response.data;
};

export const activateCategory = async (id) => {
  const response = await api.patch(`/categories/${id}/activate`);
  return response.data;
};