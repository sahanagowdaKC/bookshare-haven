import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Users, BookPlus, Share2, LogOut, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useBooks } from '@/contexts/BookContext';
import { useToast } from '@/hooks/use-toast';

const ADMIN_PASSWORD = 'admin@123';

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [newBook, setNewBook] = useState({ title: '', author: '', coverImage: '', content: '', description: '' });
  const { books, addBook, shareActivities } = useBooks();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Get user stats from localStorage
  const allUsers = JSON.parse(localStorage.getItem('ebook_users') || '[]');
  const loggedInUsers = JSON.parse(localStorage.getItem('ebook_logged_in_users') || '[]');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      toast({ title: 'Admin access granted' });
    } else {
      toast({ title: 'Invalid password', variant: 'destructive' });
    }
  };

  const handleAddBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBook.title || !newBook.author || !newBook.content) {
      toast({ title: 'Please fill all required fields', variant: 'destructive' });
      return;
    }
    addBook(newBook);
    setNewBook({ title: '', author: '', coverImage: '', content: '', description: '' });
    toast({ title: 'Book added successfully!' });
  };

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Shield className="mx-auto mb-4 h-12 w-12 text-primary" />
            <CardTitle>Admin Access</CardTitle>
            <CardDescription>Enter admin password to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="Admin password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit" className="w-full" variant="gold">Access Dashboard</Button>
              <Button type="button" variant="ghost" className="w-full" onClick={() => navigate('/')}>
                Back to Home
              </Button>
            </form>
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
          <Button variant="ghost" size="sm" onClick={() => { setIsAuthenticated(false); navigate('/'); }}>
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
                <p className="text-2xl font-bold">{allUsers.length}</p>
                <p className="text-sm text-muted-foreground">Registered Users</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <Users className="h-10 w-10 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{loggedInUsers.length}</p>
                <p className="text-sm text-muted-foreground">Currently Logged In</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <Share2 className="h-10 w-10 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{shareActivities.length}</p>
                <p className="text-sm text-muted-foreground">Total Shares</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="add-book">
          <TabsList className="mb-6">
            <TabsTrigger value="add-book"><BookPlus className="mr-2 h-4 w-4" /> Add Book</TabsTrigger>
            <TabsTrigger value="users"><Users className="mr-2 h-4 w-4" /> Users</TabsTrigger>
            <TabsTrigger value="shares"><Share2 className="mr-2 h-4 w-4" /> Share Activity</TabsTrigger>
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
                  />
                  <Input
                    placeholder="Author *"
                    value={newBook.author}
                    onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
                    required
                  />
                  <Input
                    placeholder="Cover Image URL"
                    value={newBook.coverImage}
                    onChange={(e) => setNewBook({ ...newBook, coverImage: e.target.value })}
                  />
                  <Input
                    placeholder="Short Description"
                    value={newBook.description}
                    onChange={(e) => setNewBook({ ...newBook, description: e.target.value })}
                  />
                  <Textarea
                    placeholder="Book Content (Text) *"
                    value={newBook.content}
                    onChange={(e) => setNewBook({ ...newBook, content: e.target.value })}
                    rows={10}
                    required
                  />
                  <Button type="submit" variant="gold">Add Book</Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>Registered Users</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allUsers.map((user: { id: string; name: string; email: string }) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          {loggedInUsers.includes(user.id) ? (
                            <span className="text-green-500">Online</span>
                          ) : (
                            <span className="text-muted-foreground">Offline</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="shares">
            <Card>
              <CardHeader>
                <CardTitle>Share Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Book</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Platform</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {shareActivities.map((activity) => (
                      <TableRow key={activity.id}>
                        <TableCell>{activity.bookTitle}</TableCell>
                        <TableCell>{activity.userEmail}</TableCell>
                        <TableCell className="capitalize">{activity.platform}</TableCell>
                        <TableCell>{new Date(activity.sharedAt).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
