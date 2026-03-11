import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlZmF1bHQiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTcwMDAwMDAwMCwiZXhwIjoyMDAwMDAwMDAwfQ...'; // We can use the anon key if we can read public

// Let me use fs instead to read the local DB? Supabase is running in Docker.
// I can just search the local next.js files if I have dotenv.
import * as fs from 'fs';
import * as path from 'path';

// read the env
const envContent = fs.readFileSync('.env.local', 'utf8');
const urlMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/);
const keyMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/);

if (urlMatch && keyMatch) {
  const supabase = createClient(urlMatch[1], keyMatch[1]);
  supabase.from('reading_passages').select('id, questions').order('created_at', {ascending: false}).limit(1).then(({data, error}) => {
    console.log(JSON.stringify(data?.[0], null, 2));
  });
}
