const express = require("express");
const db = require("../db");
const { NotFoundError, BadRequestError } = require("../expressError");

const router = new express.Router();

/** GET /invoices: get list of invoices 
 * RETURN JSON {invoices: [{id, comp_id}, ...]} */
router.get("/", async function (req, res, next) {

  const results = await db.query(`
    SELECT id, comp_code
    FROM invoices
    ORDER BY id`);

  const invoices = results.rows;

  return res.json({ invoices });
});


/** GET /invoices/:id : get a single invoice 
 * RETURN JSON {invoice: {id, amt, paid, add_date, paid_date},
 * company: {code, name, description}} */
 router.get("/:id", async function (req, res, next) {

  const id = req.params.id;

  const iResults = await db.query(`
    SELECT id, amt, paid, add_date, paid_date
    FROM invoices 
    WHERE id = $1`,
  [id]);

  const cResults = await db.query(`
    SELECT code, name, description
    FROM companies as c
    JOIN invoices as i on c.code = i.comp_code 
    WHERE i.id = $1`,
  [id]);

  const invoice = iResults.rows[0];
  const company = cResults.rows[0];

  if (!invoice) throw new NotFoundError(`not found: ${id}`);

  invoice.company = company;

  return res.json({ invoice });
});

/** POST /invoices : create and add single invoice in the database
 *  RETURN JSON {invoice: {id, comp_code, amt, paid, add_date, paid_date}} */
router.post("/", async function (req, res, next) {

  const {comp_code, amt} = req.body;
  if (!comp_code || !amt) throw new BadRequestError(
    `Invalid input: comp_code or amt`);

  const results = await db.query(`
    INSERT INTO invoices (comp_code, amt)
    VALUES ($1, $2) 
    RETURNING id, comp_code, amt, paid, add_date, paid_date`,
  [comp_code, amt]);

  const invoice = results.rows[0];

  return res.status(201).json({ invoice });
});

/** PUT /invoices/:id : update a single invoice in the database
 *  RETURN JSON {invoice: {id, comp_code, amt, paid, add_date, paid_date}} */
router.put("/:id", async function (req, res, next) {
  const {amt} = req.body;
  const id = req.params.id;
 
  if (!amt) throw new BadRequestError(
    `Invalid input: amt`);

  const results = await db.query(`
    UPDATE invoices SET amt = $1
    WHERE id = $2
    RETURNING id, comp_code, amt, paid, add_date, paid_date`,
  [amt, id]);

  const invoice = results.rows[0];

  if (!invoice) throw new NotFoundError(`not found: ${id}`);

  return res.json({ invoice });
});

/** DELETE /invoice/:id delete invoice 
 * RETURN JSON {status: deleted} */
router.delete("/:id", async function (req, res, next) {
  const id = req.params.id;

  const results = await db.query(`
    DELETE FROM invoices 
    WHERE id = $1
    RETURNING id`,
  [id]);
  const invoice = results.rows[0];
  
  if (!invoice) throw new NotFoundError(`not found: ${id}`);
  return res.json({ status: "deleted" });
});

module.exports = router;