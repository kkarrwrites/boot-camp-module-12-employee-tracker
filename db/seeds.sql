INSERT INTO departments (department_name)
VALUES ("Customer Service"),
       ("HR"),
       ("IT"),
       ("Marketing");
       ("Sales");

INSERT INTO roles (title, salary, department_id)
VALUES ("Backend Web Developer", 90000, 3),
       ("Customer Service Lead", 60000, 1),
       ("Frontend Web Developer", 90000, 3),
       ("Full Stack Web Developer", 120000, 3),
       ("Human Resources Director", 70000, 2),
       ("Marketing Manager", 70000, 4),
       ("Sales Associate", 70000, 5);

INSERT INTO employees (first_name, last_name, role_id, manager_id)
VALUES ("Jane", "Doe", 1, NULL),
       ("Jack", "Doe", 3, NULL),
       ("Josh", "Doe", 7, NULL),
       ("John", "Doe", 7, 4);