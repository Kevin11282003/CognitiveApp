// src/supabase.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://epcycfbvtxcklvaubcoc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwY3ljZmJ2dHhja2x2YXViY29jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyNzA1OTAsImV4cCI6MjA2Mjg0NjU5MH0.ZPUothoTKgj9ywKLR7rUn4jOHspa3m9298zMoGTq-Xc';
export const supabase = createClient(supabaseUrl, supabaseKey);