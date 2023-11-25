SHOW databases;
use seatarrangement;
show tables;
set SQL_SAFE_UPDATES=0;

/*員工資訊資料表*/
CREATE TABLE IF NOT EXISTS employee (
  EMP_ID VARCHAR(5) PRIMARY KEY not null,
  NAME VARCHAR(255) NOT NULL,
  EMAIL VARCHAR(255),
  FLOOR_SEAT_SEQ JSON default (JSON_ARRAY(0, 0))
);
select * from employee;
insert into employee(EMP_ID, NAME,EMAIL) values('00001','小白','00001@gmail.com');
ALTER TABLE employee ADD foreign key(FLOOR_SEAT_SEQ) references seatingchart(FLOOR_SEAT_SEQ);
insert into employee (EMP_ID, NAME,EMAIL,FLOOR_SEAT_SEQ) values ('00005', '小凱','00005@gmail.com',JSON_ARRAY(1, 2));

/*座位資訊資料表*/
CREATE TABLE IF NOT EXISTS seatingchart (
/*如果該位置沒作人就用0表示，有的話就會記錄是誰座的*/
  FLOOR_SEAT_SEQ VARCHAR(10) default '0',
  FLOOR_NO INT NOT NULL,
  SEAT_NO INT NOT NULL
);

select * from seatingchart;
insert into seatingchart(FLOOR_NO,SEAT_NO)values(4,1);
update seatingchart set FLOOR_SEAT_SEQ='00005' where FLOOR_NO=1 and SEAT_NO=2;

