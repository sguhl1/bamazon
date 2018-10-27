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
  startprompt();
});

const startprompt = () => {
  inquirer.prompt([
    {
      type: "list",
      name: "todos",
      message: "What would you like to do?",
      choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product"]
    }]).then(userResponse => {
      switch (userResponse.todos) {
        case "View Products for Sale":
          displayProducts();
          break;
        case "View Low Inventory":
          viewLowInv();
          break;
        case "Add to Inventory":
          addInv();
          break;
        case "Add New Product":
          addNewProd();
          break;
      }
    });
};
const displayProducts = () => {
  db.query("SELECT * FROM products", (err, res) => {
    if (err) throw err;
    for (i = 0; i < res.length; i++) {
      const data = res[i];
      tables.makeTable.prodList.push([data.item_id, data.product_name, data.department_name, data.price, data.stock_quantity]);
    }
    console.log("\n" + tables.makeTable.prodList.toString());
    startprompt();
  });
  
};
const viewLowInv = () => {
  db.query("SELECT * FROM products", (err, res) => {
    if (err) throw err;
    for (i = 0; i < res.length; i++) {
      const data = res[i];
      if (data.stock_quantity < 5) {
        tables.makeTable.lowInv.push([data.item_id, data.product_name, data.department_name, data.price, data.stock_quantity]);
      }
      ;
    }
    console.log("\n" + tables.makeTable.lowInv.toString());
    startprompt();
  });
};
const addInv = () => {
  db.query("SELECT * FROM products", (err, res) => {
    if (err) throw err;
    for (i = 0; i < res.length; i++) {
      const data = res[i];
      tables.makeTable.prodList.push([data.item_id, data.product_name, data.department_name, data.price, data.stock_quantity]);
    }
    console.log("\n" + tables.makeTable.prodList.toString());
    inquirer.prompt([
      {
        type: "input",
        name: "itemId",
        message: "What is the ID of the Item you would like to adjust?",
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
        message: "How many units should the store purchase?",
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


      var query = db.query("SELECT * FROM products WHERE item_id = ?", [
        parseFloat(userResponse.itemId)
      ], (err, res) => {

        if (err) throw err;
        const updatedstock = parseFloat(res[0].stock_quantity) + parseFloat(parseFloat(userResponse.unitsNumbers));
        let query = db.query("UPDATE products SET ? WHERE ?", [{
          stock_quantity: updatedstock
        },
        {
          item_id: parseFloat(userResponse.itemId)
        }
        ], (err, res) => {

          if (err) throw err;
          for (i = 0; i < res.length; i++) {
            const data = res[i];
            tables.makeTable.prodList.push([data.item_id, data.product_name, data.department_name, data.price, data.stock_quantity])
              ;
          }
          console.log(" \n" + tables.makeTable.prodList.toString());
          startprompt();
        }

        )
      });
    })
  });
  
};
const addNewProd = () => {
  inquirer.prompt([
    {
      name: "newItem",
      type: "input",
      message: "Enter the name of the new product"
    },
    {
      name: "newDept",
      type: "input",
      message: "Enter the department name of the new product"
    },
    {
      name: "newPrice",
      type: "input",
      message: "Enter the price for the new product"
    },
    {
      name: "stock",
      type: "input",
      message: "How many of the new item should the store stock?"
    }
  ]).then(userResponse => {
    let query = db.query("INSERT INTO products SET ?", [{
      product_name: userResponse.newItem,
      department_name: userResponse.newDept,
      price: userResponse.newPrice,
      stock_quantity: userResponse.stock
    }
    ], (err, res) => {

      if (err) throw err;
      for (i = 0; i < res.length; i++) {
        const data = res[i];
        tables.makeTable.prodList.push([data.item_id, data.product_name, data.department_name, data.price, data.stock_quantity]);
      }
      console.log("\n" + tables.makeTable.prodList.toString());
      startprompt();

    }
    )
  })
  
}