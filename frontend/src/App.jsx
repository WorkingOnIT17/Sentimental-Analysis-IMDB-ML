import { useEffect, useState } from 'react'
import { checkHealth, predictSentiment } from './api/sentiment'
import './App.css'

const EXAMPLES = [
  'An absolutely breathtaking film with stunning performances and a story that stays with you.',
  'Waste of time. Flat acting, predictable plot, and zero emotional payoff.',
  'It had its moments, but the pacing dragged and the ending felt rushed.',
]

function ConfidenceBar({ label, value, tone }) {
  return (
    <div className="confidence-row">
      <div className="confidence-label">
        <span>{label}</span>
        <span>{Math.round(value * 100)}%</span>
      </div>
      <div className="confidence-track">
        <div
          className={`confidence-fill confidence-fill--${tone}`}
          style={{ width: `${value * 100}%` }}
        />
      </div>
    </div>
  )
}

function ResultCard({ result }) {
  const isPositive = result.sentiment === 'positive'

  return (
    <section className={`result-card result-card--${result.sentiment}`} aria-live="polite">
      <div className="result-badge">{isPositive ? 'Positive' : 'Negative'}</div>
      <h2 className="result-headline">
        {isPositive
          ? 'This review reads as uplifting.'
          : 'This review reads as critical.'}
      </h2>
      <p className="result-confidence">
        Model confidence: <strong>{Math.round(result.confidence * 100)}%</strong>
      </p>

      <div className="confidence-stack">
        <ConfidenceBar
          label="Positive"
          value={result.probabilities.positive}
          tone="positive"
        />
        <ConfidenceBar
          label="Negative"
          value={result.probabilities.negative}
          tone="negative"
        />
      </div>
    </section>
  )
}

export default function App() {
  const [text, setText] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [apiOnline, setApiOnline] = useState(null)

  useEffect(() => {
    checkHealth()
      .then(setApiOnline)
      .catch(() => setApiOnline(false))
  }, [])

  async function handleSubmit(event) {
    event.preventDefault()
    const trimmed = text.trim()

    if (!trimmed) {
      setError('Please enter a review before analyzing.')
      setResult(null)
      return
    }

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const prediction = await predictSentiment(trimmed)
      setResult(prediction)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function handleExample(example) {
    setText(example)
    setError('')
    setResult(null)
  }

  return (
    <div className="app-shell">
      <div className="backdrop" aria-hidden="true" />

      <main className="layout">
        <header className="hero">
          <p className="eyebrow">Movie Review Sentiment</p>
          <h1>Analyze how a review feels</h1>
          <p className="subtitle">
            Paste a movie review below. Your trained scikit-learn model will classify it as
            positive or negative through the FastAPI backend.
          </p>
          <div className={`status-pill status-pill--${apiOnline ? 'online' : 'offline'}`}>
            <span className="status-dot" />
            {apiOnline === null
              ? 'Checking API...'
              : apiOnline
                ? 'Backend connected'
                : 'Backend offline — start FastAPI on port 8000'}
          </div>
        </header>

        <section className="panel">
          <form className="review-form" onSubmit={handleSubmit}>
            <label htmlFor="review-input" className="field-label">
              Review text
            </label>
            <textarea
              id="review-input"
              className="review-input"
              placeholder="Write or paste a movie review here..."
              value={text}
              onChange={(event) => setText(event.target.value)}
              rows={8}
              maxLength={10000}
              disabled={loading}
            />

            <div className="form-footer">
              <span className="char-count">{text.length.toLocaleString()} / 10,000</span>
              <button type="submit" className="submit-button" disabled={loading || !text.trim()}>
                {loading ? 'Analyzing...' : 'Analyze sentiment'}
              </button>
            </div>
          </form>

          <div className="examples">
            <p>Try an example</p>
            <div className="example-list">
              {EXAMPLES.map((example) => (
                <button
                  key={example}
                  type="button"
                  className="example-chip"
                  onClick={() => handleExample(example)}
                  disabled={loading}
                >
                  {example.slice(0, 72)}...
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="message message--error" role="alert">
              {error}
            </div>
          )}

          {result && <ResultCard result={result} />}
        </section>
      </main>
    </div>
  )
}
