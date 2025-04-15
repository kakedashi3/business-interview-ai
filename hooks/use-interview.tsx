"use client"

import { useState, useCallback } from "react"
import type { Message } from "@/types"

export function useInterview() {
  const [messages, setMessages] = useState<Message[]>([])
  const [currentQuestion, setCurrentQuestion] = useState<string>("")
  const [isInterviewStarted, setIsInterviewStarted] = useState(false)
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false)
  const [summary, setSummary] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const startInterview = useCallback(async () => {
    setIsInterviewStarted(true)
    setError(null)

    try {
      const response = await fetch("/api/generate-question", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [],
          isFirstQuestion: true,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to generate first question")
      }

      const data = await response.json()

      if (!data.question) {
        throw new Error("Invalid response format from API")
      }

      const firstQuestion = data.question
      setCurrentQuestion(firstQuestion)
      setMessages([{ role: "assistant", content: firstQuestion }])
    } catch (error) {
      console.error("Error starting interview:", error)
      setError("インタビューを開始できませんでした。もう一度お試しください。")
      setCurrentQuestion("インタビューを開始できませんでした。もう一度お試しください。")
    }
  }, [])

  const submitAnswer = useCallback(
    async (answer: string) => {
      setError(null)

      // Add user's answer to messages
      const updatedMessages = [...messages, { role: "user", content: answer }]
      setMessages(updatedMessages)

      try {
        const response = await fetch("/api/generate-question", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: updatedMessages,
            isFirstQuestion: false,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || "Failed to generate next question")
        }

        const data = await response.json()

        if (!data.question) {
          throw new Error("Invalid response format from API")
        }

        const nextQuestion = data.question
        setCurrentQuestion(nextQuestion)
        setMessages((prev) => [...prev, { role: "assistant", content: nextQuestion }])
      } catch (error) {
        console.error("Error generating next question:", error)
        setError("次の質問を生成できませんでした。もう一度お試しください。")
        setCurrentQuestion("次の質問を生成できませんでした。もう一度お試しください。")
      }
    },
    [messages],
  )

  const generateSummary = useCallback(async () => {
    if (messages.length < 4) {
      setError("要約を生成するには、少なくとも2つの質問と回答が必要です。")
      return
    }

    setIsGeneratingSummary(true)
    setError(null)

    try {
      console.log("Generating summary for messages:", messages)

      const response = await fetch("/api/generate-summary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("Error response from API:", errorData)
        throw new Error(errorData.error || "Failed to generate summary")
      }

      const data = await response.json()

      if (!data.summary) {
        throw new Error("Invalid response format from API")
      }

      setSummary(data.summary)
    } catch (error) {
      console.error("Error generating summary:", error)
      setError("要約を生成できませんでした。もう一度お試しください。")
    } finally {
      setIsGeneratingSummary(false)
    }
  }, [messages])

  return {
    messages,
    currentQuestion,
    isInterviewStarted,
    isGeneratingSummary,
    summary,
    error,
    startInterview,
    submitAnswer,
    generateSummary,
  }
}
