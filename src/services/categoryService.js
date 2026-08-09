import api from "./api";

export const getCategories = () => {
  return api.get("/Categories", {
    params: {
      page: 1,
      pageSize: 100,
    },
  });
};