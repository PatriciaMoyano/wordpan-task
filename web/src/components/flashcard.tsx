import * as React from 'react'
import { cn } from '@/lib/utils'

export interface FlashcardProps {
  /** Content shown on the front of the card */
  front: React.ReactNode
  /** Content shown on the back of the card */
  back: React.ReactNode
  className?: string
}

/**
 * A single flashcard with 3D flip animation on click.
 * Click (or tap) to flip between front and back.
 */
export function Flashcard({ front, back, className }: FlashcardProps) {
  const [flipped, setFlipped] = React.useState(false)

  return (
    <div
      role="button"
      tabIndex={0}
      className={cn('flashcard-container select-none outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-xl', className)}
      onClick={() => setFlipped((f) => !f)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          setFlipped((f) => !f)
        }
      }}
      aria-label={flipped ? 'Flip card to show front' : 'Flip card to show back'}
    >
      <div className={cn('flashcard-inner', flipped && 'flashcard-flipped')}>
        <div className="flashcard-face flashcard-front rounded-xl">{front}</div>
        <div className="flashcard-face flashcard-back rounded-xl">{back}</div>
      </div>
    </div>
  )
}
