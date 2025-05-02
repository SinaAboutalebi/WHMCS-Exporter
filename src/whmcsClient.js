const axios = require("axios");
require("dotenv").config();

const baseParams = {
  identifier: process.env.WHMCS_IDENTIFIER,
  secret: process.env.WHMCS_SECRET,
  responsetype: "json",
};

const api = axios.create({
  baseURL: process.env.WHMCS_API_URL,
  method: "POST",
  headers: {
    "Content-Type": "application/x-www-form-urlencoded",
  },
  auth: {
    username: process.env.BASIC_AUTH_USER,
    password: process.env.BASIC_AUTH_PASS,
  },
});

async function callWhmcsApi(action, params = {}) {
  const payload = new URLSearchParams({ ...baseParams, action, ...params });
  const response = await api.post("", payload);
  return response.data;
}

module.exports = {
  getStats: (params = {}) => callWhmcsApi("GetStats", params),
  getOrdersStatuses: (params = {}) => callWhmcsApi("GetOrderStatuses", params),
  getSupportDepartments: (params = {}) => callWhmcsApi("GetSupportDepartments", params),
  getStaffOnline: (params = {}) => callWhmcsApi("GetStaffOnline", params),
  getDomains: (params = {}) => callWhmcsApi("GetClientsDomains", params),
  getProducts: (params = {}) => callWhmcsApi("GetClientsProducts", params),
  getClients: (params = {}) => callWhmcsApi("GetClients", params),
  getInvoices: (params = {}) => callWhmcsApi("GetInvoices", params),
};
