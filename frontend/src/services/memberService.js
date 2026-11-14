import { api, apiGet, getData } from "./api";

export const memberService = {
  list: () => getData(apiGet("/members")),
  get: (id) => getData(apiGet(`/members/${id}`)),
  create: (member) => getData(api.post("/members", member)),
  update: (id, member) => getData(api.put(`/members/${id}`, member)),
  remove: (id) => getData(api.delete(`/members/${id}`)),
  history: (id) => getData(apiGet(`/members/${id}/history`)),
};
