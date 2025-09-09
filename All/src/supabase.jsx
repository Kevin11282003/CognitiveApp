// src/supabase.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://feweabodikdxruomrnha.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZld2VhYm9kaWtkeHJ1b21ybmhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxNjY5NjksImV4cCI6MjA3Mjc0Mjk2OX0.BCdC9NL6Xd06LOVRlBqBhMPksC7JaiLJ6LDEHIUu0oI';
export const supabase = createClient(supabaseUrl, supabaseKey);