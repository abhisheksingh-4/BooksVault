import { api, apiGet, getData } from "./api";

export const authService = {
  login: (credentials) => getData(api.post("/auth/login", credentials)),
  listUsers: () => getData(apiGet("/users")),
  createUser: (user) => getData(api.post("/users", user)),
  updateUserRole: (userId, role) => getData(api.put(`/users/${userId}/role`, { role })),
  listRoles: () => getData(apiGet("/roles")),
};
