
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://jqhvzvujrtmsgfxfctmb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxaHZ6dnVqcnRtc2dmeGZjdG1iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1NTA2NTAsImV4cCI6MjA4MDEyNjY1MH0.CdEYUDE-f527zm2AtDrXfUvFSamFwzxXzTmXMlE-MlM';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
