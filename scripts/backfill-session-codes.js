// scripts/backfill-session-codes.js
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js')

// Map of session IDs to codes (from session-code-generator.tsx)
const SESSION_CODES = {
  DYS1: "SELF2024",
  DYS2: "EMOT2024",
  DYS3: "COMM2024",
  DYS4: "LEAD2024",
  DYS5: "TEAM2024",
  DYS6: "PROB2024",
  DYS7: "GOAL2024",
  DYS8: "BRAND2024",
  DYS9: "FINAL2024",
}

// Load Supabase credentials from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

async function updateAllSessionCodes() {
  for (const [id, sessionCode] of Object.entries(SESSION_CODES)) {
    const { error } = await supabase
      .from('sessions')
      .update({ sessionCode })
      .eq('id', id)
    if (error) {
      console.error(`Failed to update ${id}:`, error.message)
    } else {
      console.log(`Updated ${id} with code ${sessionCode}`)
    }
  }
  console.log('Done!')
}

updateAllSessionCodes() 