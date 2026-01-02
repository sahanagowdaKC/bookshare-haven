import { Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useBooks } from '@/contexts/BookContext';

interface BookCardProps {
  id: string;
  title: string;
  author: string;
  coverImage: string;
  onClick: () => void;
}

export const BookCard = ({ id, title, author, coverImage, onClick }: BookCardProps) => {
  const { getAverageRating } = useBooks();
  const rating = getAverageRating(id);

  return (
    <Card
      className="group cursor-pointer overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-primary/10"
      onClick={onClick}
    >
      <div className="aspect-[3/4] overflow-hidden">
        <img
          src={coverImage}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      </div>
      <CardContent className="p-4">
        <h3 className="font-serif text-lg font-semibold text-foreground line-clamp-1">{title}</h3>
        <p className="text-sm text-muted-foreground">{author}</p>
        <div className="mt-2 flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`h-4 w-4 ${star <= Math.round(rating) ? 'fill-primary text-primary' : 'text-muted-foreground/30'}`}
            />
          ))}
          <span className="ml-1 text-xs text-muted-foreground">({rating.toFixed(1)})</span>
        </div>
      </CardContent>
    </Card>
  );
};
