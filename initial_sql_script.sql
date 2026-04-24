
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


CREATE TABLE users (
                       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                       username VARCHAR(50) UNIQUE NOT NULL,
                       email VARCHAR(100) UNIQUE NOT NULL,
                       password_hash TEXT NOT NULL,
                       role VARCHAR(20) NOT NULL,
                       created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);


CREATE TABLE sites (
                       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                       owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                       name VARCHAR(100) NOT NULL,
                       slug VARCHAR(50) UNIQUE NOT NULL,
                       template VARCHAR(30) NOT NULL,
                       created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);


CREATE TABLE pages (
                       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                       site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
                       created_by UUID REFERENCES users(id),
                       title VARCHAR(200) NOT NULL,
                       slug VARCHAR(100) NOT NULL,
                       content TEXT,
                       draft_data TEXT,
                       status VARCHAR(20),
                       page_type VARCHAR(30),
                       created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
                       updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);


CREATE TABLE media (
                       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                       site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
                       uploaded_by UUID REFERENCES users(id),
                       filename VARCHAR(255) NOT NULL,
                       file_path TEXT NOT NULL,
                       mime_type VARCHAR(100) NOT NULL,
                       created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);


CREATE TABLE comments (
                          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                          page_id UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
                          author_name VARCHAR(100) NOT NULL,
                          author_email VARCHAR(100) NOT NULL,
                          content TEXT NOT NULL,
                          created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);



