import api from "./api";

export const getTransactionById = (id) => {
  return api.get(`/transactions/${id}`);
};
