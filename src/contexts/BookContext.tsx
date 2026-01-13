import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Book {
  id: string;
  title: string;
  author: string;
  coverImage: string;
  content: string;
  description: string;
  contributorId?: string;
  createdAt: string;
}

export interface BookRating {
  bookId: string;
  userId: string;
  rating: number;
}

interface BookContextType {
  books: Book[];
  isLoading: boolean;
  addBook: (book: Omit<Book, 'id' | 'createdAt'>, contributorId?: string) => Promise<boolean>;
  rateBook: (bookId: string, userId: string, rating: number) => Promise<void>;
  getAverageRating: (bookId: string) => number;
  getUserRating: (bookId: string, userId: string) => number;
  getBookById: (id: string) => Book | undefined;
  getUserContributionCount: (userId: string) => number;
  canDownload: (userId: string) => boolean;
  refreshBooks: () => Promise<void>;
}

const BookContext = createContext<BookContextType | undefined>(undefined);

export const BookProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [books, setBooks] = useState<Book[]>([]);
  const [ratings, setRatings] = useState<BookRating[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBooks = async () => {
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setBooks(data.map(book => ({
        id: book.id,
        title: book.title,
        author: book.author,
        coverImage: book.cover_url || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=400&fit=crop',
        content: book.content || '',
        description: book.description || '',
        contributorId: book.contributor_id || undefined,
        createdAt: book.created_at,
      })));
    }
    setIsLoading(false);
  };

  const fetchRatings = async () => {
    const { data, error } = await supabase
      .from('book_ratings')
      .select('*');

    if (!error && data) {
      setRatings(data.map(r => ({
        bookId: r.book_id,
        userId: r.user_id,
        rating: r.rating,
      })));
    }
  };

  const refreshBooks = async () => {
    await Promise.all([fetchBooks(), fetchRatings()]);
  };

  useEffect(() => {
    refreshBooks();
  }, []);

  const addBook = async (book: Omit<Book, 'id' | 'createdAt'>, contributorId?: string): Promise<boolean> => {
    const { error } = await supabase
      .from('books')
      .insert({
        title: book.title,
        author: book.author,
        cover_url: book.coverImage,
        content: book.content,
        description: book.description,
        contributor_id: contributorId,
      });

    if (!error) {
      await fetchBooks();
      return true;
    }
    return false;
  };

  const getUserContributionCount = (userId: string) => {
    return books.filter(book => book.contributorId === userId).length;
  };

  const canDownload = (userId: string) => {
    return getUserContributionCount(userId) > 0;
  };

  const rateBook = async (bookId: string, userId: string, rating: number) => {
    const { error } = await supabase
      .from('book_ratings')
      .upsert({
        book_id: bookId,
        user_id: userId,
        rating,
      }, { onConflict: 'book_id,user_id' });

    if (!error) {
      await fetchRatings();
    }
  };

  const getAverageRating = (bookId: string) => {
    const bookRatings = ratings.filter(r => r.bookId === bookId);
    if (bookRatings.length === 0) return 0;
    const sum = bookRatings.reduce((acc, r) => acc + r.rating, 0);
    return sum / bookRatings.length;
  };

  const getUserRating = (bookId: string, userId: string) => {
    return ratings.find(r => r.bookId === bookId && r.userId === userId)?.rating || 0;
  };

  const getBookById = (id: string) => books.find(b => b.id === id);

  return (
    <BookContext.Provider
      value={{ books, isLoading, addBook, rateBook, getAverageRating, getUserRating, getBookById, getUserContributionCount, canDownload, refreshBooks }}
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
