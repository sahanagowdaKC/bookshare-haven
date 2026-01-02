import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/Navbar';
import { StarRating } from '@/components/StarRating';
import { useBooks } from '@/contexts/BookContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const Read = () => {
  const { id } = useParams<{ id: string }>();
  const { getBookById, rateBook, getAverageRating, recordShare } = useBooks();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const book = getBookById(id || '');
  const userRating = book?.ratings.find((r) => r.userId === user?.id)?.rating || 0;
  const averageRating = getAverageRating(id || '');

  if (!book) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <p className="text-muted-foreground">Book not found.</p>
          <Button variant="ghost" onClick={() => navigate('/')} className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
          </Button>
        </div>
      </div>
    );
  }

  const handleRate = (rating: number) => {
    if (user) {
      rateBook(book.id, user.id, rating);
      toast({ title: 'Rating saved!', description: `You rated "${book.title}" ${rating} stars.` });
    }
  };

  const handleShare = (platform: string) => {
    if (!user) return;
    
    const shareUrl = window.location.href;
    const shareText = `Check out "${book.title}" by ${book.author} on BookHaven!`;
    
    let url = '';
    switch (platform) {
      case 'whatsapp':
        url = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`;
        break;
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
        break;
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;
      case 'email':
        url = `mailto:?subject=${encodeURIComponent(shareText)}&body=${encodeURIComponent(shareUrl)}`;
        break;
    }
    
    window.open(url, '_blank');
    recordShare(book.id, user.id, user.email, platform);
    toast({ title: 'Book shared!', description: `Shared via ${platform}.` });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate('/')} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
        </Button>

        <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
          {/* Book Info Sidebar */}
          <div className="space-y-6">
            <img
              src={book.coverImage}
              alt={book.title}
              className="w-full rounded-lg shadow-xl"
            />
            <div>
              <h1 className="font-serif text-2xl font-bold text-foreground">{book.title}</h1>
              <p className="text-muted-foreground">by {book.author}</p>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Average Rating</p>
              <StarRating rating={Math.round(averageRating)} onRate={() => {}} readonly />
              <p className="text-xs text-muted-foreground">{averageRating.toFixed(1)} / 5</p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Your Rating</p>
              <StarRating rating={userRating} onRate={handleRate} />
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground flex items-center gap-2">
                <Share2 className="h-4 w-4" /> Share this book
              </p>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => handleShare('whatsapp')}>
                  WhatsApp
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleShare('twitter')}>
                  Twitter
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleShare('facebook')}>
                  Facebook
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleShare('email')}>
                  Email
                </Button>
              </div>
            </div>
          </div>

          {/* Reading Area */}
          <div className="rounded-lg border border-border/50 bg-card/50 p-8">
            <p className="text-sm text-muted-foreground mb-4">{book.description}</p>
            <div className="prose prose-lg max-w-none text-foreground font-serif leading-relaxed whitespace-pre-wrap">
              {book.content}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Read;
