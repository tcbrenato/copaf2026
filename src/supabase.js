import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://gorkgxiqknbpuvaocqlo.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdvcmtneGlxa25icHV2YW9jcWxvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4OTg2NTQsImV4cCI6MjA5MTQ3NDY1NH0.DshZyuMReq6e4GfNoJENK9ZSK6QvUrRfilbz6LkFvXM'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)