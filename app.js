/** BizTime express application. */

const express = require("express");
const { NotFoundError } = require("./expressError");

/** import routes */
const companyRoutes = require("./routes/companies");
const invoiceRoutes = require("./routes/invoices");

const app = express();

app.use(express.json());

// TODO:
// - Create companies route and router
// - Add routes in routes/companies.js (returns JSON)
  // - Make sure to add error logic
  // - Make sure to set 201 when using POST
  // - Make sure to use SQL "sanitize"
// Add Docstrings
// check exports and imports


/** when accessing /companies resources, use companyRoutes router */
app.use('/companies', companyRoutes);

/** when accessing /companies resources, use companyRoutes router */
app.use('/invoices', invoiceRoutes);


/** 404 handler: matches unmatched routes; raises NotFoundError. */
app.use(function (req, res, next) {
  return next(new NotFoundError());
});

/** Error handler: logs stacktrace and returns JSON error message. */
app.use(function (err, req, res, next) {
  const status = err.status || 500;
  const message = err.message;
  if (process.env.NODE_ENV !== "test") console.error(status, err.stack);
  return res.status(status).json({ error: { message, status } });
});



module.exports = app;
