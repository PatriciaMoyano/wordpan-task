import { useMemo, useState, useCallback, useEffect } from 'react';
import { useWords } from '@/hooks/use-words';
import { useExampleSentence } from '@/hooks/use-example-sentence';
import { Flashcard } from '@/components/flashcard';
import { MemoryCard } from '@/components/memory-card';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';

type Word = { id: string; word: string; created_at: string };

const PAIR_OPTIONS = [4, 6, 8, 10, 12] as const;

/** Shuffle array (Fisher–Yates) */
function shuffle<T>(array: T[]): T[] {
  const out = [...array];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Build a deck of 2 * pairCount cards (each word appears twice), shuffled */
function buildDeck(
  words: Word[],
  pairCount: number
): { id: string; word: string }[] {
  if (words.length < pairCount) return [];
  const shuffled = shuffle([...words]);
  const selected = shuffled.slice(0, pairCount);
  const deck = selected.flatMap((w) => [
    { id: `${w.id}-a`, word: w.word },
    { id: `${w.id}-b`, word: w.word },
  ]);
  return shuffle(deck);
}

export default function FlashcardsPage() {
  const { words, loading, totalCount } = useWords();
  const { exampleSentence, isGenerating, error, generate, reset } = useExampleSentence();
  
  // Study mode state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showExample, setShowExample] = useState(false);
  
  // Memory game state
  const [pairCount, setPairCount] = useState(6);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [matchedIds, setMatchedIds] = useState<Set<string>>(new Set());
  const [deckKey, setDeckKey] = useState(0);
  const [moves, setMoves] = useState(0);
  const [timerActive, setTimerActive] = useState(false);

  const currentWord = words[currentIndex];

  const handleGenerateExample = async () => {
    if (!currentWord) return;
    
    // Parse word format - expecting "english - spanish"
    const wordText = currentWord.word.trim();
    console.log('Current word text:', wordText);
    
    // Try to split by " - " (space dash space)
    let wordEnglish = '';
    let wordSpanish = '';
    
    if (wordText.includes(' - ')) {
      const parts = wordText.split(' - ');
      wordEnglish = parts[0]?.trim() || '';
      wordSpanish = parts[1]?.trim() || '';
    } else if (wordText.includes('-')) {
      // Try without spaces
      const parts = wordText.split('-');
      wordEnglish = parts[0]?.trim() || '';
      wordSpanish = parts[1]?.trim() || '';
    } else {
      // If no separator found, use the whole word as English
      wordEnglish = wordText;
      wordSpanish = '';
    }
    
    console.log('Parsed words:', { wordEnglish, wordSpanish });
    
    // Validate that we have at least the English word
    if (!wordEnglish) {
      console.error('Could not extract English word from:', wordText);
      return;
    }
    
    setShowExample(true);
    await generate(wordEnglish, wordSpanish);
  };

  const handleNextWord = () => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowExample(false);
      reset();
    }
  };

  const handlePrevWord = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowExample(false);
      reset();
    }
  };

  const maxPairs = Math.min(
    PAIR_OPTIONS[PAIR_OPTIONS.length - 1],
    Math.max(0, words.length)
  );
  const effectivePairCount = Math.min(pairCount, maxPairs, words.length);

  const deck = useMemo(() => {
    if (words.length < 2 || effectivePairCount < 2) return [];
    return buildDeck(words, effectivePairCount);
  }, [words, effectivePairCount, deckKey]);

  const handleFlip = useCallback(
    (index: number) => {
      const card = deck[index];
      if (!card || matchedIds.has(card.id)) return;
      if (flippedIndices.includes(index)) return;
      if (flippedIndices.length >= 2) return;

      const nextFlipped = [...flippedIndices, index];

      if (nextFlipped.length === 2) {
        setMoves((m) => m + 1);
        const [a, b] = nextFlipped;
        const cardA = deck[a];
        const cardB = deck[b];
        if (cardA?.word === cardB?.word) {
          setMatchedIds((prev) => new Set(prev).add(cardA.id).add(cardB.id));
          setFlippedIndices([]);
        } else {
          setFlippedIndices(nextFlipped);
          setTimeout(() => setFlippedIndices([]), 1200);
        }
      } else {
        setFlippedIndices(nextFlipped);
      }
    },
    [deck, flippedIndices, matchedIds]
  );

  const startNewGame = () => {
    setMoves(0);
    setTimerActive(true);
    setFlippedIndices([]);
    setMatchedIds(new Set());
    setDeckKey((k) => k + 1);
  };

  const pairOptions = PAIR_OPTIONS.filter((n) => n <= maxPairs);
  const allMatched = deck.length > 0 && matchedIds.size === deck.length;
  const disabled = flippedIndices.length === 2;

  return (
    <div className="container mx-auto py-8">
      <Tabs defaultValue="study" className="w-full">
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
          <TabsTrigger value="study">Study Mode</TabsTrigger>
          <TabsTrigger value="game">Memory Game</TabsTrigger>
        </TabsList>

        {/* Study Mode */}
        <TabsContent value="study">
          <Card>
            <CardHeader>
              <CardTitle>Study Flashcards</CardTitle>
              <CardDescription>
                Review your vocabulary and generate example sentences with AI
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <p className="text-muted-foreground">Loading words...</p>
                </div>
              ) : words.length === 0 ? (
                <div className="flex items-center justify-center py-16">
                  <p className="text-muted-foreground">
                    No words found. Add words to study.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Progress indicator */}
                  <div className="text-center text-sm text-muted-foreground">
                    Card {currentIndex + 1} of {words.length}
                  </div>

                  {/* Flashcard */}
                  <div className="max-w-md mx-auto">
                    <Flashcard
                      front={
                        <div className="flex items-center justify-center h-full p-8">
                          <p className="text-3xl font-bold text-center">
                            {currentWord?.word.split(' - ')[0] || ''}
                          </p>
                        </div>
                      }
                      back={
                        <div className="flex items-center justify-center h-full p-8">
                          <p className="text-2xl font-semibold text-center">
                            {currentWord?.word.split(' - ')[1] || currentWord?.word}
                          </p>
                        </div>
                      }
                      className="h-64"
                    />
                  </div>

                  {/* Navigation and AI button */}
                  <div className="flex items-center justify-center gap-4">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handlePrevWord}
                      disabled={currentIndex === 0}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      onClick={handleGenerateExample}
                      disabled={isGenerating}
                      className="gap-2"
                    >
                      {isGenerating ? (
                        <>Generating...</>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4" />
                          Generate Example Sentence
                        </>
                      )}
                    </Button>

                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleNextWord}
                      disabled={currentIndex === words.length - 1}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Example sentence display */}
                  {showExample && (
                    <div className="max-w-2xl mx-auto space-y-4">
                      {error ? (
                        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-3">
                          <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                          <div>
                            <p className="font-semibold text-destructive">Error</p>
                            <p className="text-sm text-muted-foreground">{error}</p>
                          </div>
                        </div>
                      ) : exampleSentence ? (
                        <div className="p-6 bg-muted/50 rounded-lg space-y-4">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground mb-1">
                              English
                            </p>
                            <p className="text-lg">{exampleSentence.sentence_english}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground mb-1">
                              Spanish
                            </p>
                            <p className="text-lg">{exampleSentence.sentence_spanish}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground mb-1">
                              Explanation
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {exampleSentence.explanation}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center py-8">
                          <div className="animate-pulse text-muted-foreground">
                            Generating example...
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Memory Game */}
        <TabsContent value="game">
          <Card>
            <CardHeader>
              <CardTitle>Memory game</CardTitle>
              <CardDescription>
                Find the pairs: cards are hidden at the start. Flip two at a time to
                match the same word.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex gap-4 mb-4 text-sm font-medium">
                <span>Moves: {moves}</span>
              </div>
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <p className="text-muted-foreground">Loading words...</p>
                </div>
              ) : words.length < 2 ? (
                <div className="flex items-center justify-center py-16">
                  <p className="text-muted-foreground">
                    {words.length === 0
                      ? 'No words found. Add words to play.'
                      : 'Need at least 2 words to play.'}
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="pairs" className="text-sm font-medium">
                        Pairs to play
                      </Label>
                      <Select
                        value={String(effectivePairCount)}
                        onValueChange={(v) => {
                          setPairCount(Number(v));
                          startNewGame();
                        }}
                      >
                        <SelectTrigger id="pairs" className="w-[5rem]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {pairOptions.map((n) => (
                            <SelectItem key={n} value={String(n)}>
                              {n}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button variant="outline" size="sm" onClick={startNewGame}>
                      New game
                    </Button>
                    {allMatched && (
                      <span className="text-sm font-medium text-green-600 dark:text-green-400">
                        🎉 Well done! You matched all pairs.!
                      </span>
                    )}
                  </div>

                  <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
                    {deck.map((card, index) => (
                      <MemoryCard
                        key={card.id}
                        word={card.word}
                        flipped={flippedIndices.includes(index)}
                        matched={matchedIds.has(card.id)}
                        onFlip={() => handleFlip(index)}
                        disabled={disabled}
                      />
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
