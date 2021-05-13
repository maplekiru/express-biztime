const express = require("express");
const db = require("../db");
const { NotFoundError, BadRequestError } = require("../expressError");

const router = new express.Router();
/** GET /companies: get list of companies RETURN JSON {companies: [{code, name}, ...]} */
router.get("/", async function (req, res, next) {

  const results = await db.query(`
    SELECT code, 
    name FROM companies
    ORDER BY code`);
  const companies = results.rows;

  return res.json({ companies });
});

/** GET /companies/:code : get a single company 
 * RETURN JSON {company: {code, name, and description}} */
router.get("/:code", async function (req, res, next) {

  const code = req.params.code
  const results = await db.query(`
    SELECT code, name description 
    FROM companies 
    WHERE code = $1`,
  [code]);

  const company = results.rows[0];

  if (!company) throw new NotFoundError(`not found: ${code}`)
  return res.json({ company });
});

/** POST /companies : create and add single company in the database
 *  RETURN JSON {company:{code, name, and description}} */
router.post("/", async function (req, res, next) {

  const {code, name, description} = req.body
  if (!code || !name || description === undefined) throw new BadRequestError(
    `Invalid company code, name, or description`);

  const results = await db.query(`
    INSERT INTO companies (code, name, description)
    VALUES ($1, $2, $3) 
    RETURNING code, name, description`,
  [code, name, description]);

  const company = results.rows[0];

  return res.status(201).json({ company });
});

/** PUT /companies/:code : update a single company in the database
 *  RETURN JSON {company:{code, name, and description}} */
router.put("/:code", async function (req, res, next) {
  const {name, description} = req.body
  const code = req.params.code;
 
  if (!name || !description) throw new BadRequestError(
    `Please include name and description in request`);
  const results = await db.query(`
    UPDATE companies SET name = $1,
    description = $2
    WHERE code = $3
    RETURNING code, name, description`,
  [name, description, code]);

  const company = results.rows[0];
  console.log(`results are `, results, `company is `, company)

  if (!company) throw new NotFoundError(`not found: ${code} - update failed.`)

  return res.status(200).json({ company });
});

/** DELETE /company/:id delete company 
 * RETURN JSON {status: Deleted} */
router.delete("/:code", async function (req, res, next) {
  const code = req.params.code;
  const results = await db.query(`
    DELETE FROM companies 
    WHERE code = $1
    RETURNING code`,
  [code]);
  const company = results.rows[0];
  
  if (!company) throw new NotFoundError(`not found: ${code}`);
  return res.json({ status: "Deleted" });
});


module.exports = router;