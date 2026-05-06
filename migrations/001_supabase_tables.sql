
-- Add author_name and title to existing reviews table
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS author_name VARCHAR(100) DEFAULT 'Anonymous';
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS title VARCHAR(200);

-- Add community-feature columns to existing stories table
ALTER TABLE stories ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'Natural';
ALTER TABLE stories ADD COLUMN IF NOT EXISTS location VARCHAR(100) DEFAULT 'Cambodia';
ALTER TABLE stories ADD COLUMN IF NOT EXISTS rating INTEGER;
ALTER TABLE stories ADD COLUMN IF NOT EXISTS image_url VARCHAR(500);
ALTER TABLE stories ADD COLUMN IF NOT EXISTS video_url VARCHAR(500);
ALTER TABLE stories ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0;
ALTER TABLE stories ADD COLUMN IF NOT EXISTS comments_count INTEGER DEFAULT 0;
ALTER TABLE stories ADD COLUMN IF NOT EXISTS author_name VARCHAR(100) DEFAULT 'Traveler';
ALTER TABLE stories ADD COLUMN IF NOT EXISTS author_handle VARCHAR(100) DEFAULT '@traveler';
ALTER TABLE stories ADD COLUMN IF NOT EXISTS author_initials VARCHAR(5) DEFAULT 'T';
ALTER TABLE stories ADD COLUMN IF NOT EXISTS author_avatar_color VARCHAR(20) DEFAULT '#1a2340';
ALTER TABLE stories ADD COLUMN IF NOT EXISTS author_home_base VARCHAR(100);
ALTER TABLE stories ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ DEFAULT NOW();

-- Create story_comments table (new table)
CREATE TABLE IF NOT EXISTS story_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  author_name VARCHAR(100) NOT NULL DEFAULT 'Traveler',
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_reviews_attraction_id ON reviews(attraction_id);
CREATE INDEX IF NOT EXISTS idx_stories_published_at ON stories(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_story_comments_story_id ON story_comments(story_id);




