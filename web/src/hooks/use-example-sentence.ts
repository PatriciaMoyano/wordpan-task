import { useState } from 'react'
import { generateExampleSentence, type ExampleSentenceResponse } from '@/lib/ai-service'

interface UseExampleSentenceResult {
  exampleSentence: ExampleSentenceResponse | null
  isGenerating: boolean
  error: string | null
  generate: (wordEnglish: string, wordSpanish: string) => Promise<void>
  reset: () => void
}

/**
 * Hook for generating example sentences for vocabulary words using AI
 * @returns Object with exampleSentence data, loading state, error, and generate/reset functions
 */
export function useExampleSentence(): UseExampleSentenceResult {
  const [exampleSentence, setExampleSentence] = useState<ExampleSentenceResponse | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generate = async (wordEnglish: string, wordSpanish: string) => {
    setIsGenerating(true)
    setError(null)
    setExampleSentence(null)

    try {
      const result = await generateExampleSentence(wordEnglish, wordSpanish)
      setExampleSentence(result)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate example sentence'
      setError(errorMessage)
      console.error('Error generating example sentence:', err)
    } finally {
      setIsGenerating(false)
    }
  }

  const reset = () => {
    setExampleSentence(null)
    setError(null)
  }

  return {
    exampleSentence,
    isGenerating,
    error,
    generate,
    reset,
  }
}
