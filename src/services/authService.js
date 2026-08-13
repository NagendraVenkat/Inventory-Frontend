import api from "./api";

export const login = async (loginData) => {
  const response = await api.post("/Auth/login", loginData);
  return response.data;
};

export const logout = async () => {
  const response = await api.post("/Auth/logout");
  return response.data;
export const login = async (email, password) => {
    const response = await api.post("/Auth/login", {
        email,
        password,
    });

    return response.data;
};