'use client'

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useParams } from "next/navigation"
import * as supabaseApi from "@/lib/supabaseApi"

interface Question {
  id: string
  question: string
  options: string[]
  correctAnswer: number
}

interface Test {
  id: string
  title: string
  questions: Question[]
}

export default function TakeTestPage() {
  const router = useRouter()
  const [test, setTest] = useState<Test | null>(null)
  const [answers, setAnswers] = useState<number[]>([])
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore] = useState<number | null>(null)

  // Use useParams to get the id from the route
  const params = useParams<{ id: string }>()
  const id = params.id

  useEffect(() => {
    const fetchTestAndSession = async () => {
      try {
        const testId = id;
        const sessionId = localStorage.getItem("session_id");

        if (!sessionId) {
          setTest(null);
          setAnswers([]);
          return;
        }

        const testRes = await supabaseApi.getTestById(testId);
        const sessionRes = await supabaseApi.getSessionById(sessionId);

        if (!testRes.data || !sessionRes.data) {
          setTest(null);
          setAnswers([]);
          return;
        }

        const testData = testRes.data;
        const sessionData = sessionRes.data;

        if (testData.id !== testId || sessionData.id !== sessionId) {
          setTest(null);
          setAnswers([]);
          return;
        }

        if (sessionData.status !== "active" || !sessionData.test) {
          setTest(null);
          setAnswers([]);
          return;
        }

        setTest(testData);
        setAnswers(Array(testData.questions.length).fill(-1));
      } catch (error) {
        console.error("Error fetching test or session:", error);
        setTest(null);
        setAnswers([]);
      }
    };

    fetchTestAndSession();
  }, [id]);

  if (!test) {
    return <div className="container mx-auto px-4 py-16 text-center text-red-600 font-semibold">Test is not available for this session. Please use the Take Test button for an active session.</div>
  }

  const handleOptionChange = (qIdx: number, optIdx: number) => {
    setAnswers((prev) => prev.map((a, i) => (i === qIdx ? optIdx : a)))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    let sc = 0
    test.questions.forEach((q, i) => {
      if (answers[i] === q.correctAnswer) sc++
    })
    setScore(sc)
    setSubmitted(true)

    try {
      const sessionId = localStorage.getItem("session_id");
      if (!sessionId) {
        console.error("Session ID not found.");
        return;
      }

      await supabaseApi.updateSessionTestScore(sessionId, id, sc);
      await supabaseApi.updateSessionTestAnswers(sessionId, id, answers);

      // Dispatch event to update donut graph and force dashboard refresh
      window.dispatchEvent(new Event("storage"));
      window.dispatchEvent(new CustomEvent("attendanceUpdated"));

    } catch (error) {
      console.error("Error submitting test:", error);
    }

    setTimeout(() => {
      router.refresh && router.refresh()
      router.push(`/test-result/${id}`)
    }, 1200)
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">{test.title}</h1>
        <p className="text-slate-600 dark:text-slate-300">Answer all questions below. Click <b>Submit Test</b> when done.</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-8">
        {test.questions.map((q, qIdx) => (
          <div key={q.id} className="p-6 bg-white dark:bg-slate-800 rounded-xl shadow border border-slate-200 dark:border-slate-700 mb-2">
            <div className="font-semibold text-lg mb-3">Q{qIdx + 1}. {q.question}</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {q.options.map((opt, optIdx) => (
                <label key={optIdx} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${answers[qIdx] === optIdx ? "bg-blue-100 dark:bg-blue-900 border-blue-400" : "border-slate-200 dark:border-slate-700"}`}>
                  <input
                    type="radio"
                    name={`q-${qIdx}`}
                    checked={answers[qIdx] === optIdx}
                    onChange={() => handleOptionChange(qIdx, optIdx)}
                    disabled={submitted}
                    className="accent-blue-600 w-4 h-4"
                  />
                  <span className="text-base">{opt}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
        <div className="flex justify-end gap-2 mt-6">
          <button
            type="submit"
            className="btn btn-primary text-lg px-8 py-3 rounded-lg shadow-lg"
            disabled={submitted || answers.includes(-1)}
          >
            {submitted ? "Submitted" : "Submit Test"}
          </button>
        </div>
        {submitted && score !== null && (
          <div className="text-green-600 font-semibold text-center mt-4">
            Test submitted! Your score: {score} / {test.questions.length}
          </div>
        )}
      </form>
    </div>
  )
} 