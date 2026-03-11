import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';

const envContent = fs.readFileSync('.env.local', 'utf8');
const urlMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/);
const keyMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/);

if (urlMatch && keyMatch) {
  const supabase = createClient(urlMatch[1], keyMatch[1]);
  supabase.from('reading_passages').select('id, questions').order('created_at', {ascending: false}).limit(1).then(({data, error}) => {
    fs.writeFileSync('db-output.json', JSON.stringify(data?.[0], null, 2), 'utf8');
  });
}
