'use client'

import { useEffect, useState } from "react"
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

export default function TestResultPage() {
  const params = useParams<{ id: string }>()
  const id = params.id
  const [test, setTest] = useState<Test | null>(null)
  const [result, setResult] = useState<{ score: number; answers: number[] } | null>(null)

  useEffect(() => {
    const fetchTestAndResult = async () => {
      try {
        const test = await supabaseApi.getTestById(id)
        if (!test) {
          setTest(null)
          setResult(null)
          return
        }
        setTest(test)

        const user = await supabaseApi.getCurrentUser()
        if (!user || !user.testScores || !user.testAnswers) {
          setResult(null)
          return
        }
        const score = user.testScores[id] || 0
        const answers = user.testAnswers[id] || []
        setResult({ score, answers })
      } catch (error) {
        console.error("Error fetching test or result:", error)
        setTest(null)
        setResult(null)
      }
    }
    fetchTestAndResult()
  }, [id])

  if (!test || !result) {
    return <div className="container mx-auto px-4 py-16 text-center text-red-600 font-semibold">Test result not found or not available. Please take the test from the dashboard.</div>
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">{test.title} - Result</h1>
      <div className="mb-4 text-lg font-semibold text-green-700 dark:text-green-400">
        Score: {result.score}% ({result.answers.filter((a, i) => a === test.questions[i]?.correctAnswer).length} / {test.questions.length} correct)
      </div>
      <div className="space-y-6">
        {test.questions.map((q, qIdx) => (
          <div key={q.id} className="p-4 bg-slate-100 dark:bg-slate-800 rounded">
            <div className="font-medium mb-2">Q{qIdx + 1}. {q.question}</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {q.options.map((opt, optIdx) => {
                const isCorrect = q.correctAnswer === optIdx
                const isSelected = result.answers[qIdx] === optIdx
                return (
                  <div
                    key={optIdx}
                    className={`flex items-center gap-2 p-2 rounded border ${isCorrect ? "border-green-500" : isSelected ? "border-blue-400" : "border-slate-200"} ${isSelected ? "bg-blue-100 dark:bg-blue-900" : ""}`}
                  >
                    <input
                      type="radio"
                      checked={isSelected}
                      readOnly
                      disabled
                    />
                    <span className={isCorrect ? "font-bold text-green-700 dark:text-green-400" : ""}>{opt}</span>
                    {isCorrect && <span className="ml-2 text-xs text-green-600">(Correct)</span>}
                    {isSelected && !isCorrect && <span className="ml-2 text-xs text-red-500">(Your Answer)</span>}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 