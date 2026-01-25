import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xkehvmfbzibpbgzdkdky.supabase.co';
const supabaseAnonKey = 'sb_publishable_zjO4WcZdHQOkeRbsz3zKhA_ITt2eHFy';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
