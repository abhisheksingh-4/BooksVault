import { api, apiGet, getData } from "./api";

const endpoint = (resource) => `/${resource}`;

export const catalogService = {
  list: (resource) => getData(apiGet(endpoint(resource))),
  create: (resource, payload) => getData(api.post(endpoint(resource), payload)),
  update: (resource, id, payload) => getData(api.put(`${endpoint(resource)}/${id}`, payload)),
  remove: (resource, id) => getData(api.delete(`${endpoint(resource)}/${id}`)),
};
