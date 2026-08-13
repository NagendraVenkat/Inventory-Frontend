import api from "./api";

export const getDashboardSummary = async (pageNumber = 1, pageSize = 5) => {
  const response = await api.get("/Dashboard/Summary", {
    params: {
      pageNumber,
      pageSize,
    },
  });

  return response.data;
};
