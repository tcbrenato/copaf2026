import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://mhquapsqwbkndqzxebtr.supabase.co'
const SUPABASE_KEY = 'sb_publishable_TjxGdDYthxShEwjJqOnutw_D-KF3OSg'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)