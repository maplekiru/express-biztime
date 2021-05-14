const request = require("supertest");
const app = require("./app");
let db = require("./db");


let company1;
let invoice1;

// let item2 = { name: "keyboard", price: 200 }

beforeEach(async function () {
  let cResults = await db.query(`
    INSERT INTO companies (code, name, description)
    VALUES ('apple', 'Apple.Co', 'Original') 
    RETURNING code, name, description;`
  );

  company1 = cResults.rows[0];

  iResults = await db.query(`
    INSERT INTO invoices (comp_code, amt)
    VALUES ('apple', 50) 
    RETURNING id, comp_code, amt, paid, add_date, paid_date`
  );

  invoice1 = iResults.rows[0];

  company1.invoices = [invoice1];
});

afterEach(function () {
  db.query(`DELETE FROM companies`);
  db.query(`DELETE FROM invoices`)
});

describe(" GET /companies", function () {

  it(" GET /companies", async function () {
    const resp = await request(app)
      .get('/companies');
    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual(
      {
        companies: [{
          code: company1.code,
          name: company1.name
        }]
      }
    );
  });


  it(" GET /companies/:code", async function () {
    const resp = await request(app)
      .get('/companies/apple');

    const add_date = company1.invoices[0].add_date.toJSON();
    console.log(company1.invoices[0].add_date);
    console.log("add date:", add_date);
    
    const { code, name, description } = company1;
    const { id, comp_code, paid, paid_date, amt } = company1.invoices[0];
    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual(
      { company: {
          code,
          description,
          name,
          invoices: [{ id, comp_code, paid, paid_date, amt, add_date}]}
      });
  });

});

// "company": Object {
//   "code": "apple",
//     "description": "Original",
//       "invoices": Array[
//         Object {
//     -         "add_date": 2021 - 05 - 13T07: 00: 00.000Z,
//       +         "add_date": "2021-05-13T07:00:00.000Z",
//         "amt": "50.00",
//           "comp_code": "apple",
//             "id": 29,
//               "paid": false,
//                 "paid_date": null,