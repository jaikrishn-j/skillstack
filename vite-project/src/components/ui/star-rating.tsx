import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

interface StarRatingProps {
    rating?: number
    onRatingChange: (rating: number) => void
    disabled?: boolean
}

export const StarRating = ({ rating = 0, onRatingChange, disabled }: StarRatingProps) => {
    return (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    disabled={disabled}
                    onClick={() => onRatingChange(star)}
                    className={cn(
                        "p-1 hover:scale-110 transition-transform focus:outline-none",
                        disabled && "cursor-not-allowed hover:scale-100"
                    )}
                >
                    <Star
                        className={cn(
                            "w-6 h-6 transition-colors",
                            star <= rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-muted-foreground hover:text-yellow-400"
                        )}
                    />
                </button>
            ))}
        </div>
    )
}
