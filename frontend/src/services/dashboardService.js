import { api, apiGet, getData, publicGet } from "./api";

export const dashboardService = {
  dashboard: () => getData(apiGet("/dashboard")),
  reports: () => getData(apiGet("/reports")),
  fines: () => getData(apiGet("/fines")),
  activity: () => getData(apiGet("/activity-logs")),
  health: () => getData(publicGet("/health")),
  apiHealth: () => getData(apiGet("/health")),
  welcome: () => getData(publicGet("/")),
};
