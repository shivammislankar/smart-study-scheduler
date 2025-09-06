-- Add scheduled_sessions table
CREATE TABLE scheduled_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_id UUID REFERENCES topics(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER DEFAULT 25,
  session_type TEXT CHECK (session_type IN ('flashcard', 'quiz', 'review')) DEFAULT 'flashcard',
  reminder_enabled BOOLEAN DEFAULT true,
  reminder_minutes INTEGER DEFAULT 15,
  status TEXT CHECK (status IN ('scheduled', 'completed', 'cancelled', 'missed')) DEFAULT 'scheduled',
  completed_session_id UUID REFERENCES study_sessions(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_scheduled_sessions_user_id ON scheduled_sessions(user_id);
CREATE INDEX idx_scheduled_sessions_date ON scheduled_sessions(scheduled_date);
CREATE INDEX idx_scheduled_sessions_status ON scheduled_sessions(status);

-- Enable RLS
ALTER TABLE scheduled_sessions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own scheduled sessions" ON scheduled_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own scheduled sessions" ON scheduled_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own scheduled sessions" ON scheduled_sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own scheduled sessions" ON scheduled_sessions FOR DELETE USING (auth.uid() = user_id);
