import api from "./api";

// Get all categories
export const getCategories = async (search = "", page = 1, pageSize = 10) => {
  console.log("Calling Categories API...");

  const response = await api.get("/categories", {
    params: {
      search,
      page,
      pageSize,
    },
  });

  console.log(response.data);

  return response.data;
};

// Get category by Id
export const getCategoryById = async (id) => {
  const response = await api.get(`/categories/${id}`);
  return response.data;
};

// Create category
export const createCategory = async (category) => {
  const response = await api.post("/categories", category);
  return response.data;
};

// Update category
export const updateCategory = async (id, category) => {
  const response = await api.put(`/categories/${id}`, category);
  return response.data;
};

// Delete (Deactivate) category
export const deleteCategory = async (id) => {
  const response = await api.delete(`/categories/${id}`);
  return response.data;
};