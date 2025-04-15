interface SummaryProps {
  summary: string
}

export function Summary({ summary }: SummaryProps) {
  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
      <h2 className="text-lg font-semibold mb-2">インタビュー要約</h2>
      <div className="whitespace-pre-wrap">{summary}</div>
    </div>
  )
}
