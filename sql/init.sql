USE test_database;

ALTER TABLE users
ADD COLUMN email VARCHAR(100),
ADD COLUMN address VARCHAR(255);
ALTER TABLE users ADD UNIQUE KEY uniq_phone (phone);
INSERT INTO users (name, phone, email, address)
VALUES 
('张三', '13800000001', 'a@test.com', '北京'),
('李四', '13800000002', 'b@test.com', '上海'),
('王五', '13800000003', 'c@test.com', '广州'),
('赵六', '13800000004', 'd@test.com', '深圳'),
('孙七', '13800000005', 'e@test.com', '杭州'),
('周八', '13800000006', 'f@test.com', '成都'),
('吴九', '13800000007', 'g@test.com', '南京'),
('郑十', '13800000008', 'h@test.com', '武汉');

SELECT * FROM users

SELECT DATABASE();