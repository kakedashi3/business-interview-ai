"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { useInterview } from "@/hooks/use-interview"
import { MessageList } from "@/components/message-list"
import { Summary } from "@/components/summary"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function InterviewPage() {
  const {
    messages,
    currentQuestion,
    isInterviewStarted,
    isGeneratingSummary,
    summary,
    error,
    startInterview,
    submitAnswer,
    generateSummary,
  } = useInterview()

  const [answer, setAnswer] = useState("")
  const [showTimeNotification, setShowTimeNotification] = useState(false)
  const [characterCount, setCharacterCount] = useState(0)

  // Calculate total character count from all answers
  useEffect(() => {
    const totalChars = messages.filter((msg) => msg.role === "user").reduce((acc, msg) => acc + msg.content.length, 0)

    setCharacterCount(totalChars)

    // Show notification when character count exceeds 1350
    if (totalChars > 1350 && !showTimeNotification) {
      setShowTimeNotification(true)
    }
  }, [messages, showTimeNotification])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!answer.trim()) return

    await submitAnswer(answer)
    setAnswer("")
  }

  return (
    <div className="container mx-auto max-w-3xl py-8 px-4">
      <h1 className="text-2xl font-bold mb-6 text-center">業務ナレッジ収集インタビューAI</h1>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {showTimeNotification && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4">
          <p>5分経過しました。そろそろ終了に向かいましょう。</p>
        </div>
      )}

      {messages.length > 0 && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <MessageList messages={messages} />
          </CardContent>
        </Card>
      )}

      {summary && <Summary summary={summary} />}

      {!isInterviewStarted ? (
        <div className="flex justify-center">
          <Button onClick={startInterview} size="lg">
            インタビューを開始する
          </Button>
        </div>
      ) : (
        <>
          <Card className="mb-6">
            <CardContent className="pt-6">
              {/* 会話履歴の最後のメッセージが質問でない場合のみ現在の質問を表示 */}
              {(!messages.length || messages[messages.length - 1].role !== "assistant") && (
                <p className="font-medium mb-4">{currentQuestion}</p>
              )}
              <form onSubmit={handleSubmit}>
                <Textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="ここに回答を入力してください..."
                  className="min-h-[120px] mb-4"
                />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">文字数: {characterCount}</span>
                  <div className="space-x-2">
                    <Button type="submit" disabled={!answer.trim()}>
                      回答を送信
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={generateSummary}
                      disabled={messages.length < 4 || isGeneratingSummary}
                    >
                      {isGeneratingSummary ? "生成中..." : "要約を表示"}
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
