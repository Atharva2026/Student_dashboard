import { supabase } from './supabaseClient'

// STUDENTS
export async function getStudents() {
  const { data, error } = await supabase.from('students').select('*')
  if (error) throw error
  return data
}

export async function getStudentById(id: string) {
  const { data, error } = await supabase.from('students').select('*').eq('id', id).single()
  if (error) throw error
  return data
}

export async function createOrUpdateStudent(student: any) {
  const { data, error } = await supabase.from('students').upsert(student).select()
  if (error) throw error
  return data
}

export async function deleteStudent(id: string) {
  const { error } = await supabase.from('students').delete().eq('id', id)
  if (error) throw error
}

// SESSIONS
export async function getSessions() {
  const { data, error } = await supabase.from('sessions').select('*')
  if (error) throw error
  return data
}

export async function getSessionById(id: string) {
  const { data, error } = await supabase.from('sessions').select('*').eq('id', id).single()
  if (error) throw error
  return data
}

export async function createOrUpdateSession(session: any) {
  const { data, error } = await supabase.from('sessions').upsert(session).select()
  if (error) throw error
  return data
}

export async function deleteSession(id: string) {
  const { error } = await supabase.from('sessions').delete().eq('id', id)
  if (error) throw error
}

// Add a new session
export async function addSession(session: any) {
  const { error } = await supabase.from('sessions').insert(session)
  return { error }
}

// Update an existing session by id
export async function updateSession(session: any) {
  const { error } = await supabase.from('sessions').update(session).eq('id', session.id)
  return { error }
}

// TESTS
export async function getTests() {
  const { data, error } = await supabase.from('tests').select('*')
  if (error) throw error
  return data
}

export async function getTestBySessionId(session_id: string) {
  const { data, error } = await supabase.from('tests').select('*').eq('session_id', session_id).single()
  if (error) throw error
  return data
}

export async function createTest(test: any) {
  // Remove id if present
  const { id, ...testWithoutId } = test;
  console.log('createTest payload:', testWithoutId);
  const { data, error } = await supabase.from('tests').insert(testWithoutId).select()
  if (error) throw error
  return data
}

export async function deleteTest(id: string) {
  const { error } = await supabase.from('tests').delete().eq('id', id)
  if (error) throw error
}

// Fetch a test by its id
export async function getTestById(id: string) {
  const { data, error } = await supabase.from('tests').select('*').eq('id', id).single()
  if (error) throw error
  return data
}

// Update the test score for a session and test
export async function updateSessionTestScore(sessionId: string, testId: string, score: number) {
  // Assuming student_id is stored in localStorage
  const student_id = localStorage.getItem('student_id');
  if (!student_id) throw new Error('No student_id found in localStorage');
  const { data, error } = await supabase.from('test_scores').upsert({
    student_id,
    session_id: sessionId,
    test_id: testId,
    score
  }).select();
  if (error) throw error;
  return data;
}

// Update the test answers for a session and test
export async function updateSessionTestAnswers(sessionId: string, testId: string, answers: number[]) {
  // Assuming student_id is stored in localStorage
  const student_id = localStorage.getItem('student_id');
  if (!student_id) throw new Error('No student_id found in localStorage');
  const { data, error } = await supabase.from('test_scores').upsert({
    student_id,
    session_id: sessionId,
    test_id: testId,
    answers
  }).select();
  if (error) throw error;
  return data;
}

// Get current user info from localStorage (client-side only)
export async function getCurrentUser() {
  if (typeof window === 'undefined') return null;
  const student_id = localStorage.getItem('student_id');
  if (!student_id) return null;
  // Fetch test scores and answers for this user
  const { data, error } = await supabase.from('test_scores').select('*').eq('student_id', student_id);
  if (error) throw error;
  const testScores: Record<string, number> = {};
  const testAnswers: Record<string, number[]> = {};
  for (const rec of data) {
    if (rec.test_id) {
      testScores[rec.test_id] = rec.score;
      testAnswers[rec.test_id] = rec.answers || [];
    }
  }
  return { id: student_id, testScores, testAnswers };
}

// QUESTIONS
export async function getQuestionsByTestId(test_id: string) {
  const { data, error } = await supabase.from('questions').select('*').eq('test_id', test_id)
  if (error) throw error
  return data
}

export async function createQuestion(question: any) {
  const { data, error } = await supabase.from('questions').insert(question).select()
  if (error) throw error
  return data
}

export async function deleteQuestion(id: string) {
  const { error } = await supabase.from('questions').delete().eq('id', id)
  if (error) throw error
}

// ATTENDANCE
export async function getAttendance(student_id: string) {
  const { data, error } = await supabase.from('attendance').select('*').eq('student_id', student_id)
  if (error) throw error
  return data
}

// Helper: returns { [session_id]: status }
export async function getAttendanceByStudentId(student_id: string) {
  const records = await getAttendance(student_id)
  const result: Record<string, string> = {}
  for (const rec of records) {
    result[rec.session_id] = rec.status
  }
  return result
}

export async function setAttendance({ student_id, session_id, status }: { student_id: string, session_id: string, status: string }) {
  // Try insert first
  let { data, error } = await supabase
    .from('attendance')
    .insert([{ student_id, session_id, status }])
    .select();
  if (error && error.code === '23505') { // unique violation
    // If already exists, update instead
    ({ data, error } = await supabase
      .from('attendance')
      .update({ status })
      .eq('student_id', student_id)
      .eq('session_id', session_id)
      .select());
  }
  console.log('Supabase attendance response:', { data, error });
  if (error) throw error;
  return data;
}

// TEST SCORES
export async function getTestScores(student_id: string) {
  const { data, error } = await supabase.from('test_scores').select('*').eq('student_id', student_id)
  if (error) throw error
  return data
}

// Helper: returns { [session_id]: score }
export async function getTestScoresByStudentId(student_id: string) {
  const records = await getTestScores(student_id)
  const result: Record<string, number> = {}
  for (const rec of records) {
    result[rec.session_id] = rec.score
  }
  return result
}

export async function setTestScore({ student_id, session_id, score, answers }: { student_id: string, session_id: string, score: number, answers: any }) {
  const { data, error } = await supabase.from('test_scores').upsert({ student_id, session_id, score, answers }).select()
  if (error) throw error
  return data
} 

// Get all attendance statuses for a student
export async function getAttendanceData(student_id: string) {
  const { data, error } = await supabase
    .from('attendance')
    .select('status')
    .eq('student_id', student_id);
  if (error) throw error;
  return data ? data.map((row: any) => row.status) : [];
}

// Get all test scores for a student
export async function getScoreData(student_id: string) {
  const { data, error } = await supabase
    .from('test_scores')
    .select('score')
    .eq('student_id', student_id);
  if (error) throw error;
  return data ? data.map((row: any) => row.score) : [];
} 