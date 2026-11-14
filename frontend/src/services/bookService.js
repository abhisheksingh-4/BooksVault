import { api, apiGet, getData } from "./api";

export const bookService = {
  list: (params) => getData(apiGet("/books", { params })),
  get: (id) => getData(apiGet(`/books/${id}`)),
  create: (book) => getData(api.post("/books", book)),
  update: (id, book) => getData(api.put(`/books/${id}`, book)),
  remove: (id) => getData(api.delete(`/books/${id}`)),
  issue: (id, payload) => getData(api.post(`/books/${id}/issue`, payload)),
  returnBook: (id, payload) => getData(api.post(`/books/${id}/return`, payload)),
};
