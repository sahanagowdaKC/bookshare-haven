import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Users, BookPlus, LogOut, Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useBooks } from '@/contexts/BookContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  user_id: string;
  name: string;
  email: string;
  created_at: string;
}

const Admin = () => {
  const [newBook, setNewBook] = useState({ title: '', author: '', coverImage: '', content: '', description: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [users, setUsers] = useState<Profile[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const { books, addBook, refreshBooks } = useBooks();
  const { user, isAdmin, isLoading, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (!error && data) {
        setUsers(data);
      }
      setIsLoadingUsers(false);
    };

    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  const handleAddBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBook.title || !newBook.author || !newBook.content) {
      toast({ title: 'Please fill all required fields', variant: 'destructive' });
      return;
    }
    
    setIsSubmitting(true);
    const success = await addBook({
      title: newBook.title,
      author: newBook.author,
      coverImage: newBook.coverImage || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=400&fit=crop',
      content: newBook.content,
      description: newBook.description || '',
    });
    
    if (success) {
      setNewBook({ title: '', author: '', coverImage: '', content: '', description: '' });
      toast({ title: 'Book added successfully!' });
    } else {
      toast({ title: 'Failed to add book', variant: 'destructive' });
    }
    setIsSubmitting(false);
  };

  const handleDeleteBook = async (bookId: string) => {
    const { error } = await supabase
      .from('books')
      .delete()
      .eq('id', bookId);

    if (!error) {
      await refreshBooks();
      toast({ title: 'Book deleted successfully!' });
    } else {
      toast({ title: 'Failed to delete book', variant: 'destructive' });
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Shield className="mx-auto mb-4 h-12 w-12 text-primary" />
            <CardTitle>Admin Access</CardTitle>
            <CardDescription>Please log in to access the admin panel</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={() => navigate('/login')} className="w-full" variant="gold">
              Go to Login
            </Button>
            <Button variant="ghost" className="w-full" onClick={() => navigate('/')}>
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Shield className="mx-auto mb-4 h-12 w-12 text-destructive" />
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>You don't have admin privileges</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="ghost" className="w-full" onClick={() => navigate('/')}>
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2 font-serif text-xl font-bold">
            <Shield className="h-6 w-6 text-primary" />
            Admin Dashboard
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" /> Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <Users className="h-10 w-10 text-primary" />
              <div>
                <p className="text-2xl font-bold">{users.length}</p>
                <p className="text-sm text-muted-foreground">Registered Users</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <BookPlus className="h-10 w-10 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{books.length}</p>
                <p className="text-sm text-muted-foreground">Total Books</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="add-book">
          <TabsList className="mb-6">
            <TabsTrigger value="add-book"><BookPlus className="mr-2 h-4 w-4" /> Add Book</TabsTrigger>
            <TabsTrigger value="books"><BookPlus className="mr-2 h-4 w-4" /> Manage Books</TabsTrigger>
            <TabsTrigger value="users"><Users className="mr-2 h-4 w-4" /> Users</TabsTrigger>
          </TabsList>

          <TabsContent value="add-book">
            <Card>
              <CardHeader>
                <CardTitle>Add New E-Book</CardTitle>
                <CardDescription>Fill in the details to add a new book</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddBook} className="space-y-4">
                  <Input
                    placeholder="Book Title *"
                    value={newBook.title}
                    onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
                    required
                    disabled={isSubmitting}
                  />
                  <Input
                    placeholder="Author *"
                    value={newBook.author}
                    onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
                    required
                    disabled={isSubmitting}
                  />
                  <Input
                    placeholder="Cover Image URL"
                    value={newBook.coverImage}
                    onChange={(e) => setNewBook({ ...newBook, coverImage: e.target.value })}
                    disabled={isSubmitting}
                  />
                  <Input
                    placeholder="Short Description"
                    value={newBook.description}
                    onChange={(e) => setNewBook({ ...newBook, description: e.target.value })}
                    disabled={isSubmitting}
                  />
                  <Textarea
                    placeholder="Book Content (Text) *"
                    value={newBook.content}
                    onChange={(e) => setNewBook({ ...newBook, content: e.target.value })}
                    rows={10}
                    required
                    disabled={isSubmitting}
                  />
                  <Button type="submit" variant="gold" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      'Add Book'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="books">
            <Card>
              <CardHeader>
                <CardTitle>Manage Books</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {books.map((book) => (
                      <TableRow key={book.id}>
                        <TableCell className="font-medium">{book.title}</TableCell>
                        <TableCell>{book.author}</TableCell>
                        <TableCell>{new Date(book.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteBook(book.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>Registered Users</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingUsers ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Joined</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((profile) => (
                        <TableRow key={profile.id}>
                          <TableCell>{profile.name}</TableCell>
                          <TableCell>{profile.email}</TableCell>
                          <TableCell>{new Date(profile.created_at).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
