import api from "./api";

export const getTransactionById = (id) => {
  return api.get(`stock/transactions/${id}`);
};
