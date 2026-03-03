-- ============================================================
-- TripEase 种子数据
-- 使用前请确保 schema.sql 已执行
-- 密码全部使用 bcrypt 哈希（10 轮）
-- ============================================================

-- 先清空相关数据（按依赖顺序倒序删除）
DELETE FROM review_logs;
DELETE FROM room_features;
DELETE FROM hotel_images;
DELETE FROM hotel_tags;
DELETE FROM hotel_amenities;
DELETE FROM rooms;
DELETE FROM hotels;
DELETE FROM users WHERE role IN ('admin', 'merchant');

-- ============================================================
-- 1. 用户数据
-- admin123  的 bcrypt hash
-- merchant123 的 bcrypt hash
-- ============================================================

-- admin1 / admin123
INSERT INTO users (username, password, display_name, role) VALUES
  ('admin1', '$2a$10$dSwsv0W0r/4xK7cZfqx.EuwTLEurczrrUWP3oBU9sQo4awg1Fj/VW', '系统管理员', 'admin');

-- 10 个商户，密码都是 merchant123
INSERT INTO users (username, password, display_name, role) VALUES
  ('chenzhiqiang', '$2a$10$YDnHoqQ7Cu5HoCVfEzcjK.EQEeLVuM/jaBeQtww8aha3fy4/SU.iy', '陈志强', 'merchant'),
  ('liufang',      '$2a$10$YDnHoqQ7Cu5HoCVfEzcjK.EQEeLVuM/jaBeQtww8aha3fy4/SU.iy', '刘芳',   'merchant'),
  ('wangjianguo',  '$2a$10$YDnHoqQ7Cu5HoCVfEzcjK.EQEeLVuM/jaBeQtww8aha3fy4/SU.iy', '王建国', 'merchant'),
  ('zhaomin',      '$2a$10$YDnHoqQ7Cu5HoCVfEzcjK.EQEeLVuM/jaBeQtww8aha3fy4/SU.iy', '赵敏',   'merchant'),
  ('sunwei',       '$2a$10$YDnHoqQ7Cu5HoCVfEzcjK.EQEeLVuM/jaBeQtww8aha3fy4/SU.iy', '孙伟',   'merchant'),
  ('zhouting',     '$2a$10$YDnHoqQ7Cu5HoCVfEzcjK.EQEeLVuM/jaBeQtww8aha3fy4/SU.iy', '周婷',   'merchant'),
  ('wuqiang',      '$2a$10$YDnHoqQ7Cu5HoCVfEzcjK.EQEeLVuM/jaBeQtww8aha3fy4/SU.iy', '吴强',   'merchant'),
  ('zhengli',      '$2a$10$YDnHoqQ7Cu5HoCVfEzcjK.EQEeLVuM/jaBeQtww8aha3fy4/SU.iy', '郑丽',   'merchant'),
  ('fengjie',      '$2a$10$YDnHoqQ7Cu5HoCVfEzcjK.EQEeLVuM/jaBeQtww8aha3fy4/SU.iy', '冯杰',   'merchant'),
  ('zhulan',       '$2a$10$YDnHoqQ7Cu5HoCVfEzcjK.EQEeLVuM/jaBeQtww8aha3fy4/SU.iy', '褚兰',   'merchant');

-- ============================================================
-- 2. 酒店数据
-- 使用变量来引用刚刚插入的 user id
-- ============================================================

-- 获取用户 ID（用子查询）
SET @admin_id      = (SELECT id FROM users WHERE username = 'admin1');
SET @chenzhiqiang  = (SELECT id FROM users WHERE username = 'chenzhiqiang');
SET @liufang       = (SELECT id FROM users WHERE username = 'liufang');
SET @wangjianguo   = (SELECT id FROM users WHERE username = 'wangjianguo');
SET @zhaomin       = (SELECT id FROM users WHERE username = 'zhaomin');
SET @sunwei        = (SELECT id FROM users WHERE username = 'sunwei');
SET @zhouting      = (SELECT id FROM users WHERE username = 'zhouting');
SET @wuqiang       = (SELECT id FROM users WHERE username = 'wuqiang');
SET @zhengli       = (SELECT id FROM users WHERE username = 'zhengli');
SET @fengjie       = (SELECT id FROM users WHERE username = 'fengjie');
SET @zhulan        = (SELECT id FROM users WHERE username = 'zhulan');

-- 10 家酒店
INSERT INTO hotels (owner_id, name, english_name, address, star_rating, open_date, price_per_night, original_price, rating, review_count, status, reject_reason, created_at) VALUES
  (@chenzhiqiang, '云端国际大酒店',     'Cloud International Hotel',    '上海市浦东新区陆家嘴环路 1088 号', 5, '2020-06-01', 1280.00, 1580.00, 4.8, 326, 'pending',   NULL, '2026-02-25 10:15:00'),
  (@liufang,      '锦江之星商务楼',     'Jinjiang Star Business Hotel', '北京市朝阳区建国路 88 号',         3, '2018-03-01', 388.00,  458.00,  4.2, 189, 'published', NULL, '2026-02-22 09:30:00'),
  (@wangjianguo,  '悦来客栈',           'Yuelai Inn',                   'XX 省 XX 市 XX 区古镇街道 88 号',  2, '2016-08-01', 168.00,  198.00,  3.5, 45,  'rejected',  '主图模糊，请重新拍摄清晰照片；酒店星级描述与实际设施不符，请核实并修改。当前设施无法满足所填写的星级标准。', '2026-02-24 10:15:00'),
  (@zhaomin,      '蓝湾海景度假村',     'Blue Bay Resort',              '三亚市海棠区海棠湾路 168 号',      4, '2019-12-01', 880.00,  1080.00, 4.6, 278, 'offline',   NULL, '2026-02-20 14:20:00'),
  (@sunwei,       '格林花园公寓酒店',   'Green Garden Apartment Hotel', '杭州市西湖区龙井路 56 号',         4, '2021-05-01', 520.00,  628.00,  4.4, 156, 'pending',   NULL, '2026-02-26 08:45:00'),
  (@zhouting,     '帝豪皇家大酒店',     'Imperial Royal Grand Hotel',   '广州市天河区珠江新城花城大道 1 号', 5, '2017-09-01', 1580.00, 1980.00, 4.9, 512, 'published', NULL, '2026-02-18 11:00:00'),
  (@wuqiang,      '快捷连锁旅店',       'Express Chain Hotel',          '成都市锦江区春熙路步行街 33 号',   2, '2015-04-01', 128.00,  158.00,  3.2, 67,  'rejected',  '房间照片与实际环境不符，卫生间设施图片缺失。请补充真实环境照片后重新提交。', '2026-02-23 15:30:00'),
  (@zhengli,      '如家风格宾馆',       'Home-Style Inn',               '西安市碑林区南大街 120 号',        2, '2019-01-01', 198.00,  238.00,  4.0, 98,  'published', NULL, '2026-02-21 13:10:00'),
  (@fengjie,      '希尔顿欢朋酒店',     'Hampton by Hilton',            '重庆市渝中区解放碑民权路 28 号',   4, '2022-08-01', 680.00,  828.00,  4.5, 234, 'offline',   NULL, '2026-02-19 16:40:00'),
  (@zhulan,       '山居岁月民宿',       'Mountain Living B&B',          '杭州市余杭区径山镇绿荫路 9 号',   3, '2023-03-01', 358.00,  428.00,  4.7, 87,  'pending',   NULL, '2026-02-26 09:20:00');

-- 获取酒店 ID
SET @hotel1  = (SELECT id FROM hotels WHERE name = '云端国际大酒店');
SET @hotel2  = (SELECT id FROM hotels WHERE name = '锦江之星商务楼');
SET @hotel3  = (SELECT id FROM hotels WHERE name = '悦来客栈');
SET @hotel4  = (SELECT id FROM hotels WHERE name = '蓝湾海景度假村');
SET @hotel5  = (SELECT id FROM hotels WHERE name = '格林花园公寓酒店');
SET @hotel6  = (SELECT id FROM hotels WHERE name = '帝豪皇家大酒店');
SET @hotel7  = (SELECT id FROM hotels WHERE name = '快捷连锁旅店');
SET @hotel8  = (SELECT id FROM hotels WHERE name = '如家风格宾馆');
SET @hotel9  = (SELECT id FROM hotels WHERE name = '希尔顿欢朋酒店');
SET @hotel10 = (SELECT id FROM hotels WHERE name = '山居岁月民宿');

-- ============================================================
-- 3. 房型数据（每家酒店 2-3 个房型）
-- ============================================================

INSERT INTO rooms (hotel_id, name, price_per_night, original_price, bed_type, size, sort_order) VALUES
  -- 云端国际大酒店
  (@hotel1, '豪华大床房',   1280.00, 1580.00, 'king',   '45m²', 1),
  (@hotel1, '行政套房',     2180.00, 2580.00, 'king',   '68m²', 2),
  (@hotel1, '商务双床房',   1080.00, 1280.00, 'twin',   '38m²', 3),
  -- 锦江之星商务楼
  (@hotel2, '标准大床房',   388.00,  458.00,  'king',   '25m²', 1),
  (@hotel2, '标准双床房',   418.00,  488.00,  'twin',   '28m²', 2),
  -- 悦来客栈
  (@hotel3, '标准大床房',   168.00,  198.00,  'king',   '18m²', 1),
  (@hotel3, '豪华双床房',   218.00,  258.00,  'twin',   '22m²', 2),
  -- 蓝湾海景度假村
  (@hotel4, '海景大床房',   880.00,  1080.00, 'king',   '42m²', 1),
  (@hotel4, '豪华海景套房', 1680.00, 1980.00, 'king',   '65m²', 2),
  (@hotel4, '亲子房',       980.00,  1180.00, 'twin',   '48m²', 3),
  -- 格林花园公寓酒店
  (@hotel5, '花园大床房',   520.00,  628.00,  'king',   '35m²', 1),
  (@hotel5, '家庭套房',     780.00,  928.00,  'twin',   '52m²', 2),
  -- 帝豪皇家大酒店
  (@hotel6, '皇家大床房',   1580.00, 1980.00, 'king',   '55m²', 1),
  (@hotel6, '总统套房',     5880.00, 6880.00, 'king',   '120m²', 2),
  (@hotel6, '豪华双床房',   1380.00, 1680.00, 'twin',   '48m²', 3),
  -- 快捷连锁旅店
  (@hotel7, '经济大床房',   128.00,  158.00,  'king',   '15m²', 1),
  (@hotel7, '经济双床房',   148.00,  178.00,  'twin',   '18m²', 2),
  -- 如家风格宾馆
  (@hotel8, '舒适大床房',   198.00,  238.00,  'king',   '20m²', 1),
  (@hotel8, '舒适双床房',   228.00,  268.00,  'twin',   '24m²', 2),
  -- 希尔顿欢朋酒店
  (@hotel9, '欢朋大床房',   680.00,  828.00,  'king',   '32m²', 1),
  (@hotel9, '欢朋双床房',   720.00,  868.00,  'twin',   '35m²', 2),
  (@hotel9, '行政大床房',   980.00,  1180.00, 'king',   '45m²', 3),
  -- 山居岁月民宿
  (@hotel10, '溪景房',      358.00,  428.00,  'king',   '28m²', 1),
  (@hotel10, '竹林套房',    528.00,  628.00,  'king',   '38m²', 2);

-- ============================================================
-- 4. 酒店图片（每家 4 张）
-- 使用设计稿中的真实图片 URL
-- ============================================================

INSERT INTO hotel_images (hotel_id, url, sort_order) VALUES
  -- 云端国际大酒店（五星豪华）
  (@hotel1, 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop', 1),
  (@hotel1, 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&h=600&fit=crop', 2),
  (@hotel1, 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&h=600&fit=crop', 3),
  (@hotel1, 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&h=600&fit=crop', 4),

  -- 锦江之星商务楼（三星商务）
  (@hotel2, 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&h=600&fit=crop', 1),
  (@hotel2, 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&h=600&fit=crop', 2),
  (@hotel2, 'https://images.unsplash.com/photo-1590490360182-c33d955735ed?w=800&h=600&fit=crop', 3),
  (@hotel2, 'https://images.unsplash.com/photo-1444201983204-c43cbd584d93?w=800&h=600&fit=crop', 4),

  -- 悦来客栈（二星客栈）
  (@hotel3, 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&h=600&fit=crop', 1),
  (@hotel3, 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&h=600&fit=crop', 2),
  (@hotel3, 'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800&h=600&fit=crop', 3),
  (@hotel3, 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&h=600&fit=crop', 4),

  -- 蓝湾海景度假村（四星海景）
  (@hotel4, 'https://images.unsplash.com/photo-1573052905904-34ad8c27f0cc?w=800&h=600&fit=crop', 1),
  (@hotel4, 'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800&h=600&fit=crop', 2),
  (@hotel4, 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=600&fit=crop', 3),
  (@hotel4, 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop', 4),

  -- 格林花园公寓酒店（四星花园）
  (@hotel5, 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&h=600&fit=crop', 1),
  (@hotel5, 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800&h=600&fit=crop', 2),
  (@hotel5, 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop', 3),
  (@hotel5, 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop', 4),

  -- 帝豪皇家大酒店（五星皇家）
  (@hotel6, 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&h=600&fit=crop', 1),
  (@hotel6, 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop', 2),
  (@hotel6, 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop', 3),
  (@hotel6, 'https://images.unsplash.com/photo-1615460549969-36fa19521a4f?w=800&h=600&fit=crop', 4),

  -- 快捷连锁旅店（二星经济）
  (@hotel7, 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&h=600&fit=crop', 1),
  (@hotel7, 'https://images.unsplash.com/photo-1590490360182-c33d955735ed?w=800&h=600&fit=crop', 2),
  (@hotel7, 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&h=600&fit=crop', 3),
  (@hotel7, 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&h=600&fit=crop', 4),

  -- 如家风格宾馆（二星舒适）
  (@hotel8, 'https://images.unsplash.com/photo-1590490360182-c33d955735ed?w=800&h=600&fit=crop', 1),
  (@hotel8, 'https://images.unsplash.com/photo-1444201983204-c43cbd584d93?w=800&h=600&fit=crop', 2),
  (@hotel8, 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&h=600&fit=crop', 3),
  (@hotel8, 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop', 4),

  -- 希尔顿欢朋酒店（四星商务）
  (@hotel9, 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop', 1),
  (@hotel9, 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&h=600&fit=crop', 2),
  (@hotel9, 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&h=600&fit=crop', 3),
  (@hotel9, 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&h=600&fit=crop', 4),

  -- 山居岁月民宿（三星民宿）
  (@hotel10, 'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800&h=600&fit=crop', 1),
  (@hotel10, 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=600&fit=crop', 2),
  (@hotel10, 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop', 3),
  (@hotel10, 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800&h=600&fit=crop', 4);

-- ============================================================
-- 5. 酒店标签关联
-- ============================================================

INSERT INTO hotel_tags (hotel_id, tag_id) VALUES
  (@hotel1, 1), (@hotel1, 4),  -- 豪华、商务
  (@hotel2, 4), (@hotel2, 7),  -- 商务、免费WiFi
  (@hotel3, 8),                -- 免费取消
  (@hotel4, 1), (@hotel4, 5), (@hotel4, 3),  -- 豪华、泳池、亲子
  (@hotel5, 9), (@hotel5, 7),  -- 公寓、免费WiFi
  (@hotel6, 1), (@hotel6, 6), (@hotel6, 4),  -- 豪华、Spa、商务
  (@hotel7, 7), (@hotel7, 8),  -- 免费WiFi、免费取消
  (@hotel8, 7), (@hotel8, 8),  -- 免费WiFi、免费取消
  (@hotel9, 4), (@hotel9, 1),  -- 商务、豪华
  (@hotel10, 2), (@hotel10, 10);  -- 精品、环保

-- ============================================================
-- 6. 酒店设施关联
-- ============================================================

INSERT INTO hotel_amenities (hotel_id, amenity_id) VALUES
  (@hotel1, 1), (@hotel1, 2), (@hotel1, 3), (@hotel1, 4), (@hotel1, 5), (@hotel1, 6),
  (@hotel2, 1), (@hotel2, 3), (@hotel2, 6),
  (@hotel3, 1), (@hotel3, 6),
  (@hotel4, 1), (@hotel4, 2), (@hotel4, 3), (@hotel4, 4), (@hotel4, 5), (@hotel4, 12),
  (@hotel5, 1), (@hotel5, 3), (@hotel5, 4), (@hotel5, 15),
  (@hotel6, 1), (@hotel6, 2), (@hotel6, 3), (@hotel6, 4), (@hotel6, 5), (@hotel6, 10), (@hotel6, 11), (@hotel6, 12),
  (@hotel7, 1),
  (@hotel8, 1), (@hotel8, 3),
  (@hotel9, 1), (@hotel9, 2), (@hotel9, 3), (@hotel9, 4), (@hotel9, 10),
  (@hotel10, 1), (@hotel10, 3);

-- ============================================================
-- 7. 审核日志
-- ============================================================

-- 被驳回的酒店有完整审核记录
INSERT INTO review_logs (hotel_id, operator_id, from_status, to_status, reason, created_at) VALUES
  -- 悦来客栈 (rejected)
  (@hotel3, @admin_id, 'pending', 'rejected', '主图模糊，请重新拍摄清晰照片；酒店星级描述与实际设施不符，请核实并修改。当前设施无法满足所填写的星级标准。', '2026-02-24 16:45:00'),

  -- 快捷连锁旅店 (rejected)
  (@hotel7, @admin_id, 'pending', 'rejected', '房间照片与实际环境不符，卫生间设施图片缺失。请补充真实环境照片后重新提交。', '2026-02-23 17:20:00'),

  -- 锦江之星 (published: pending -> approved -> published)
  (@hotel2, @admin_id, 'pending', 'approved', NULL, '2026-02-22 14:30:00'),
  (@hotel2, @admin_id, 'approved', 'published', NULL, '2026-02-22 15:00:00'),

  -- 帝豪皇家 (published: pending -> approved -> published)
  (@hotel6, @admin_id, 'pending', 'approved', NULL, '2026-02-18 14:00:00'),
  (@hotel6, @admin_id, 'approved', 'published', NULL, '2026-02-18 14:30:00'),

  -- 如家风格 (published: pending -> approved -> published)
  (@hotel8, @admin_id, 'pending', 'approved', NULL, '2026-02-21 15:00:00'),
  (@hotel8, @admin_id, 'approved', 'published', NULL, '2026-02-21 15:30:00'),

  -- 蓝湾海景 (offline: pending -> approved -> published -> offline)
  (@hotel4, @admin_id, 'pending', 'approved', NULL, '2026-02-20 16:00:00'),
  (@hotel4, @admin_id, 'approved', 'published', NULL, '2026-02-20 16:30:00'),
  (@hotel4, @admin_id, 'published', 'offline', '季节性维护', '2026-02-20 18:00:00'),

  -- 希尔顿欢朋 (offline: pending -> approved -> published -> offline)
  (@hotel9, @admin_id, 'pending', 'approved', NULL, '2026-02-19 17:00:00'),
  (@hotel9, @admin_id, 'approved', 'published', NULL, '2026-02-19 17:30:00'),
  (@hotel9, @admin_id, 'published', 'offline', '装修改造中', '2026-02-19 19:00:00');
