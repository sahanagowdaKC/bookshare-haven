import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Book {
  id: string;
  title: string;
  author: string;
  coverImage: string;
  content: string;
  description: string;
  ratings: { userId: string; rating: number }[];
  createdAt: string;
}

export interface ShareActivity {
  id: string;
  bookId: string;
  bookTitle: string;
  userId: string;
  userEmail: string;
  sharedAt: string;
  platform: string;
}

interface BookContextType {
  books: Book[];
  shareActivities: ShareActivity[];
  addBook: (book: Omit<Book, 'id' | 'ratings' | 'createdAt'>) => void;
  rateBook: (bookId: string, userId: string, rating: number) => void;
  getAverageRating: (bookId: string) => number;
  recordShare: (bookId: string, userId: string, userEmail: string, platform: string) => void;
  getBookById: (id: string) => Book | undefined;
}

const BookContext = createContext<BookContextType | undefined>(undefined);

const defaultBooks: Book[] = [
  {
    id: '1',
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    coverImage: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=400&fit=crop',
    content: `In my younger and more vulnerable years my father gave me some advice that I've been turning over in my mind ever since.\n\n"Whenever you feel like criticizing anyone," he told me, "just remember that all the people in this world haven't had the advantages that you've had."\n\nHe didn't say any more, but we've always been unusually communicative in a reserved way, and I understood that he meant a great deal more than that. In consequence, I'm inclined to reserve all judgments, a habit that has opened up many curious natures to me and also made me the victim of not a few veteran bores.`,
    description: 'A story of decadence and excess in the Jazz Age.',
    ratings: [{ userId: 'demo', rating: 5 }],
    createdAt: '2024-01-01',
  },
  {
    id: '2',
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    coverImage: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=300&h=400&fit=crop',
    content: `It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife.\n\nHowever little known the feelings or views of such a man may be on his first entering a neighbourhood, this truth is so well fixed in the minds of the surrounding families, that he is considered the rightful property of some one or other of their daughters.`,
    description: 'A romantic novel of manners.',
    ratings: [{ userId: 'demo', rating: 4 }],
    createdAt: '2024-01-02',
  },
  {
    id: '3',
    title: '1984',
    author: 'George Orwell',
    coverImage: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=300&h=400&fit=crop',
    content: `It was a bright cold day in April, and the clocks were striking thirteen. Winston Smith, his chin nuzzled into his breast in an effort to escape the vile wind, slipped quickly through the glass doors of Victory Mansions, though not quickly enough to prevent a swirl of gritty dust from entering along with him.\n\nThe hallway smelt of boiled cabbage and old rag mats.`,
    description: 'A dystopian social science fiction novel.',
    ratings: [{ userId: 'demo', rating: 5 }],
    createdAt: '2024-01-03',
  },
];

export const BookProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [books, setBooks] = useState<Book[]>(() => {
    const stored = localStorage.getItem('ebook_books');
    return stored ? JSON.parse(stored) : defaultBooks;
  });

  const [shareActivities, setShareActivities] = useState<ShareActivity[]>(() => {
    const stored = localStorage.getItem('ebook_share_activities');
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem('ebook_books', JSON.stringify(books));
  }, [books]);

  useEffect(() => {
    localStorage.setItem('ebook_share_activities', JSON.stringify(shareActivities));
  }, [shareActivities]);

  const addBook = (book: Omit<Book, 'id' | 'ratings' | 'createdAt'>) => {
    const newBook: Book = {
      ...book,
      id: Date.now().toString(),
      ratings: [],
      createdAt: new Date().toISOString(),
    };
    setBooks((prev) => [...prev, newBook]);
  };

  const rateBook = (bookId: string, userId: string, rating: number) => {
    setBooks((prev) =>
      prev.map((book) => {
        if (book.id === bookId) {
          const existingRatingIndex = book.ratings.findIndex((r) => r.userId === userId);
          const newRatings = [...book.ratings];
          if (existingRatingIndex >= 0) {
            newRatings[existingRatingIndex] = { userId, rating };
          } else {
            newRatings.push({ userId, rating });
          }
          return { ...book, ratings: newRatings };
        }
        return book;
      })
    );
  };

  const getAverageRating = (bookId: string) => {
    const book = books.find((b) => b.id === bookId);
    if (!book || book.ratings.length === 0) return 0;
    const sum = book.ratings.reduce((acc, r) => acc + r.rating, 0);
    return sum / book.ratings.length;
  };

  const recordShare = (bookId: string, userId: string, userEmail: string, platform: string) => {
    const book = books.find((b) => b.id === bookId);
    if (!book) return;

    const activity: ShareActivity = {
      id: Date.now().toString(),
      bookId,
      bookTitle: book.title,
      userId,
      userEmail,
      sharedAt: new Date().toISOString(),
      platform,
    };
    setShareActivities((prev) => [...prev, activity]);
  };

  const getBookById = (id: string) => books.find((b) => b.id === id);

  return (
    <BookContext.Provider
      value={{ books, shareActivities, addBook, rateBook, getAverageRating, recordShare, getBookById }}
    >
      {children}
    </BookContext.Provider>
  );
};

export const useBooks = () => {
  const context = useContext(BookContext);
  if (!context) throw new Error('useBooks must be used within BookProvider');
  return context;
};
