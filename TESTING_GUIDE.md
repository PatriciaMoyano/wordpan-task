# Quick Start Guide - Example Sentence Feature

## 🚀 Setup Instructions

### 1. Apply Database Migration

**⚠️ IMPORTANT:** You must manually apply the database migration to add the new profile fields.

```bash
# In the project root
supabase db push
```

Or apply manually in Supabase Studio (http://127.0.0.1:54323):
- Navigate to SQL Editor
- Run the contents of: `supabase/migrations/20260216181224_add_profile_fields_for_learning.sql`

### 2. Start All Services

```bash
# Option 1: Use Docker Compose (recommended)
docker compose up --build

# Option 2: Start services individually
# Terminal 1 - Supabase
supabase start

# Terminal 2 - Backend
cd ai
uv run python run.py

# Terminal 3 - Frontend  
cd web
npm run dev

# Terminal 4 - Phoenix (optional, for observability)
docker compose up phoenix phoenix-db
```

### 3. Configure Environment Variables

Make sure you have the required environment variables set:

**Backend (`ai/.env`):**
```bash
GROQ_API_KEY=gsk_your_key_here
SUPABASE_URL=http://host.docker.internal:54321
SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Frontend (`web/.env.local`):**
```bash
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_AI_SERVICE_URL=http://localhost:8000
```

## 🧪 Testing the Feature

### 1. Create Test User (if needed)

```bash
# Navigate to: http://localhost:5173/auth/signup
# Create a test account
```

### 2. Add Words to Database

```bash
# Navigate to: http://localhost:5173/words
# Add some word pairs (format: english - spanish)
# Examples:
# - apple - manzana
# - book - libro
# - house - casa
```

### 3. Update User Profile (Optional)

```sql
-- In Supabase Studio SQL Editor or via psql
UPDATE public.profiles
SET 
  full_name = 'John Doe',
  language_level = 'intermediate',
  learning_goal = 'travel and conversation'
WHERE id = 'your-user-id';
```

### 4. Test Example Sentence Generation

1. Navigate to **Flashcards** page: http://localhost:5173/flashcards
2. Click on **"Study Mode"** tab
3. You'll see your first flashcard with the English word
4. Click the card to flip and see the Spanish translation
5. Click **"Generate Example Sentence with AI"** button
6. Wait for AI to generate the example (usually 2-5 seconds)
7. Review the generated sentence, translation, and explanation
8. Use Previous/Next buttons to navigate between words

### 5. Verify in Phoenix (Optional)

View AI traces and performance metrics:
- Open http://localhost:6006
- Navigate to "Traces" section
- Look for traces from the Example Sentence crew

## 🐛 Troubleshooting

### Error: "GROQ_API_KEY is not set"

**Solution:** Add your Groq API key to `ai/.env`
```bash
echo "GROQ_API_KEY=your_key_here" >> ai/.env
```

Get a free key at: https://console.groq.com

### Error: "Authentication failed"

**Solution:** 
- Make sure you're logged in
- Check that Supabase is running (`supabase status`)
- Verify SUPABASE_ANON_KEY is correct in both frontend and backend

### Error: "Failed to generate example sentence"

**Solutions:**
1. Check backend logs for detailed error
2. Verify the word format is "english - spanish"
3. Ensure database migration was applied
4. Check that AI backend is running on port 8000

### Words not showing in flashcards

**Solution:** 
- Go to Words page and add some words
- Refresh the Flashcards page
- Check browser console for errors

## 📊 Expected Behavior

✅ **Successful generation:**
- Loading state appears immediately
- Example appears in 2-5 seconds
- Shows English sentence, Spanish translation, and explanation

✅ **Error handling:**
- Clear error message if API key is missing
- Authentication errors shown with red alert
- Network errors handled gracefully

✅ **Navigation:**
- Previous button disabled on first card
- Next button disabled on last card
- Example resets when navigating to new word

## 🎯 Feature Checklist

- [ ] Database migration applied successfully
- [ ] All services running (backend, frontend, Supabase)
- [ ] Test user created and logged in
- [ ] At least 3 words added to database
- [ ] Can navigate between flashcards
- [ ] Can flip cards to see translation
- [ ] "Generate Example Sentence" button works
- [ ] Example sentences display correctly
- [ ] Error handling works (try with invalid API key)
- [ ] Navigation Previous/Next buttons work
- [ ] Can switch between Study Mode and Memory Game tabs

## 📝 API Testing with cURL

Test the backend endpoint directly:

```bash
# Get your JWT token from browser localStorage
# Key: sb-<project-ref>-auth-token

curl -X POST http://localhost:8000/api/generate-example-sentence \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "word_english": "apple",
    "word_spanish": "manzana"
  }'
```

Expected response:
```json
{
  "sentence_english": "I eat an apple every morning.",
  "sentence_spanish": "Como una manzana cada mañana.",
  "explanation": "This sentence demonstrates the use of 'apple' in a common daily routine context."
}
```

## 🎉 Success Criteria

Your feature is working correctly if:

1. ✅ You can see flashcards in Study Mode
2. ✅ Clicking "Generate Example Sentence" shows loading state
3. ✅ AI generates a relevant example sentence
4. ✅ Both English and Spanish sentences are grammatically correct
5. ✅ Explanation provides useful learning context
6. ✅ Navigation between words works smoothly
7. ✅ Errors are handled gracefully with user-friendly messages

## 📚 Additional Resources

- [CrewAI Documentation](https://docs.crewai.com)
- [Supabase Documentation](https://supabase.com/docs)
- [Groq API Documentation](https://console.groq.com/docs)
- [Project README](./README.md)
- [Feature Documentation](./EXAMPLE_SENTENCE_FEATURE.md)
