const inquirer = require("inquirer");
const mysql = require("mysql");
let tables = require("./tables.js");

const db = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "password",
  database: "bamazon"
});

db.connect(err => {
  if (err) throw err;
  console.log("You're now connected to database");
  getAll();
});

const getAll = () => {

  db.query("SELECT * FROM products", (err, res) => {
    if (err) throw err;
    for (i = 0; i < res.length; i++) {
      const data = res[i];
      tables.makeTable.prodList.push([data.item_id, data.product_name, data.department_name, data.price, data.stock_quantity]);
    }
    console.log(tables.makeTable.prodList.toString());
    startPrompt()
  });
}

function startPrompt() {

  inquirer.prompt([
    {
      type: "input",
      name: "itemId",
      message: "What is the ID of the Item you would like to buy?",
      default: "1-10",
      validate: function (idNumber) {
        if (!isNaN(idNumber)) {
          return true;
          parseFloat(idNumber);
        }
        else {
          return false;
        }
      }
    },
    {
      type: "input",
      name: "unitsNumbers",
      message: "How many units would you like to buy?",
      default: "1",
      validate: function (unitsNumber) {
        if (!isNaN(unitsNumber)) {
          return true;
          parseFloat(unitsNumber);
        }
        else {
          return false;
        }
      }
    },
  ]).then(userResponse => {
    getQuantity(userResponse.itemId, userResponse.unitsNumbers)
  })
}


function getQuantity(item, unitsNumbers) {
  var query = db.query("SELECT * FROM products WHERE item_id = ?", [
    parseFloat(item)
  ], (err, res) => {

    if (err) throw err;
    let customerCost;
    if (res[0].stock_quantity > parseFloat(unitsNumbers)) {
      customerCost = parseFloat(res[0].price) * parseFloat(parseFloat(unitsNumbers));
      secondPrompt(res, customerCost, unitsNumbers, item);
    } else {
      // Alert not enough
    }
  })
}

function secondPrompt(res, customerCost, unitsNumbers, item) {

  inquirer.prompt([
    {
      type: "confirm",
      name: "confirm",
      message: `Would you like to purchase ${parseFloat(unitsNumbers)} ${res[0].product_name} for ${customerCost} dollars?`
    }
  ]).then(updatedtable => {
    if (updatedtable.confirm) {
      if (parseFloat(parseFloat(unitsNumbers)) <= parseFloat(res[0].stock_quantity)) {
        response = "Purchase has been made. Order Processed";
        const updatedstock = parseFloat(res[0].stock_quantity) - parseFloat(parseFloat(unitsNumbers));
        let query = db.query("UPDATE products SET ? WHERE ?", [{
          stock_quantity: updatedstock
        },
        {
          item_id: parseFloat(item)
        }
        ], (err, res) => {
          if (err) throw err;
          startOver()
        })
      }
      else {
        console.log("Insufficient Quantity");
      }
    } else {
      // process.end();
    }
  })

}

const startOver = () => {
  db.query("SELECT * FROM products", (err, res) => {
    if (err) throw err;
    for (i = 0; i < res.length; i++) {
      const data = res[i];
      //empty prod list (array.splice)
      tables.makeTable.prodListUpdated.push([data.item_id, data.product_name, data.department_name, data.price, data.stock_quantity]);
    }
    console.log(tables.makeTable.prodListUpdated.toString());
  });
}
