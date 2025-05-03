const client = require("prom-client");
const {
  getStats,
  getOrdersStatuses,
  getSupportDepartments,
  getStaffOnline,
  getDomains,
  getProducts,
  getClients,
  getInvoices,
} = require("./whmcsClient");

const Registry = client.Registry;
const register = new Registry();

// ==============================
// Metrics Definition
// ==============================
const metrics = {
  // ----- Financial Stats -----
  incomeToday: new client.Gauge({
    name: "whmcs_income_today",
    help: "Income today",
  }),
  incomeThisMonth: new client.Gauge({
    name: "whmcs_income_this_month",
    help: "Income this month",
  }),
  incomeThisYear: new client.Gauge({
    name: "whmcs_income_this_year",
    help: "Income this year",
  }),
  incomeAllTime: new client.Gauge({
    name: "whmcs_income_all_time",
    help: "Income all time",
  }),

  // ----- Ticket Stats -----
  openTickets: new client.Gauge({
    name: "whmcs_open_tickets",
    help: "Number of open tickets",
  }),
  customerReply: new client.Gauge({
    name: "whmcs_customer_replies",
    help: "Number of customer replies",
  }),
  assignedTickets: new client.Gauge({
    name: "whmcs_assigned_tickets",
    help: "Number of assigned tickets",
  }),
  inProgress: new client.Gauge({
    name: "whmcs_in_progress_tickets",
    help: "Number of tickets in progress",
  }),
  onHold: new client.Gauge({
    name: "whmcs_on_hold_tickets",
    help: "Number of tickets on hold",
  }),
  awaitingReply: new client.Gauge({
    name: "whmcs_awaiting_reply_tickets",
    help: "Number of awaiting reply tickets",
  }),

  // ----- Staff Stats -----
  staffOnline: new client.Gauge({
    name: "whmcs_staff_online",
    help: "Online staff members",
    labelNames: ["staff_name"],
  }),

  // ----- Department Tickets Stats -----
  departmentsAwaitingReply: new client.Gauge({
    name: "whmcs_departments_awaiting_reply_tickets",
    help: "Number of tickets awaiting reply in each department",
    labelNames: ["department_name"],
  }),

  // ----- Orders Stats -----
  orderStatuse: new client.Gauge({
    name: "whmcs_order_statuses",
    help: "Number of orders in each status",
    labelNames: ["status_name"],
  }),
  cancelationPending: new client.Gauge({
    name: "whmcs_order_cancelation_pending",
    help: "Number of orders pending cancelation",
  }),

  // ----- Domain & Product Stats -----
  domainsCount: new client.Gauge({
    name: "whmcs_domains_count",
    help: "Number of domains",
  }),
  productsCount: new client.Gauge({
    name: "whmcs_products_count",
    help: "Number of products",
  }),

  // ----- Clients Stats -----
  clientsCount: new client.Gauge({
    name: "whmcs_clients_count",
    help: "Number of clients",
    labelNames: ["status_name"],
  }),

  // ----- Invoice Stats -----
  invoiceStatuses: new client.Gauge({
    name: "whmcs_invoice_statuses",
    help: "Number of invoices in each status",
    labelNames: ["status_name"],
  }),
};

// ==============================
// Register All Metrics
// ==============================
Object.values(metrics).forEach((metric) => register.registerMetric(metric));

// ==============================
// Utility Function
// ==============================
function parseCurrencyToNumber(input) {
  return parseInt(String(input).replace(/[^0-9]/g, ""), 10);
}

// ==============================
// Metrics Collection Function
// ==============================
async function collectMetrics() {
  try {
    // ----- Collect Financial Stats -----
    const totalStats = await getStats();
    metrics.incomeToday.set(parseCurrencyToNumber(totalStats.income_today));
    metrics.incomeThisMonth.set(parseCurrencyToNumber(totalStats.income_thismonth));
    metrics.incomeThisYear.set(parseCurrencyToNumber(totalStats.income_thisyear));
    metrics.incomeAllTime.set(parseCurrencyToNumber(totalStats.income_alltime));

    // ----- Collect Ticket Stats -----
    metrics.openTickets.set(parseInt(totalStats.tickets_open));
    metrics.customerReply.set(parseInt(totalStats.tickets_customerreply));
    metrics.assignedTickets.set(parseInt(totalStats.tickets_assigned));
    metrics.inProgress.set(parseInt(totalStats.tickets_inprogress));
    metrics.onHold.set(parseInt(totalStats.tickets_onhold));
    metrics.awaitingReply.set(parseInt(totalStats.tickets_awaitingreply));
    metrics.cancelationPending.set(parseInt(totalStats.cancellations_pending));

    // ----- Collect Orders Stats -----
    const ordersStats = await getOrdersStatuses();
    ordersStats.statuses.status.forEach((status) => {
      metrics.orderStatuse.set({ status_name: status.title }, parseInt(status.count));
    });

    // ----- Collect Department Stats -----
    const supportDepartmentsStats = await getSupportDepartments();
    supportDepartmentsStats.departments.department.forEach((department) => {
      metrics.departmentsAwaitingReply.set(
        { department_name: department.name },
        parseInt(department.awaitingreply)
      );
    });

    // ----- Collect Staff Stats -----
    const staffOnlineStats = await getStaffOnline();
    metrics.staffOnline.reset();
    staffOnlineStats.staffonline.staff.forEach((staff) => {
      metrics.staffOnline.set({ staff_name: staff.adminusername }, 1);
    });

    // ----- Collect Domains and Products Stats -----
    const domainsStat = await getDomains({ limitnum: 1 });
    metrics.domainsCount.set(parseInt(domainsStat.totalresults) || 0);

    const productsStat = await getProducts({ limitnum: 1 });
    metrics.productsCount.set(parseInt(productsStat.totalresults) || 0);

    // ----- Collect Client Stats -----
    const clientStatuses = [
      { label: "Total", params: { limitnum: 1 } },
      { label: "Active", params: { limitnum: 1, status: "Active" } },
      { label: "Inactive", params: { limitnum: 1, status: "InActive" } },
      { label: "Closed", params: { limitnum: 1, status: "Closed" } },
    ];
    metrics.clientsCount.reset();
    for (const { label, params } of clientStatuses) {
      const result = await getClients(params);
      metrics.clientsCount.set(
        { status_name: label },
        parseInt(result.totalresults) || 0
      );
    }

    // ----- Collect Invoice Stats -----
    const invoiceStatuses = [
      "Paid",
      "Draft",
      "Unpaid",
      "Overdue",
      "Cancelled",
      "Refunded",
      "Collections",
    ];
    metrics.invoiceStatuses.reset();
    for (const status of invoiceStatuses) {
      const invoiceStat = await getInvoices({ limitnum: 1, status });
      metrics.invoiceStatuses.set(
        { status_name: status },
        parseInt(invoiceStat.totalresults) || 0
      );
    }
  } catch (err) {
    console.error("[🔴] Error collecting metrics:", err.message);
  }
}

// ==============================
// Exports
// ==============================
module.exports = {
  register,
  collectMetrics,
};
