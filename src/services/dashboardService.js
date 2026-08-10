import api from "./api";

export const getDashboardSummary = async () => {
  const response = await api.get("/Dashboard/Summary");

  return response.data;
};
