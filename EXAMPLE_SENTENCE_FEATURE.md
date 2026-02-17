# Example Sentence Feature

## Overview

This feature allows users to generate contextual example sentences for vocabulary words using AI. It's integrated into the Study Mode of the Flashcards page.

## How It Works

### User Flow

1. User navigates to **Flashcards** page and selects **Study Mode** tab
2. User reviews vocabulary flashcards (click to flip between English and Spanish)
3. User clicks **"Generate Example Sentence with AI"** button
4. AI generates:
   - A contextual example sentence in English using the word
   - Accurate Spanish translation
   - Brief explanation of usage/grammar notes

### Example

**Flashcard:** apple → manzana

**AI generates:**
- English: "I eat an apple every morning."
- Spanish: "Como una manzana cada mañana."
- Explanation: "This sentence demonstrates the use of 'apple' in a common daily routine context, showing present tense usage."

## Technical Implementation

### Backend (Python)

**New CrewAI Crew:** `example_sentence_crew`

Location: `ai/src/crews/example_sentence_crew/`

```
example_sentence_crew/
├── config/
│   ├── agents.yaml      # Language teacher agent configuration
│   └── tasks.yaml       # Example sentence generation task
├── crew.py             # Crew implementation
└── schemas.py          # Pydantic models for input/output
```

**API Endpoint:** `POST /api/generate-example-sentence`

Request:
```json
{
  "word_english": "apple",
  "word_spanish": "manzana"
}
```

Response:
```json
{
  "sentence_english": "I eat an apple every morning.",
  "sentence_spanish": "Como una manzana cada mañana.",
  "explanation": "This sentence demonstrates..."
}
```

**Personalization:** The AI crew uses user profile data:
- `full_name` - For personalization
- `language_level` - Adjusts complexity (beginner/intermediate/advanced)
- `learning_goal` - Tailors examples to user's objectives

### Frontend (React + TypeScript)

**New Hook:** `use-example-sentence.ts`

```typescript
const { exampleSentence, isGenerating, error, generate, reset } = useExampleSentence();

// Generate example
await generate("apple", "manzana");
```

**Updated Component:** `pages/flashcards.tsx`

- Added Study Mode tab with individual flashcard navigation
- Integrated "Generate Example Sentence" button
- Display area for generated sentences with proper formatting

**New Service Function:** `ai-service.ts`

```typescript
export async function generateExampleSentence(
  wordEnglish: string,
  wordSpanish: string
): Promise<ExampleSentenceResponse>
```

### Database Changes

**New Migration:** `20260216181224_add_profile_fields_for_learning.sql`

Added fields to `profiles` table:
- `full_name` - User's full name
- `language_level` - Current proficiency (default: 'intermediate')
- `learning_goal` - Learning objective (default: 'general language learning')

⚠️ **Important:** Developer must manually apply this migration using Supabase CLI.

## Features

✅ **Single LLM call** per request (efficient)  
✅ **Personalized** based on user profile  
✅ **Contextual** - examples relevant to everyday situations  
✅ **Educational** - includes explanations and usage notes  
✅ **Error handling** with user-friendly messages  
✅ **Loading states** for better UX  
✅ **JWT authentication** required

## UI Features

- **Tab-based interface** - Study Mode + Memory Game in same page
- **Flashcard navigation** - Previous/Next buttons
- **Progress indicator** - "Card X of Y"
- **Flip animation** - Click card to flip between English/Spanish
- **Example sentence panel** - Collapsible display with formatted sections
- **Error alerts** - Clear error messages if generation fails

## Configuration

### Backend Environment Variables

Required in `ai/.env`:
```bash
GROQ_API_KEY=your_groq_api_key
SUPABASE_URL=http://host.docker.internal:54321
SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Frontend Environment Variables

Required in `web/.env.local`:
```bash
VITE_AI_SERVICE_URL=http://localhost:8000
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## OpenTelemetry Tracing

All AI operations are traced via OpenTelemetry and sent to Arize Phoenix for observability.

View traces at: http://localhost:6006

## Future Enhancements

Potential improvements:
- [ ] Cache generated sentences to avoid regenerating
- [ ] Allow users to save favorite examples
- [ ] Add audio pronunciation for sentences
- [ ] Support multiple difficulty levels
- [ ] Batch generation for multiple words
- [ ] Quiz mode based on generated sentences
