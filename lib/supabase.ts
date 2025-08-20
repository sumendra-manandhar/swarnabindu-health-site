import { createClient } from "@supabase/supabase-js";

const NEXT_PUBLIC_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4cmZodW9ua3d6ZHpjdWhrdmJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2MTg2MDUsImV4cCI6MjA3MTE5NDYwNX0.ULqVi0_7zW01NzYiIejvDep1XCVlQ2uZdgpO_hUaZaY";

const NEXT_PUBLIC_SUPABASE_URL = "https://zxrfhuonkwzdzcuhkvbh.supabase.co";

const supabaseUrl = NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
