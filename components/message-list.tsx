import type { Message } from "@/types"

interface MessageListProps {
  messages: Message[]
}

export function MessageList({ messages }: MessageListProps) {
  return (
    <div className="space-y-4">
      {messages.map((message, index) => (
        <div key={index} className={`flex ${message.role === "assistant" ? "justify-start" : "justify-end"}`}>
          <div
            className={`max-w-[80%] p-3 rounded-lg ${
              message.role === "assistant" ? "bg-gray-100 text-gray-800" : "bg-blue-500 text-white"
            }`}
          >
            <p className="whitespace-pre-wrap">{message.content}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
