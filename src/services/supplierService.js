import api from "./api";

export const getSuppliers = async (
  search = "",
  page = 1,
  pageSize = 100
) => {
  const response = await api.get("/suppliers", {
    params: {
      search,
      page,
      pageSize,
    },
  });

  return response.data;
};

export const getSupplierById = async (id) => {
  const response = await api.get(`/suppliers/${id}`);
  return response.data;
};

export const createSupplier = async (supplier) => {
  const response = await api.post("/suppliers", supplier);
  return response.data;
};

export const updateSupplier = async (id, supplier) => {
  const response = await api.put(`/suppliers/${id}`, supplier);
  return response.data;
};

export const deleteSupplier = async (id) => {
  const response = await api.delete(`/suppliers/${id}`);
  return response.data;
};

export const activateSupplier = async (id) => {
  const response = await api.patch(`/suppliers/${id}/activate`);
  return response.data;
};