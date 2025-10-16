"use client"

import * as React from "react"
import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

export interface StarRatingProps {
  value: number
  onChange?: (value: number) => void
  max?: number
  size?: number
  readOnly?: boolean
  showValue?: boolean
  className?: string
}

const StarRating = React.forwardRef<HTMLDivElement, StarRatingProps>(
  ({ 
    value, 
    onChange, 
    max = 5, 
    size = 20, 
    readOnly = false, 
    showValue = false,
    className,
    ...props 
  }, ref) => {
    const [hoverValue, setHoverValue] = React.useState<number | null>(null)

    const handleStarClick = (rating: number) => {
      if (!readOnly && onChange) {
        onChange(rating)
      }
    }

    const handleStarHover = (rating: number) => {
      if (!readOnly) {
        setHoverValue(rating)
      }
    }

    const handleMouseLeave = () => {
      if (!readOnly) {
        setHoverValue(null)
      }
    }

    const displayValue = hoverValue !== null ? hoverValue : (value || 0)

    return (
      <div
        ref={ref}
        className={cn("flex items-center gap-1", className)}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        <div className="flex" data-testid="star-rating-container">
          {Array.from({ length: max }, (_, index) => {
            const starValue = index + 1
            const isFilled = starValue <= displayValue
            const isPartial = starValue - 0.5 <= displayValue && displayValue < starValue

            return (
              <button
                key={index}
                type="button"
                className={cn(
                  "relative focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/50 rounded-sm",
                  !readOnly && "cursor-pointer hover:scale-110 transition-transform duration-150",
                  readOnly && "cursor-default"
                )}
                onClick={() => handleStarClick(starValue)}
                onMouseEnter={() => handleStarHover(starValue)}
                disabled={readOnly}
                aria-label={`Rate ${starValue} star${starValue > 1 ? 's' : ''}`}
                data-testid={`star-${starValue}`}
              >
                <Star
                  size={size}
                  className={cn(
                    "transition-colors duration-200",
                    isFilled || isPartial
                      ? "fill-yellow-400 text-yellow-400"
                      : "fill-none text-gray-300 dark:text-gray-600"
                  )}
                />
                {isPartial && (
                  <Star
                    size={size}
                    className="absolute top-0 left-0 fill-yellow-400 text-yellow-400"
                    style={{
                      clipPath: `inset(0 ${100 - ((displayValue - index) * 100)}% 0 0)`
                    }}
                  />
                )}
              </button>
            )
          })}
        </div>
        {showValue && (
          <span 
            className="ml-2 text-sm text-gray-600 dark:text-gray-400"
            data-testid="star-rating-value"
          >
            {(value || 0).toFixed(1)}
          </span>
        )}
      </div>
    )
  }
)

StarRating.displayName = "StarRating"

export { StarRating }