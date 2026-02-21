-- ============================================================
-- TripEase Database Schema
-- ============================================================

-- 1. 用户表
CREATE TABLE users (
  id         BIGINT       PRIMARY KEY AUTO_INCREMENT,
  username   VARCHAR(50)  NOT NULL UNIQUE,
  password   VARCHAR(255) NOT NULL,
  role       ENUM('customer', 'merchant', 'admin') NOT NULL DEFAULT 'customer',
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. 酒店表
CREATE TABLE hotels (
  id                   BIGINT       PRIMARY KEY AUTO_INCREMENT,
  owner_id             BIGINT       NOT NULL,
  name                 VARCHAR(200) NOT NULL,
  english_name         VARCHAR(200),
  address              VARCHAR(500) NOT NULL,
  star_rating          TINYINT      NOT NULL DEFAULT 3,
  open_date            DATE,
  distance_from_center VARCHAR(50),
  price_per_night      DECIMAL(10,2),
  original_price       DECIMAL(10,2),
  currency             VARCHAR(10)  NOT NULL DEFAULT '¥',
  rating               DECIMAL(2,1) NOT NULL DEFAULT 0,
  review_count         INT          NOT NULL DEFAULT 0,
  badge                VARCHAR(50),
  badge_color          ENUM('red', 'dark', 'green', 'accent'),
  status               ENUM('draft', 'pending', 'approved', 'rejected', 'published', 'offline')
                       NOT NULL DEFAULT 'draft',
  reject_reason        TEXT,
  created_at           DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at           DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (owner_id) REFERENCES users(id)
);

-- 3. 房型表
CREATE TABLE rooms (
  id              BIGINT        PRIMARY KEY AUTO_INCREMENT,
  hotel_id        BIGINT        NOT NULL,
  name            VARCHAR(100)  NOT NULL,
  description     TEXT,
  price_per_night DECIMAL(10,2) NOT NULL,
  original_price  DECIMAL(10,2),
  currency        VARCHAR(10)   NOT NULL DEFAULT '¥',
  image           VARCHAR(500),
  bed_type        VARCHAR(20)   NOT NULL,
  size            VARCHAR(20),
  badge           VARCHAR(50),
  badge_color     VARCHAR(20),
  sort_order      INT           NOT NULL DEFAULT 0,
  created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE
);

-- 4. 房型特色
CREATE TABLE room_features (
  id      BIGINT      PRIMARY KEY AUTO_INCREMENT,
  room_id BIGINT      NOT NULL,
  feature VARCHAR(50) NOT NULL,

  FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
);

-- 5. 酒店图片
CREATE TABLE hotel_images (
  id         BIGINT       PRIMARY KEY AUTO_INCREMENT,
  hotel_id   BIGINT       NOT NULL,
  url        VARCHAR(500) NOT NULL,
  sort_order INT          NOT NULL DEFAULT 0,

  FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE
);

-- 6. 标签
CREATE TABLE tags (
  id   BIGINT      PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE hotel_tags (
  hotel_id BIGINT NOT NULL,
  tag_id   BIGINT NOT NULL,
  PRIMARY KEY (hotel_id, tag_id),
  FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id)   REFERENCES tags(id)
);

-- 7. 设施
CREATE TABLE amenities (
  id   BIGINT      PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL UNIQUE,
  icon VARCHAR(50)
);

CREATE TABLE hotel_amenities (
  hotel_id   BIGINT NOT NULL,
  amenity_id BIGINT NOT NULL,
  PRIMARY KEY (hotel_id, amenity_id),
  FOREIGN KEY (hotel_id)   REFERENCES hotels(id) ON DELETE CASCADE,
  FOREIGN KEY (amenity_id) REFERENCES amenities(id)
);

-- 8. 审核日志
CREATE TABLE review_logs (
  id          BIGINT      PRIMARY KEY AUTO_INCREMENT,
  hotel_id    BIGINT      NOT NULL,
  operator_id BIGINT      NOT NULL,
  from_status VARCHAR(20) NOT NULL,
  to_status   VARCHAR(20) NOT NULL,
  reason      TEXT,
  created_at  DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (hotel_id)    REFERENCES hotels(id),
  FOREIGN KEY (operator_id) REFERENCES users(id)
);

-- 9. 订单表
CREATE TABLE orders (
  id          BIGINT        PRIMARY KEY AUTO_INCREMENT,
  user_id     BIGINT        NOT NULL,
  hotel_id    BIGINT        NOT NULL,
  room_id     BIGINT        NOT NULL,
  check_in    DATE          NOT NULL,
  check_out   DATE          NOT NULL,
  nights      TINYINT       NOT NULL,
  guests      TINYINT       NOT NULL DEFAULT 1,
  total_price DECIMAL(10,2) NOT NULL,
  currency    VARCHAR(10)   NOT NULL DEFAULT '¥',
  status      ENUM('pending', 'confirmed', 'cancelled', 'completed')
              NOT NULL DEFAULT 'pending',
  created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id)  REFERENCES users(id),
  FOREIGN KEY (hotel_id) REFERENCES hotels(id),
  FOREIGN KEY (room_id)  REFERENCES rooms(id)
);

-- 10. 用户评价
CREATE TABLE user_reviews (
  id         BIGINT       PRIMARY KEY AUTO_INCREMENT,
  user_id    BIGINT       NOT NULL,
  hotel_id   BIGINT       NOT NULL,
  order_id   BIGINT,
  rating     DECIMAL(2,1) NOT NULL,
  content    TEXT,
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id)  REFERENCES users(id),
  FOREIGN KEY (hotel_id) REFERENCES hotels(id),
  FOREIGN KEY (order_id) REFERENCES orders(id)
);

-- ============================================================
-- 索引（筛选 / 排序高频字段）
-- ============================================================

CREATE INDEX idx_hotels_owner_id        ON hotels(owner_id);
CREATE INDEX idx_hotels_status          ON hotels(status);
CREATE INDEX idx_hotels_star_rating     ON hotels(star_rating);
CREATE INDEX idx_hotels_rating          ON hotels(rating);
CREATE INDEX idx_hotels_price           ON hotels(price_per_night);

CREATE INDEX idx_rooms_hotel_id         ON rooms(hotel_id);
CREATE INDEX idx_room_features_room_id  ON room_features(room_id);
CREATE INDEX idx_hotel_images_hotel_id  ON hotel_images(hotel_id);

CREATE INDEX idx_review_logs_hotel_id   ON review_logs(hotel_id);
CREATE INDEX idx_orders_user_id         ON orders(user_id);
CREATE INDEX idx_orders_hotel_id        ON orders(hotel_id);
CREATE INDEX idx_user_reviews_hotel_id  ON user_reviews(hotel_id);

-- ============================================================
-- 种子数据：预置标签 & 设施
-- ============================================================

INSERT INTO tags (name) VALUES
  ('豪华'), ('精品'), ('亲子'), ('商务'), ('泳池'),
  ('Spa'), ('免费WiFi'), ('免费取消'), ('公寓'), ('环保');

INSERT INTO amenities (name, icon) VALUES
  ('免费WiFi',   'wifi'),
  ('泳池',       'pool'),
  ('餐厅',       'restaurant'),
  ('健身房',     'fitness_center'),
  ('Spa',        'spa'),
  ('停车场',     'local_parking'),
  ('行李寄存',   'luggage'),
  ('24小时前台', 'concierge'),
  ('洗衣服务',   'local_laundry_service'),
  ('商务中心',   'business_center'),
  ('会议室',     'meeting_room'),
  ('接机服务',   'airport_shuttle'),
  ('免费停车',   'local_parking'),
  ('无障碍',     'accessible'),
  ('厨房',       'kitchen'),
  ('洗衣机',     'local_laundry_service');
