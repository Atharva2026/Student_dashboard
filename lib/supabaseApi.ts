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
  // Handle both camelCase and snake_case properties
  const dbStudent = {
    id: student.id,
    first_name: student.firstName || student.first_name,
    middle_name: student.middleName || student.middle_name,
    last_name: student.lastName || student.last_name,
    email: student.email,
    roll_number: student.rollNumber || student.roll_number,
    prn_number: student.prnNumber || student.prn_number,
    date_of_birth: student.dateOfBirth || student.date_of_birth,
    branch: student.branch,
    division: student.division,
    gender: student.gender,
    address: student.address,
    sgpa_sem1: student.sgpaSem1 || student.sgpa_sem1,
    sgpa_sem2: student.sgpaSem2 || student.sgpa_sem2,
    profile_photo: student.profilePhoto || student.profile_photo,
    registration_date: student.registrationDate || student.registration_date,
    is_paid: student.isPaid !== undefined ? student.isPaid : (student.is_paid !== undefined ? student.is_paid : false),
    mentor: student.mentor
  }
  
  const { data, error } = await supabase.from('students').upsert(dbStudent).select()
  if (error) {
    console.error('Error saving student:', error)
    throw error
  }
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
  
  console.log('Updating test score:', { student_id, session_id: sessionId, test_id: testId, score });
  
  const { data, error } = await supabase.from('test_scores').upsert({
    student_id,
    session_id: sessionId,
    test_id: testId,
    score,
    answers: [] // Initialize with empty array if not provided
  }).select();
  
  if (error) {
    console.error('Error updating test score:', error);
    throw error;
  }
  console.log('Test score updated successfully:', data);
  return data;
}

// Update the test answers for a session and test
export async function updateSessionTestAnswers(sessionId: string, testId: string, answers: number[]) {
  // Assuming student_id is stored in localStorage
  const student_id = localStorage.getItem('student_id');
  if (!student_id) throw new Error('No student_id found in localStorage');
  
  console.log('Updating test answers:', { student_id, session_id: sessionId, test_id: testId, answers });
  
  // First check if record exists
  const { data: existing, error: checkError } = await supabase
    .from('test_scores')
    .select('*')
    .eq('student_id', student_id)
    .eq('session_id', sessionId)
    .eq('test_id', testId)
    .single();
    
  if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "not found"
    console.error('Error checking existing record:', checkError);
    throw checkError;
  }
  
  const { data, error } = await supabase.from('test_scores').upsert({
    student_id,
    session_id: sessionId,
    test_id: testId,
    score: existing?.score || 0,
    answers
  }).select();
  
  if (error) {
    console.error('Error updating test answers:', error);
    throw error;
  }
  console.log('Test answers updated successfully:', data);
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
  console.log('Getting attendance for student:', student_id);
  const records = await getAttendance(student_id)
  console.log('Attendance records:', records);
  const result: Record<string, string> = {}
  for (const rec of records) {
    result[rec.session_id] = rec.status
  }
  console.log('Processed attendance result:', result);
  return result
}
/*
export async function setAttendance({
  student_id,
  session_id,
  status,
}: {
  student_id: string;
  session_id: string;
  status: string;
}) {
  console.log('🚀 setAttendance called with:', {
    student_id,
    session_id,
    status,
  });

  if (!student_id || !session_id || !status) {
    console.error('❌ Invalid attendance input:', {
      student_id,
      session_id,
      status,
    });
    throw new Error('Invalid attendance data');
  }

  const { data, error } = await supabase
    .from('attendance')
    .insert({ student_id, session_id, status })
    .select();

  console.log('🧾 insert response:', { data, error });

  if (error) {
    console.error('❌ Insert error:', error);
    throw error;
  }

  if (!data || data.length === 0) {
    console.warn('⚠️ Insert succeeded but returned no data');
  } else {
    console.log('✅ Attendance insert successful:', data);
  }

  return data || [];
}
*/
//import { supabase } from './supabaseClient'
//import { supabase } from './supabaseClient';

export async function setAttendance({
  student_id,
  session_id,
  status,
}: {
  student_id: string;
  session_id: string;
  status: string;
}) {
  console.log('🚀 setAttendance called with:', {
    student_id,
    session_id,
    status,
  });

  if (!student_id || !session_id || !status) {
    console.error('❌ Invalid attendance input:', {
      student_id,
      session_id,
      status,
    });
    alert('❌ Invalid attendance data. Missing fields.');
    throw new Error('Invalid attendance data');
  }

  const { data, error } = await supabase
    .from('attendance')
    .insert({ student_id, session_id, status })
    .select();

  console.log('🧾 insert response:', { data, error });

  if (error) {
    console.error('❌ Insert error:', error);
    alert('❌ Attendance insert failed: ' + error.message);
    throw error;
  }

  if (!data || data.length === 0) {
    console.warn('⚠️ Insert succeeded but returned no data — possible RLS block');
    alert('⚠️ Attendance insert may be blocked by RLS. Check Supabase policies.');
  } else {
    console.log('✅ Attendance insert successful:', data);
    alert('✅ Attendance marked and stored successfully!');
  }

  return data || [];
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

export async function setTestScore({ student_id, session_id, test_id, score, answers }: { student_id: string, session_id: string, test_id?: string, score: number, answers: any }) {
  console.log('Setting test score:', { student_id, session_id, test_id, score, answers });
  
  const scoreData: any = { student_id, session_id, score, answers };
  if (test_id) {
    scoreData.test_id = test_id;
  }
  
  const { data, error } = await supabase.from('test_scores').upsert(scoreData).select()
  if (error) {
    console.error('Error setting test score:', error);
    throw error;
  }
  console.log('Test score set successfully:', data);
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