import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Share2, Download, Upload, Lock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/Navbar';
import { StarRating } from '@/components/StarRating';
import { useBooks } from '@/contexts/BookContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useState } from 'react';

const Read = () => {
  const { id } = useParams<{ id: string }>();
  const { getBookById, rateBook, getAverageRating, getUserRating, canDownload, addBook, getUserContributionCount } = useBooks();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [contributeOpen, setContributeOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newBook, setNewBook] = useState({ title: '', author: '', coverImage: '', content: '', description: '' });

  const book = getBookById(id || '');
  const userRating = user ? getUserRating(id || '', user.id) : 0;
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

  const handleRate = async (rating: number) => {
    if (user) {
      await rateBook(book.id, user.id, rating);
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
    toast({ title: 'Book shared!', description: `Shared via ${platform}.` });
  };

  const handleDownload = () => {
    if (!user) return;
    
    const content = `${book.title}\nby ${book.author}\n\n${book.description}\n\n${book.content}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${book.title}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: 'Download started!', description: `Downloading "${book.title}"` });
  };

  const handleContribute = async () => {
    if (!user || !newBook.title || !newBook.author || !newBook.content) {
      toast({ title: 'Missing fields', description: 'Please fill in title, author, and content.', variant: 'destructive' });
      return;
    }
    
    setIsSubmitting(true);
    const success = await addBook({
      title: newBook.title,
      author: newBook.author,
      coverImage: newBook.coverImage || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=400&fit=crop',
      content: newBook.content,
      description: newBook.description || 'A contributed book.',
    }, user.id);
    
    if (success) {
      setNewBook({ title: '', author: '', coverImage: '', content: '', description: '' });
      setContributeOpen(false);
      toast({ title: 'Book contributed!', description: 'You can now download any book.' });
    } else {
      toast({ title: 'Error', description: 'Failed to add book. Please try again.', variant: 'destructive' });
    }
    setIsSubmitting(false);
  };

  const userCanDownload = user ? canDownload(user.id) : false;
  const contributionCount = user ? getUserContributionCount(user.id) : 0;

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

            {/* Download Section */}
            <div className="space-y-3 pt-4 border-t border-border/50">
              <p className="text-sm font-medium text-foreground flex items-center gap-2">
                <Download className="h-4 w-4" /> Download Book
              </p>
              
              {userCanDownload ? (
                <Button className="w-full" onClick={handleDownload}>
                  <Download className="mr-2 h-4 w-4" /> Download as TXT
                </Button>
              ) : (
                <div className="space-y-3">
                  <div className="rounded-lg bg-muted/50 p-3 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                      <Lock className="h-4 w-4" />
                      <span>Contribute to unlock downloads</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Add one book to the library to download unlimited books.
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Your contributions: {contributionCount}
                    </p>
                  </div>
                  
                  <Dialog open={contributeOpen} onOpenChange={setContributeOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full">
                        <Upload className="mr-2 h-4 w-4" /> Contribute a Book
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Contribute a Book</DialogTitle>
                        <DialogDescription>
                          Share a book with the community to unlock downloads.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 pt-4">
                        <div className="space-y-2">
                          <Label htmlFor="title">Title *</Label>
                          <Input
                            id="title"
                            value={newBook.title}
                            onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
                            placeholder="Enter book title"
                            disabled={isSubmitting}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="author">Author *</Label>
                          <Input
                            id="author"
                            value={newBook.author}
                            onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
                            placeholder="Enter author name"
                            disabled={isSubmitting}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="coverImage">Cover Image URL</Label>
                          <Input
                            id="coverImage"
                            value={newBook.coverImage}
                            onChange={(e) => setNewBook({ ...newBook, coverImage: e.target.value })}
                            placeholder="https://example.com/cover.jpg"
                            disabled={isSubmitting}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="description">Description</Label>
                          <Textarea
                            id="description"
                            value={newBook.description}
                            onChange={(e) => setNewBook({ ...newBook, description: e.target.value })}
                            placeholder="Brief description of the book"
                            rows={2}
                            disabled={isSubmitting}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="content">Content *</Label>
                          <Textarea
                            id="content"
                            value={newBook.content}
                            onChange={(e) => setNewBook({ ...newBook, content: e.target.value })}
                            placeholder="Paste the book content here..."
                            rows={6}
                            disabled={isSubmitting}
                          />
                        </div>
                        <Button onClick={handleContribute} className="w-full" disabled={isSubmitting}>
                          {isSubmitting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Submitting...
                            </>
                          ) : (
                            <>
                              <Upload className="mr-2 h-4 w-4" /> Submit Book
                            </>
                          )}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              )}
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
