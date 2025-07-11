// scripts/migrate-local-to-supabase.js

/**
 * Migration Script: LocalStorage to Supabase
 *
 * 1. In your browser, export your localStorage data as JSON files:
 *    - students.json
 *    - dys_sessions.json
 *    - Optionally: currentUser.json
 *    (You can use DevTools > Application > localStorage > Right-click > Save as)
 *
 * 2. Place these files in the scripts/ directory.
 *
 * 3. Set your Supabase credentials in a .env file or directly in this script.
 *
 * 4. Run: node scripts/migrate-local-to-supabase.js
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

function readJSON(filename) {
  return JSON.parse(fs.readFileSync(path.join(__dirname, filename), 'utf8'))
}

async function migrate() {
  // 1. Students
  let students = []
  try {
    students = readJSON('students.json')
    console.log(`Loaded ${students.length} students`)
  } catch (e) {
    console.error('Could not read students.json:', e.message)
    return
  }

  // 2. Sessions
  let sessions = []
  try {
    sessions = readJSON('dys_sessions.json')
    console.log(`Loaded ${sessions.length} sessions`)
  } catch (e) {
    console.error('Could not read dys_sessions.json:', e.message)
    return
  }

  // Insert sessions first
  for (const session of sessions) {
    const { id, name, description, date, time, venue, status, type, duration, testLink } = session
    const { error } = await supabase.from('sessions').upsert({
      id, name, description, date, time, venue, status, type, duration, test_link: testLink || null
    })
    if (error) console.error('Session error:', id, error.message)
  }

  // Insert students
  for (const student of students) {
    const { id, firstName, middleName, lastName, email, rollNumber, prnNumber, dateOfBirth, branch, division, gender, address, sgpaSem1, sgpaSem2, profilePhoto, registrationDate, isPaid, mentor } = student
    const { error } = await supabase.from('students').upsert({
      id,
      first_name: firstName,
      middle_name: middleName,
      last_name: lastName,
      email,
      roll_number: rollNumber,
      prn_number: prnNumber,
      date_of_birth: dateOfBirth,
      branch,
      division,
      gender,
      address,
      sgpa_sem1: sgpaSem1,
      sgpa_sem2: sgpaSem2,
      profile_photo: profilePhoto,
      registration_date: registrationDate,
      is_paid: isPaid,
      mentor
    })
    if (error) console.error('Student error:', email, error.message)
  }

  // Insert attendance and test_scores
  for (const student of students) {
    // Attendance
    if (student.attendance) {
      for (const [sessionId, status] of Object.entries(student.attendance)) {
        const { error } = await supabase.from('attendance').upsert({
          student_id: student.id,
          session_id: sessionId,
          status
        })
        if (error) console.error('Attendance error:', student.email, sessionId, error.message)
      }
    }
    // Test Scores
    if (student.testScores) {
      for (const [sessionId, score] of Object.entries(student.testScores)) {
        // Try to get answers if available
        let answers = []
        if (student.testAnswers && student.testAnswers[sessionId]) {
          answers = student.testAnswers[sessionId]
        }
        const { error } = await supabase.from('test_scores').upsert({
          student_id: student.id,
          session_id: sessionId,
          score,
          answers
        })
        if (error) console.error('Test score error:', student.email, sessionId, error.message)
      }
    }
  }

  // Insert tests and questions
  for (const session of sessions) {
    if (session.test) {
      // Insert test
      const { title, questions } = session.test
      const { data: testInsert, error: testError } = await supabase.from('tests').insert({
        session_id: session.id,
        title
      }).select()
      if (testError) {
        console.error('Test error:', session.id, testError.message)
        continue
      }
      const testId = testInsert && testInsert[0] && testInsert[0].id
      if (!testId) continue
      // Insert questions
      for (const q of questions) {
        const { error } = await supabase.from('questions').insert({
          test_id: testId,
          question: q.question,
          options: q.options,
          correct_answer: q.correctAnswer
        })
        if (error) console.error('Question error:', session.id, q.question, error.message)
      }
    }
  }

  console.log('Migration complete!')
}

migrate()

// Migration script to add 'testLink' column to 'sessions' table if it does not exist
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function addTestLinkColumn() {
  const { data, error } = await supabase.rpc('add_column_if_not_exists', {
    table_name: 'sessions',
    column_name: 'testLink',
    column_type: 'text'
  });
  if (error) {
    console.error('Error adding testLink column:', error.message);
  } else {
    console.log('testLink column added or already exists.');
  }
}

addTestLinkColumn(); 