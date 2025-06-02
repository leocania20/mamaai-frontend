// src/supabaseClient.js
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://qcuwlqqjexbxgsrcpcog.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFjdXdscXFqZXhieGdzcmNwY29nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgyMDk3NTksImV4cCI6MjA2Mzc4NTc1OX0.4oM8XthVvf5ZYSSbophHxEwvqj2bThBN8dZBOwo7EIM";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
