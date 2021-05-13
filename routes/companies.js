const express = require("express");
const db = require("../db");
const { NotFoundError, BadRequestError } = require("../expressError");

const router = new express.Router();

/** GET /companies: get list of companies RETURN JSON {companies: [{code, name}, ...]} */

router.get("/", async function (req, res, next) {

  let results = await db.query('SELECT code, name FROM companies');
  let companies = results.rows;

  return res.json({ companies })
});

/** GET /companies/:code : get a single company 
 * RETURN JSON {company: {code, name, and description}} */

router.get("/:code", async function (req, res, next) {

  let code = req.params.code;

  let results = await db.query(`SELECT code, name description 
    FROM companies 
    WHERE code = $1`, 
    [code]);

  let company = results.rows[0];

  if (company) return res.json({ company });
  throw new NotFoundError;
});

/** POST /companies : create a single company in the database
 *  RETURN JSON {company:{code, name, and description}} */


router.post("/", async function (req, res, next) {

  let code = req.body.code;
  let name = req.body.name;
  let description = req.body.description;

  if (!code || !name || !description) throw new BadRequestError(
    `Please include code, name and description in request`);

  let results = await db.query(`INSERT INTO companies (code, name, description)
  VALUES ($1, $2, $3) 
  RETURNING code, name, description`, 
  [code, name, description]);

  let company = results.rows[0];

  return res.status(201).json({ company });
});

/** DELETE /users/[id]: delete user, return {message: Deleted} */

router.delete("/:id", function (req, res, next) {
  db.User.delete(req.params.id);
  return res.json({ message: "Deleted" });
});


module.exports = router;