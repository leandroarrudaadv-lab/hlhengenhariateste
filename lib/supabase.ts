import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ngeaojjcrgpsvgjmipvb.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5nZWFvampjcmdwc3Znam1pcHZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3MDY0MzIsImV4cCI6MjA4MzI4MjQzMn0.eZS67Lab1p2SwpCYWQ2FUtsq2AG12wy_17gM__IAU78';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
