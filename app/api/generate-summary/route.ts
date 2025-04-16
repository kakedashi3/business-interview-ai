import { openai } from "@ai-sdk/openai"
import { generateText } from "ai"
import { summaryPrompt } from "@/lib/prompts"

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()

    if (!messages || !Array.isArray(messages)) {
      return Response.json({ error: "Invalid messages format. Expected an array of messages." }, { status: 400 })
    }

    // Format the conversation for the summary
    const conversationForSummary = messages
      .map((msg) => `${msg.role === "assistant" ? "質問" : "回答"}: ${msg.content}`)
      .join("\n\n")

    // Generate summary using OpenAI
    const { text } = await generateText({
      model: openai("gpt-4o"), // Using a more reliable model
      prompt: `${summaryPrompt}\n\n${conversationForSummary}`,
      temperature: 0.7,
      maxTokens: 500,
    })

    return Response.json({ summary: text })
  } catch (error) {
    console.error("Error in generate-summary API:", error)
    return Response.json(
      { error: "Failed to generate summary", details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}
