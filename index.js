const cTable = require("console.table");
const env = require("dotenv").config();
const inquirer = require("inquirer");
const mysql = require("mysql2");

const db = mysql.createConnection(
  {
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    user: process.env.DB_USER,
  },
  console.log("\x1b[33m", `Connected to ${process.env.DB_NAME}.`)
);

class Tracker {
  init() {
    this.menu();
  }

  menu() {
    inquirer
      .prompt([
        {
          type: "rawlist",
          name: "menu",
          message: "What would you like to do?",
          choices: [
            "View All Employees",
            "Add Employee",
            "Update Employee Role",
            "View All Roles",
            "Add Role",
            "View All Departments",
            "Add Department",
          ],
        },
      ])
      .then((answers) => {
        if (answers.menu === "View All Employees") {
          this.viewAllEmployees();
        } else if (answers.menu === "Add Employee") {
          this.addEmployee();
        } else if (answers.menu === "Update Employee Role") {
          this.updateEmployeeRole();
        } else if (answers.menu === "View All Roles") {
          this.viewAllRoles();
        } else if (answers.menu === "Add Role") {
          this.addRole();
        } else if (answers.menu === "View All Departments") {
          this.viewAllDepartments();
        } else if (answers.menu === "Add Department") {
          this.addDepartment();
        }
      });
  }

  viewAllEmployees() {
    db.query(
      `SELECT employees.id, employees.first_name, employees.last_name, roles.title AS title, departments.department_name AS department, roles.salary, CONCAT(manager.first_name, ' ', manager.last_name) AS manager FROM employees LEFT JOIN roles on employees.role_id = roles.id LEFT JOIN departments on roles.department_id = departments.id LEFT JOIN employees manager on manager.id = employees.manager_id`,
      (error, result) => {
        if (error) {
          console.error(error);
        } else {
          console.table(result);
          this.init();
        }
      }
    );
  }

  // TODO: What is the employee's role? Who is the employee's manager?
  addEmployee() {
    const roleChoices = () =>
      db
        .promise()
        .query(`SELECT * FROM roles`)
        .then((result) => {
          let roleChoices = result[0].map((object) => object.title);
          return roleChoices;
        })
        .catch((error) => {
          throw error;
        });

    inquirer.prompt([
      {
        type: "input",
        name: "first_name",
        message: "What is the employee's first name?",
        validate: (input) => {
          if (input) {
            return true;
          } else {
            console.log("Please enter the employee's first name.");
            return false;
          }
        },
      },
      {
        type: "input",
        name: "last_name",
        message: "What is the employee's last name?",
        validate: (input) => {
          if (input) {
            return true;
          } else {
            console.log("Please enter the employee's last name.");
            return false;
          }
        },
      },
      {
        type: "rawlist",
        name: "role",
        message: "What is the employee's role?",
        choices: roleChoices,
      },
      {
        type: "rawlist",
        name: "manager",
        message: "Who is the employee's manager?",
        choices: [],
      },
    ]);
  }

  // TODO: Which employee's role do you want to update? Which role do you want to assign the selected employee?
  updateEmployeeRole() {
    const employeeChoices = () =>
      db
        .promise()
        .query(`SELECT * FROM employees`)
        .then((result) => {
          let employeeChoices = result[0].map(
            (object) => `${object.first_name} ${object.last_name}`
          );
          return employeeChoices;
        })
        .catch((error) => {
          throw error;
        });

    const roleChoices = () =>
      db
        .promise()
        .query(`SELECT * FROM roles`)
        .then((result) => {
          let roleChoices = result[0].map((object) => object.title);
          return roleChoices;
        })
        .catch((error) => {
          throw error;
        });

    inquirer.prompt([
      {
        type: "rawlist",
        name: "employee",
        message: "Which employee's role do you want to update?",
        choices: employeeChoices,
      },
      {
        type: "rawlist",
        name: "role",
        message: "Which role do you want to assign the selected employee?",
        choices: roleChoices,
      },
    ]);
  }

  viewAllRoles() {
    db.query(
      `SELECT roles.id, roles.title, departments.department_name AS department, roles.salary FROM roles LEFT JOIN departments on roles.department_id = departments.id`,
      (error, result) => {
        if (error) {
          console.error(error);
        } else {
          console.table(result);
          this.init();
        }
      }
    );
  }

  // TODO: Which department does the role belong to?
  addRole() {
    const departmentChoices = () =>
      db
        .promise()
        .query(`SELECT * FROM departments`)
        .then((result) => {
          let departmentChoices = result[0].map(
            (object) => object.department_name
          );
          return departmentChoices;
        })
        .catch((error) => {
          throw error;
        });

    inquirer.prompt([
      {
        type: "input",
        name: "role",
        message: "What is the name of the role?",
        validate: (input) => {
          if (input) {
            return true;
          } else {
            console.log("Please enter the role's name.");
            return false;
          }
        },
      },
      {
        type: "input",
        name: "salary",
        message: "What is the salary of the role?",
        validate: (input) => {
          if (input) {
            return true;
          } else {
            console.log("Please enter the role's salary.");
            return false;
          }
        },
      },
      {
        type: "rawlist",
        name: "department",
        message: "Which department does the role belong to?",
        choices: departmentChoices,
      },
    ]);
  }

  viewAllDepartments() {
    db.query(
      `SELECT departments.id, departments.department_name AS departments FROM departments`,
      (error, result) => {
        if (error) {
          console.error(error);
        } else {
          console.table(result);
          this.init();
        }
      }
    );
  }

  addDepartment() {
    inquirer
      .prompt([
        {
          type: "input",
          name: "department",
          message: "What is the name of the department?",
          validate: (input) => {
            if (input) {
              return true;
            } else {
              console.log("Please enter the department's name.");
              return false;
            }
          },
        },
      ])
      .then((answers) => {
        db.query(
          `INSERT INTO departments (department_name) VALUES (?)`,
          answers.department,
          (error, result) => {
            if (error) {
              console.error(error);
            } else {
              this.init();
            }
          }
        );
      });
  }
}

const tracker = new Tracker();
tracker.init();
