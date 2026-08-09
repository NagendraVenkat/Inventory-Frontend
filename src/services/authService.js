import api from "./api";

export const login = (loginData) => {
  return api.post("/Auth/login", loginData);
};

export const register = (registerData) => {
  return api.post("/Auth/register", registerData);
};

export const logout = () => {
  return api.post("/Auth/logout");
};