import { openai } from "@ai-sdk/openai"
import { generateText } from "ai"
import { initialPrompt } from "@/lib/prompts"
import type { Message } from "@/types"

export async function POST(req: Request) {
  try {
    const { messages, isFirstQuestion } = await req.json()

    // For the first question, use a simpler prompt
    if (isFirstQuestion) {
      const { text } = await generateText({
        model: openai("gpt-4o"), // Using a more reliable model
        prompt:
          "あなたは業務ナレッジを収集するインタビュアーです。インタビューの最初の質問として、相手の業種・業界や担当業務について尋ねてください。質問は1つだけ、簡潔に作成してください。",
        temperature: 0.7,
      })

      return Response.json({ question: text })
    }

    // For follow-up questions, use the conversation history
    const formattedMessages: Message[] = [{ role: "system", content: initialPrompt }]

    // Add previous messages if they exist
    if (messages && messages.length > 0) {
      // Only include the last few messages to keep the context manageable
      const recentMessages = messages.slice(-6)
      formattedMessages.push(...recentMessages)
    }

    // Generate question using OpenAI
    const { text } = await generateText({
      model: openai("gpt-4o"), // Using a more reliable model
      messages: formattedMessages,
      temperature: 0.7,
    })

    return Response.json({ question: text })
  } catch (error) {
    console.error("Error in generate-question API:", error)
    return Response.json(
      { error: "Failed to generate question", details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}
