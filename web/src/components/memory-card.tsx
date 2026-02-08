import { cn } from '@/lib/utils'

export interface MemoryCardProps {
  /** Word shown when the card is flipped */
  word: string
  /** Whether the card is currently face-up (revealed) */
  flipped: boolean
  /** Whether the card has been matched and stays face-up */
  matched: boolean
  /** Called when the card is clicked (only if not matched and not blocking) */
  onFlip: () => void
  /** Disable clicks (e.g. while two cards are being compared) */
  disabled?: boolean
  className?: string
}

/**
 * A single memory game card: shows "?" when hidden, word when flipped.
 * Uses the same 3D flip animation as Flashcard.
 */
export function MemoryCard({
  word,
  flipped,
  matched,
  onFlip,
  disabled = false,
  className,
}: MemoryCardProps) {
  const isRevealed = flipped || matched

  const handleClick = () => {
    if (matched || disabled) return
    if (!flipped) onFlip()
  }

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      className={cn(
        'flashcard-container select-none outline-none rounded-xl',
        (matched || disabled) && 'pointer-events-none',
        !matched && !disabled && 'cursor-pointer focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        matched && 'memory-card-matched',
        className
      )}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleClick()
        }
      }}
      aria-label={isRevealed ? `Card showing ${word}` : 'Hidden card, click to reveal'}
    >
      <div className={cn('flashcard-inner', isRevealed && 'flashcard-flipped')}>
        <div className="flashcard-face flashcard-front memory-card-back rounded-xl">
          <span className="text-3xl sm:text-4xl font-bold text-slate-400 dark:text-slate-500 select-none">
            ?
          </span>
        </div>
        <div className="flashcard-face flashcard-back memory-card-word rounded-xl">
          <span className="text-xl sm:text-2xl font-bold drop-shadow-sm text-center">
            {word}
          </span>
        </div>
      </div>
    </div>
  )
}
