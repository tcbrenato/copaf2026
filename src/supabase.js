import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://pdtohaxbsgpxccopgnmd.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBkdG9oYXhic2dweGNjb3Bnbm1kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU5MzI4MDMsImV4cCI6MjA5MTUwODgwM30.Nwdxq1V63LTE9duI30KN9c6JQ_OPhyU0_ERwobnUGGk'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)