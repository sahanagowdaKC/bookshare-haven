import { useNavigate } from 'react-router-dom';
import { BookOpen, Sparkles, Loader2 } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { BookCard } from '@/components/BookCard';
import { useBooks } from '@/contexts/BookContext';
import { useAuth } from '@/contexts/AuthContext';

const Home = () => {
  const { books, isLoading } = useBooks();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleBookClick = (bookId: string) => {
    if (user) {
      navigate(`/read/${bookId}`);
    } else {
      navigate('/login', { state: { redirectTo: `/read/${bookId}` } });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="container mx-auto px-4 text-center relative">
          <div className="mx-auto max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm text-primary">
              <Sparkles className="h-4 w-4" />
              <span>Discover Your Next Great Read</span>
            </div>
            <h1 className="mb-6 font-serif text-5xl font-bold leading-tight text-foreground md:text-6xl">
              Welcome to <span className="text-primary">BookHaven</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Explore our curated collection of e-books. Read, rate, and share your favorite stories with the world.
            </p>
          </div>
        </div>
      </section>

      {/* Books Grid */}
      <section className="container mx-auto px-4 pb-20">
        <div className="mb-8 flex items-center gap-3">
          <BookOpen className="h-6 w-6 text-primary" />
          <h2 className="font-serif text-2xl font-semibold text-foreground">Available Books</h2>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {books.map((book) => (
              <BookCard
                key={book.id}
                id={book.id}
                title={book.title}
                author={book.author}
                coverImage={book.coverImage}
                onClick={() => handleBookClick(book.id)}
              />
            ))}
          </div>
        )}

        {!isLoading && books.length === 0 && (
          <div className="py-20 text-center text-muted-foreground">
            <BookOpen className="mx-auto mb-4 h-12 w-12 opacity-50" />
            <p>No books available yet. Check back soon!</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
