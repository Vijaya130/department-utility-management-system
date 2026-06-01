import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://mistytlykgcxpexhshwh.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pc3R5dGx5a2djeHBleGhzaHdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxNzA3NzQsImV4cCI6MjA4OTc0Njc3NH0.TR3kQcPI4L1wU9glNotnD-gT7Do_h8rEUVDLzxVkOC8'

export const supabase = createClient(supabaseUrl, supabaseKey)