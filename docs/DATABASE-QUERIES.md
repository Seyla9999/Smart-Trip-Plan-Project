# 📊 Database Query Testing Guide

This document contains SQL queries for testing and verifying data in the Smart Trip Plan PostgreSQL database.

---

## 🔍 Connection Information

- **Database Name:** `smart_trip`
- **Host:** `localhost`
- **Port:** `5432`
- **User:** `postgres`
- **Schema:** `public`

---

## 📋 Table Overview

The database contains 5 main tables:

1. **users** - Traveler accounts
2. **stories** - Community travel stories
3. **attachments** - Images and files for stories
4. **story_likes** - Story like records
5. **traveler_follows** - Follow relationships between travelers

---

## 🛠️ Basic Queries

### 1. List All Tables

```sql
SELECT table_name, table_schema
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

### 2. Count Records in All Tables

```sql
SELECT 
  (SELECT COUNT(*) FROM users) as users_count,
  (SELECT COUNT(*) FROM stories) as stories_count,
  (SELECT COUNT(*) FROM attachments) as attachments_count,
  (SELECT COUNT(*) FROM story_likes) as likes_count,
  (SELECT COUNT(*) FROM traveler_follows) as follows_count;
```

---

## 👥 User Queries

### View All Users

```sql
SELECT id, email, full_name, username, role, bio
FROM users
ORDER BY full_name;
```

### View Specific User

```sql
SELECT * 
FROM users 
WHERE email = 'dara@example.com';
```

### Count Total Users

```sql
SELECT COUNT(*) as total_users 
FROM users;
```

### View Users by Role

```sql
SELECT role, COUNT(*) as count
FROM users
GROUP BY role;
```

---

## 📖 Story Queries

### View All Stories (Latest First)

```sql
SELECT 
  id, 
  title, 
  content, 
  status,
  created_at
FROM stories
ORDER BY created_at DESC;
```

### View Stories with User Details

```sql
SELECT 
  s.id,
  s.title,
  s.content,
  s.created_at,
  u.full_name as author_name,
  u.username as author_username,
  u.email as author_email
FROM stories s
LEFT JOIN users u ON s.user_id = u.id
ORDER BY s.created_at DESC;
```

### View Story with Attachments

```sql
SELECT 
  s.id as story_id,
  s.title,
  s.content,
  s.created_at,
  a.url as attachment_url,
  a.file_type,
  a.caption
FROM stories s
LEFT JOIN attachments a ON a.entity_id = s.id AND a.entity_type = 'story'
ORDER BY s.created_at DESC;
```

### Count Stories by User

```sql
SELECT 
  u.full_name,
  u.username,
  COUNT(s.id) as story_count
FROM users u
LEFT JOIN stories s ON s.user_id = u.id
GROUP BY u.id, u.full_name, u.username
ORDER BY story_count DESC;
```

### Search Stories by Keyword

```sql
SELECT 
  id,
  title,
  content,
  created_at
FROM stories
WHERE 
  title ILIKE '%phnom penh%' OR 
  content ILIKE '%phnom penh%'
ORDER BY created_at DESC;
```

---

## 📎 Attachment Queries

### View All Attachments

```sql
SELECT 
  id,
  entity_type,
  url,
  file_type,
  caption,
  created_at
FROM attachments
ORDER BY created_at DESC;
```

### View Attachments for a Specific Story

```sql
SELECT 
  a.*,
  s.title as story_title
FROM attachments a
JOIN stories s ON a.entity_id = s.id
WHERE a.entity_type = 'story'
  AND s.title = 'Test Story - Exploring Phnom Penh';
```

### Count Attachments by Type

```sql
SELECT 
  file_type,
  COUNT(*) as count
FROM attachments
GROUP BY file_type;
```

---

## ❤️ Like Queries

### View All Likes

```sql
SELECT 
  sl.id,
  sl.created_at,
  s.title as story_title,
  u.full_name as user_name
FROM story_likes sl
JOIN stories s ON sl.story_id = s.id
JOIN users u ON sl.user_id = u.id
ORDER BY sl.created_at DESC;
```

### Count Likes per Story

```sql
SELECT 
  s.title,
  COUNT(sl.id) as like_count
FROM stories s
LEFT JOIN story_likes sl ON s.id = sl.story_id
GROUP BY s.id, s.title
ORDER BY like_count DESC;
```

### Most Liked Stories

```sql
SELECT 
  s.id,
  s.title,
  COUNT(sl.id) as likes
FROM stories s
LEFT JOIN story_likes sl ON s.id = sl.story_id
GROUP BY s.id, s.title
ORDER BY likes DESC
LIMIT 10;
```

---

## 👣 Follow Queries

### View All Follows

```sql
SELECT 
  tf.created_at,
  u1.full_name as follower,
  u2.full_name as following
FROM traveler_follows tf
JOIN users u1 ON tf.follower_id = u1.id
JOIN users u2 ON tf.traveler_id = u2.id
ORDER BY tf.created_at DESC;
```

### Count Followers per User

```sql
SELECT 
  u.full_name,
  u.username,
  COUNT(tf.id) as follower_count
FROM users u
LEFT JOIN traveler_follows tf ON u.id = tf.traveler_id
GROUP BY u.id, u.full_name, u.username
ORDER BY follower_count DESC;
```

### Count Following per User

```sql
SELECT 
  u.full_name,
  u.username,
  COUNT(tf.id) as following_count
FROM users u
LEFT JOIN traveler_follows tf ON u.id = tf.follower_id
GROUP BY u.id, u.full_name, u.username
ORDER BY following_count DESC;
```

---

## 🔬 Advanced Queries

### Complete User Activity Report

```sql
SELECT 
  u.full_name,
  u.username,
  u.email,
  COUNT(DISTINCT s.id) as story_count,
  COUNT(DISTINCT sl.id) as likes_given,
  COUNT(DISTINCT tf.id) as following_count,
  (SELECT COUNT(*) FROM traveler_follows WHERE traveler_id = u.id) as followers
FROM users u
LEFT JOIN stories s ON s.user_id = u.id
LEFT JOIN story_likes sl ON sl.user_id = u.id
LEFT JOIN traveler_follows tf ON tf.follower_id = u.id
GROUP BY u.id, u.full_name, u.username, u.email
ORDER BY story_count DESC;
```

### Stories with Full Details

```sql
SELECT 
  s.id,
  s.title,
  s.content,
  s.created_at,
  u.full_name as author,
  u.username,
  COUNT(DISTINCT sl.id) as like_count,
  COUNT(DISTINCT a.id) as attachment_count
FROM stories s
LEFT JOIN users u ON s.user_id = u.id
LEFT JOIN story_likes sl ON sl.story_id = s.id
LEFT JOIN attachments a ON a.entity_id = s.id AND a.entity_type = 'story'
GROUP BY s.id, s.title, s.content, s.created_at, u.full_name, u.username
ORDER BY s.created_at DESC;
```

### Recent Activity Timeline

```sql
SELECT 
  'story' as activity_type,
  s.id as activity_id,
  s.title as description,
  u.full_name as user_name,
  s.created_at
FROM stories s
JOIN users u ON s.user_id = u.id

UNION ALL

SELECT 
  'like' as activity_type,
  sl.id as activity_id,
  CONCAT('Liked: ', s.title) as description,
  u.full_name as user_name,
  sl.created_at
FROM story_likes sl
JOIN stories s ON sl.story_id = s.id
JOIN users u ON sl.user_id = u.id

UNION ALL

SELECT 
  'follow' as activity_type,
  tf.id as activity_id,
  CONCAT(u1.full_name, ' followed ', u2.full_name) as description,
  u1.full_name as user_name,
  tf.created_at
FROM traveler_follows tf
JOIN users u1 ON tf.follower_id = u1.id
JOIN users u2 ON tf.traveler_id = u2.id

ORDER BY created_at DESC
LIMIT 20;
```

---

## ✏️ Insert Queries (Testing)

### Insert a New User

```sql
INSERT INTO users (email, password_hash, full_name, username, bio, role)
VALUES (
  'test@example.com',
  'test_password_hash',
  'Test User',
  'testuser',
  'Testing the database',
  'traveler'
)
RETURNING *;
```

### Insert a New Story

```sql
INSERT INTO stories (user_id, title, content, status)
VALUES (
  '3fff4738-55a9-4724-9c7e-1b256cb198eb',
  'Test Story from SQL',
  'This story was created directly in pgAdmin!',
  'published'
)
RETURNING *;
```

### Insert an Attachment

```sql
INSERT INTO attachments (entity_type, entity_id, url, file_type, caption, uploader_id)
VALUES (
  'story',
  (SELECT id FROM stories ORDER BY created_at DESC LIMIT 1),
  'https://images.unsplash.com/photo-1234567890',
  'image',
  'Test Image',
  '3fff4738-55a9-4724-9c7e-1b256cb198eb'
)
RETURNING *;
```

---

## 🗑️ Delete Queries (Cleanup)

### Delete a Specific Story

```sql
DELETE FROM stories 
WHERE title = 'Test Story from SQL'
RETURNING *;
```

### Delete All Likes

```sql
DELETE FROM story_likes;
```

### Delete All Follows

```sql
DELETE FROM traveler_follows;
```

---

## 🔄 Update Queries

### Update User Information

```sql
UPDATE users
SET 
  full_name = 'Updated Name',
  bio = 'Updated bio'
WHERE email = 'test@example.com'
RETURNING *;
```

### Update Story

```sql
UPDATE stories
SET 
  title = 'Updated Title',
  content = 'Updated content'
WHERE id = 'story-id-here'
RETURNING *;
```

---

## 📊 Database Statistics

### Database Size

```sql
SELECT 
  pg_size_pretty(pg_database_size('smart_trip')) as database_size;
```

### Table Sizes

```sql
SELECT 
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

---

## 🧪 Testing via Node.js

### View All Data (Script)

```powershell
cd backend
node view-data.js
```

### Check Tables (Script)

```powershell
cd backend
node check-tables.js
```

---

## 🔐 Security Notes

- **Never commit** database passwords to version control
- Use environment variables for sensitive data
- Regularly backup your database
- Use parameterized queries to prevent SQL injection

---

## 📝 Quick Reference

### Common Commands in pgAdmin

1. **Open Query Tool:** Right-click database → Query Tool
2. **Execute Query:** Press `F5` or click ▶️
3. **View Data:** Right-click table → View/Edit Data → All Rows
4. **Refresh Schema:** Right-click database → Refresh

### Common SQL Keywords

- `SELECT` - Retrieve data
- `INSERT` - Add new records
- `UPDATE` - Modify existing records
- `DELETE` - Remove records
- `WHERE` - Filter results
- `ORDER BY` - Sort results
- `GROUP BY` - Aggregate data
- `JOIN` - Combine tables
- `COUNT()` - Count rows
- `LIMIT` - Restrict number of results

---

**Last Updated:** May 7, 2026
