use dealsdray;
CREATE TABLE t_login (
  f_sno INT AUTO_INCREMENT PRIMARY KEY,
  f_userName VARCHAR(255) NOT NULL,
  f_Pwd VARCHAR(255) NOT NULL
);

CREATE TABLE t_Employee (
  f_Id INT AUTO_INCREMENT PRIMARY KEY,
  f_Name VARCHAR(255) NOT NULL,
  f_Email VARCHAR(255) NOT NULL UNIQUE,
  f_Mobile VARCHAR(15),
  f_Designation VARCHAR(50),
  f_Gender VARCHAR(10),
  f_Course VARCHAR(50),
  f_Image LONGBLOB,
  f_Createdate DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO t_login (f_userName, f_Pwd) VALUES ('sam', '$2a$10$HxIc4QqCU2Qp7qYNb7TYuejEv0HPJthkmQTq9lHz7f2l1TchWXPL6');
select*from t_login;
