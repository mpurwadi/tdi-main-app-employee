-- Create news and announcements table
CREATE TABLE IF NOT EXISTS news_announcements (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(50) NOT NULL DEFAULT 'announcement', -- 'news' or 'announcement'
    author_id INTEGER,
    is_published BOOLEAN DEFAULT false,
    published_at TIMESTAMP WITHOUT TIME ZONE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_news_announcements_category ON news_announcements(category);
CREATE INDEX IF NOT EXISTS idx_news_announcements_published ON news_announcements(is_published);
CREATE INDEX IF NOT EXISTS idx_news_announcements_published_at ON news_announcements(published_at);