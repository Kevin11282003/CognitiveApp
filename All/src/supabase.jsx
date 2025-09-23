// src/supabase.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vlegkcccglegepafcect.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZsZWdrY2NjZ2xlZ2VwYWZjZWN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0NjA2ODksImV4cCI6MjA3MzAzNjY4OX0.xSnnHsjZyQng0eurvR6ZLxGGh1RdlSRhqYy7Xs4U02k';
export const supabase = createClient(supabaseUrl, supabaseKey);