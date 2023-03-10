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

  addEmployee() {
    let roleArray = [];
    const roleChoices = () =>
      db
        .promise()
        .query(`SELECT * FROM roles`)
        .then((result) => {
          let roleChoices = result[0].map((object) => object.title);
          roleArray.push(roleChoices);
          return roleChoices;
        })
        .catch((error) => {
          throw error;
        });

    let managerArray = [];
    const managerChoices = () =>
      db
        .promise()
        .query(`SELECT * FROM employees`)
        .then((result) => {
          let managerChoices = result[0].map(
            (object) => `${object.first_name} ${object.last_name}`
          );
          managerArray.push(managerChoices);
          return managerChoices;
        })
        .catch((error) => {
          throw error;
        });

    inquirer
      .prompt([
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
          choices: managerChoices,
        },
      ])
      .then((answers) => {
        let roleFlat = roleArray.flat();
        let roleId = roleFlat.indexOf(answers.role) + 1;
        let managerFlat = managerArray.flat();
        let managerId = managerFlat.indexOf(answers.manager) + 1;
        db.query(
          `INSERT INTO employees SET ?`,
          {
            first_name: answers.first_name,
            last_name: answers.last_name,
            role_id: roleId,
            manager_id: managerId,
          },
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

  updateEmployeeRole() {
    let employeeArray = [];
    const employeeChoices = () =>
      db
        .promise()
        .query(`SELECT * FROM employees`)
        .then((result) => {
          let employeeChoices = result[0].map(
            (object) => `${object.first_name} ${object.last_name}`
          );
          employeeArray.push(employeeChoices);
          return employeeChoices;
        })
        .catch((error) => {
          throw error;
        });

    let roleArray = [];
    const roleChoices = () =>
      db
        .promise()
        .query(`SELECT * FROM roles`)
        .then((result) => {
          let roleChoices = result[0].map((object) => object.title);
          roleArray.push(roleChoices);
          return roleChoices;
        })
        .catch((error) => {
          throw error;
        });

    inquirer
      .prompt([
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
      ])
      .then((answers) => {
        let employeeFlat = employeeArray.flat();
        let employeeId = employeeFlat.indexOf(answers.employee) + 1;
        let roleFlat = roleArray.flat();
        let roleId = roleFlat.indexOf(answers.role) + 1;
        db.query(
          `UPDATE employees SET ? WHERE id = ${employeeId}`,
          {
            role_id: roleId,
          },
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

  addRole() {
    let departmentArray = [];
    const departmentChoices = () =>
      db
        .promise()
        .query(`SELECT * FROM departments`)
        .then((result) => {
          let departmentChoices = result[0].map(
            (object) => object.department_name
          );
          departmentArray.push(departmentChoices);
          return departmentChoices;
        })
        .catch((error) => {
          throw error;
        });

    inquirer
      .prompt([
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
      ])
      .then((answers) => {
        let departmentFlat = departmentArray.flat();
        let departmentId = departmentFlat.indexOf(answers.department) + 1;
        db.query(
          `INSERT INTO roles SET ?`,
          {
            title: answers.role,
            salary: answers.salary,
            department_id: departmentId,
          },
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

module.exports = Tracker;
