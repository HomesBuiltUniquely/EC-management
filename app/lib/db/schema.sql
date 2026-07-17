CREATE TABLE IF NOT EXISTS receptionists (
  id VARCHAR(64) PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  branch VARCHAR(64) NOT NULL DEFAULT 'HBR',
  password_hash VARCHAR(255) NOT NULL,
  active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS floor_rooms (
  branch VARCHAR(64) NOT NULL DEFAULT 'HBR',
  id INT NOT NULL,
  payload JSON NOT NULL,
  PRIMARY KEY (branch, id)
);

CREATE TABLE IF NOT EXISTS walk_ins (
  id VARCHAR(64) PRIMARY KEY,
  designer VARCHAR(255) NOT NULL,
  form_date VARCHAR(32) NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(64) NOT NULL,
  alternate_phone VARCHAR(64) NULL,
  expected_move_in VARCHAR(128) NULL,
  residing_address TEXT NULL,
  property_name VARCHAR(255) NULL,
  property_address TEXT NULL,
  property_type VARCHAR(64) NULL,
  property_use VARCHAR(64) NULL,
  budget VARCHAR(128) NOT NULL,
  possession VARCHAR(128) NULL,
  requirements JSON NOT NULL,
  interest TEXT NOT NULL,
  arrived_at BIGINT NOT NULL,
  date_key VARCHAR(32) NOT NULL,
  status VARCHAR(32) NOT NULL,
  assigned_room_id INT NULL,
  assigned_room_name VARCHAR(128) NULL,
  is_scheduled TINYINT(1) NOT NULL DEFAULT 0,
  schedule_time VARCHAR(32) NULL,
  schedule_end VARCHAR(32) NULL,
  source VARCHAR(32) NULL,
  external_appointment_id BIGINT NULL,
  lead_id VARCHAR(64) NULL,
  crm_name VARCHAR(255) NULL,
  milestone_name VARCHAR(100) NULL,
  branch VARCHAR(64) NULL,
  visit_type VARCHAR(64) NULL,
  INDEX idx_walk_ins_date_key (date_key),
  INDEX idx_walk_ins_source_external (source, external_appointment_id)
);

CREATE TABLE IF NOT EXISTS scheduled_meetings (
  id VARCHAR(64) PRIMARY KEY,
  branch VARCHAR(64) NOT NULL DEFAULT 'HBR',
  lead_name VARCHAR(255) NOT NULL,
  with_name VARCHAR(255) NULL,
  room_name VARCHAR(128) NULL,
  start_t VARCHAR(32) NOT NULL,
  end_t VARCHAR(32) NOT NULL,
  scheduled_at BIGINT NOT NULL,
  date_key VARCHAR(32) NOT NULL,
  confirmed TINYINT(1) NOT NULL DEFAULT 0,
  walk_in_id VARCHAR(64) NULL,
  INDEX idx_scheduled_date_key (date_key)
);

CREATE TABLE IF NOT EXISTS completed_meetings (
  id VARCHAR(64) PRIMARY KEY,
  branch VARCHAR(64) NOT NULL DEFAULT 'HBR',
  room_name VARCHAR(128) NOT NULL,
  lead_name VARCHAR(255) NOT NULL,
  with_name VARCHAR(255) NULL,
  completed_at BIGINT NOT NULL,
  date_key VARCHAR(32) NOT NULL,
  INDEX idx_completed_date_key (date_key)
);

CREATE TABLE IF NOT EXISTS meeting_feedbacks (
  id VARCHAR(64) PRIMARY KEY,
  branch VARCHAR(64) NOT NULL DEFAULT 'HBR',
  room_id INT NOT NULL,
  room_name VARCHAR(128) NOT NULL,
  lead_name VARCHAR(255) NOT NULL,
  completed_at BIGINT NOT NULL,
  date_key VARCHAR(32) NOT NULL,
  customer_name VARCHAR(255) NULL,
  visit_date VARCHAR(32) NOT NULL,
  designer_name VARCHAR(255) NULL,
  sales_rep_name VARCHAR(255) NULL,
  designer_understand VARCHAR(32) NOT NULL,
  designer_explain VARCHAR(32) NOT NULL,
  designer_confidence VARCHAR(32) NOT NULL,
  designer_listen VARCHAR(32) NOT NULL,
  designer_overall VARCHAR(32) NOT NULL,
  design_team_suggestions TEXT NULL,
  sales_explain_process VARCHAR(32) NOT NULL,
  sales_comfort VARCHAR(64) NOT NULL,
  sales_transparent VARCHAR(32) NOT NULL,
  sales_queries VARCHAR(32) NOT NULL,
  sales_overall VARCHAR(32) NOT NULL,
  sales_team_feedback TEXT NULL,
  recommend_score INT NOT NULL,
  follow_up_wanted VARCHAR(8) NOT NULL,
  follow_up_phone VARCHAR(64) NULL,
  INDEX idx_feedback_date_key (date_key)
);

CREATE TABLE IF NOT EXISTS integration_sync_state (
  source VARCHAR(32) PRIMARY KEY,
  last_synced_at VARCHAR(32) NOT NULL,
  updated_at BIGINT NOT NULL
);
