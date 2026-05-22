BEGIN;
INSERT INTO users (id, phone, password, name, role, grade, region, points, "isActive", "createdAt", "updatedAt") VALUES
  ('u_teacher', '13800138000', '$2b$10$AUKtJJD8BPiuVTU7KVjhteSDQtcUW1PQQ9b7rjs7S1L3N1LQb9pCe', '测试老师', 'TEACHER', NULL, '海岸城', 0, true, NOW(), NOW()),
  ('u_s01', '13800138001', '$2b$10$AUKtJJD8BPiuVTU7KVjhteSDQtcUW1PQQ9b7rjs7S1L3N1LQb9pCe', '小明', 'STUDENT', 1, '海岸城', 35, true, NOW(), NOW()),
  ('u_s02', '13800138002', '$2b$10$AUKtJJD8BPiuVTU7KVjhteSDQtcUW1PQQ9b7rjs7S1L3N1LQb9pCe', '小红', 'STUDENT', 1, '海岸城', 28, true, NOW(), NOW()),
  ('u_s03', '13800138003', '$2b$10$AUKtJJD8BPiuVTU7KVjhteSDQtcUW1PQQ9b7rjs7S1L3N1LQb9pCe', '小刚', 'STUDENT', 2, '海岸城', 42, true, NOW(), NOW()),
  ('u_s04', '13800138004', '$2b$10$AUKtJJD8BPiuVTU7KVjhteSDQtcUW1PQQ9b7rjs7S1L3N1LQb9pCe', '小丽', 'STUDENT', 2, '海岸城', 15, false, NOW(), NOW()),
  ('u_s05', '13800138005', '$2b$10$AUKtJJD8BPiuVTU7KVjhteSDQtcUW1PQQ9b7rjs7S1L3N1LQb9pCe', '小华', 'STUDENT', 1, '海岸城', 20, false, NOW(), NOW()),
  ('u_s06', '13800138006', '$2b$10$AUKtJJD8BPiuVTU7KVjhteSDQtcUW1PQQ9b7rjs7S1L3N1LQb9pCe', '小美', 'STUDENT', 2, '海岸城', 33, false, NOW(), NOW()),
  ('u_s07', '13800138007', '$2b$10$AUKtJJD8BPiuVTU7KVjhteSDQtcUW1PQQ9b7rjs7S1L3N1LQb9pCe', '小军', 'STUDENT', 1, '海岸城', 18, false, NOW(), NOW()),
  ('u_s08', '13800138008', '$2b$10$AUKtJJD8BPiuVTU7KVjhteSDQtcUW1PQQ9b7rjs7S1L3N1LQb9pCe', '小芳', 'STUDENT', 2, '海岸城', 25, false, NOW(), NOW()),
  ('u_s09', '13800138009', '$2b$10$AUKtJJD8BPiuVTU7KVjhteSDQtcUW1PQQ9b7rjs7S1L3N1LQb9pCe', '小龙', 'STUDENT', 1, '海岸城', 12, false, NOW(), NOW()),
  ('u_s10', '13800138010', '$2b$10$AUKtJJD8BPiuVTU7KVjhteSDQtcUW1PQQ9b7rjs7S1L3N1LQb9pCe', '小雪', 'STUDENT', 2, '海岸城', 30, false, NOW(), NOW()),
  ('u_s11', '13800138011', '$2b$10$AUKtJJD8BPiuVTU7KVjhteSDQtcUW1PQQ9b7rjs7S1L3N1LQb9pCe', '小雨', 'STUDENT', 1, '海岸城', 22, false, NOW(), NOW()),
  ('u_s12', '13800138012', '$2b$10$AUKtJJD8BPiuVTU7KVjhteSDQtcUW1PQQ9b7rjs7S1L3N1LQb9pCe', '小雷', 'STUDENT', 2, '海岸城', 16, false, NOW(), NOW()),
  ('u_s13', '13800138013', '$2b$10$AUKtJJD8BPiuVTU7KVjhteSDQtcUW1PQQ9b7rjs7S1L3N1LQb9pCe', '小英', 'STUDENT', 1, '海岸城', 10, false, NOW(), NOW()),
  ('u_s14', '13800138014', '$2b$10$AUKtJJD8BPiuVTU7KVjhteSDQtcUW1PQQ9b7rjs7S1L3N1LQb9pCe', '明明', 'STUDENT', 2, '海岸城', 8, false, NOW(), NOW()) ON CONFLICT (id) DO NOTHING;
INSERT INTO questions (id, title, content, grade, "authorId", status, "createdAt", "updatedAt") VALUES
  ('q_01', '🍊 橙子分享问题', '小明有6个橙子，他想分给小红和小刚，每人分到同样多的橙子，每人可以分到几个？', 1, 'u_s01', 'OPEN', NOW(), NOW()),
  ('q_02', '🧵 毛线团长度问题', '一团毛线长12米，如果每2米剪一段，可以剪成几段？', 2, 'u_s02', 'OPEN', NOW(), NOW()),
  ('q_03', '🎁 礼物盒子问题', '小红有3个礼物盒子，每个盒子里有5个糖果，一共有多少个糖果？', 1, 'u_s03', 'OPEN', NOW(), NOW()),
  ('q_04', '🍭 巧克力分配', '一包巧克力有24块，如果每人分4块，可以分给几个人？', 2, 'u_s04', 'OPEN', NOW(), NOW()),
  ('q_05', '🚗 小汽车问题', '小明有5辆玩具车，小红有3辆，他们一共有多少辆车？', 1, 'u_s05', 'OPEN', NOW(), NOW()),
  ('q_06', '📱 手机电量', '一部手机电量100%，每小时用掉20%，几个小时后电量用完？', 2, 'u_s06', 'OPEN', NOW(), NOW()),
  ('q_07', '🌿 树叶收集', '一棵树上有24片树叶，如果每天掉落3片，几天后树上没有树叶了？', 1, 'u_s07', 'OPEN', NOW(), NOW()),
  ('q_08', '📚 书架排列', '书架上有5层书，每层有4本，一共有多少本书？', 2, 'u_s08', 'OPEN', NOW(), NOW()),
  ('q_09', '🍕 披萨切分', '一个圆形披萨，切成4均等份，每份是几分之几？', 2, 'u_s09', 'OPEN', NOW(), NOW()),
  ('q_10', '🥚 鸡蛋分组', '12个鸡蛋放进盘子，每盘放6个，需要几个盘子？', 1, 'u_s10', 'OPEN', NOW(), NOW()) ON CONFLICT (id) DO NOTHING;
INSERT INTO answers (id, "videoUrl", description, "lecturerId", "questionId", status, "createdAt", "updatedAt") VALUES
  ('a_01', 'https://example.com/video1.mp4', '我用分梨子的方法，6个橙子分给两个人，每人3个。', 'u_s02', 'q_01', 'APPROVED', NOW(), NOW()),
  ('a_02', 'https://example.com/video2.mp4', '12米每2米一段，一共有6段。', 'u_s01', 'q_02', 'APPROVED', NOW(), NOW()),
  ('a_03', 'https://example.com/video3.mp4', '3个盒子×5个糖果=15个糖果。', 'u_s04', 'q_03', 'APPROVED', NOW(), NOW()),
  ('a_04', 'https://example.com/video4.mp4', '24÷4=6个人。', 'u_s03', 'q_04', 'PENDING', NOW(), NOW()),
  ('a_05', 'https://example.com/video5.mp4', '5+3=8辆车。', 'u_s06', 'q_05', 'APPROVED', NOW(), NOW()),
  ('a_06', 'https://example.com/video6.mp4', '100÷20=5小时后电量用完。', 'u_s05', 'q_06', 'PENDING', NOW(), NOW()),
  ('a_07', 'https://example.com/video7.mp4', '24÷3=8天。', 'u_s08', 'q_07', 'APPROVED', NOW(), NOW()),
  ('a_08', 'https://example.com/video8.mp4', '5×4=20本书。', 'u_s07', 'q_08', 'PENDING', NOW(), NOW()) ON CONFLICT (id) DO NOTHING;
INSERT INTO point_transactions (id, "userId", amount, reason, "createdAt") VALUES ('pt_1', 'u_s02', 10, '讲题被彩纳', NOW()) ON CONFLICT DO NOTHING;
INSERT INTO point_transactions (id, "userId", amount, reason, "createdAt") VALUES ('pt_2', 'u_s01', 10, '讲题被彩纳', NOW()) ON CONFLICT DO NOTHING;
INSERT INTO point_transactions (id, "userId", amount, reason, "createdAt") VALUES ('pt_3', 'u_s04', 10, '讲题被彩纳', NOW()) ON CONFLICT DO NOTHING;
INSERT INTO point_transactions (id, "userId", amount, reason, "createdAt") VALUES ('pt_4', 'u_s06', 10, '讲题被彩纳', NOW()) ON CONFLICT DO NOTHING;
INSERT INTO point_transactions (id, "userId", amount, reason, "createdAt") VALUES ('pt_5', 'u_s08', 10, '讲题被彩纳', NOW()) ON CONFLICT DO NOTHING;
INSERT INTO user_badges (id, "userId", "badgeId", "awardedAt") VALUES
  ('ub_01', 'u_s01', 'badge_lecturer', NOW()),
  ('ub_02', 'u_s02', 'badge_lecturer', NOW()),
  ('ub_03', 'u_s03', 'badge_lecturer', NOW()),
  ('ub_04', 'u_s01', 'badge_questioner', NOW()),
  ('ub_05', 'u_s02', 'badge_questioner', NOW()),
  ('ub_06', 'u_s03', 'badge_pbl', NOW()) ON CONFLICT DO NOTHING;
INSERT INTO project_registrations (id, "userId", "projectId", status, "createdAt", "updatedAt") VALUES
  ('pr_01', 'u_s01', 'proj_01', 'CONFIRMED', NOW(), NOW()),
  ('pr_02', 'u_s02', 'proj_01', 'CONFIRMED', NOW(), NOW()),
  ('pr_03', 'u_s03', 'proj_01', 'CONFIRMED', NOW(), NOW()),
  ('pr_04', 'u_s04', 'proj_01', 'CONFIRMED', NOW(), NOW()),
  ('pr_05', 'u_s05', 'proj_01', 'CONFIRMED', NOW(), NOW()) ON CONFLICT DO NOTHING;
COMMIT;