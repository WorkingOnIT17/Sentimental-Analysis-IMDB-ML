const API_BASE = import.meta.env.VITE_API_URL ?? '/api'

export async function predictSentiment(text) {
  const response = await fetch(`${API_BASE}/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    const detail = data.detail
    const message = Array.isArray(detail)
      ? detail.map((item) => item.msg).join(' ')
      : detail
    throw new Error(message ?? 'Unable to analyze sentiment. Please try again.')
  }

  return data
}

export async function checkHealth() {
  const response = await fetch(`${API_BASE}/health`)
  return response.ok
}
