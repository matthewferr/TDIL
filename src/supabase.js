import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://tszolssbbiyucszmvdkb.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRzem9sc3NiYml5dWNzem12ZGtiIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzkzMzk0MTksImV4cCI6MTk5NDkxNTQxOX0.K6r99l-ofvo4pLEvxjAqWSKi5gL0Ok5J1Oa7mFNxMkA";
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
