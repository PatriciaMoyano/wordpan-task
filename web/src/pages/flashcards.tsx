import { useMemo, useState, useCallback, useEffect } from 'react';
import { useWords } from '@/hooks/use-words';
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
  const [pairCount, setPairCount] = useState(6);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [matchedIds, setMatchedIds] = useState<Set<string>>(new Set());
  const [deckKey, setDeckKey] = useState(0);

  const [moves, setMoves] = useState(0);
  const [timerActive, setTimerActive] = useState(false);

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
    </div>
  );
}
