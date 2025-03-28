
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Upload, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/Header";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";

const EditProfile = () => {
  const { user: authUser } = useAuth();
  const [user, setUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    avatar: null as string | null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // First try to get user data from auth context
    if (authUser) {
      setUser({
        firstName: authUser.first_name || 'User',
        lastName: authUser.last_name || '',
        email: authUser.email || '',
        phone: '',
        avatar: null
      });
      return;
    }
    
    // Fall back to localStorage if auth context doesn't have the user
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      // Set demo user instead of redirecting to login
      setUser({
        firstName: 'Demo',
        lastName: 'User',
        email: 'demo@example.com',
        phone: '',
        avatar: null
      });
    }
  }, [authUser]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUser(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Save to localStorage for persistence
      localStorage.setItem('user', JSON.stringify(user));
      
      // If we're in auth mode, also update the user profile in Supabase
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user?.id;
      
      if (userId) {
        // Update the user_profile data
        const { error } = await supabase
          .from('user_profiles')
          .update({
            first_name: user.firstName,
            last_name: user.lastName,
            email: user.email,
            updated_at: new Date().toISOString()
          })
          .eq('id', userId);
          
        if (error) {
          console.error("Error updating profile:", error);
          throw error;
        }
      }
      
      toast({
        title: "Profile updated",
        description: "Your profile information has been saved.",
      });
      
      navigate('/');
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        title: "Error saving profile",
        description: "There was a problem saving your profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setUser(prev => ({ ...prev, avatar: event.target.result as string }));
          setImageDialogOpen(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteImage = () => {
    setUser(prev => ({ ...prev, avatar: null }));
    setImageDialogOpen(false);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1">
        <div className="container px-4 sm:px-6 py-6 sm:py-8 max-w-3xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Edit Profile</h1>
            <p className="text-muted-foreground mt-2">Update your personal information</p>
          </div>
          
          <Card className="card-glass">
            <CardContent className="p-6">
              <form onSubmit={handleSaveProfile} className="space-y-6">
                <div className="flex flex-col items-center space-y-4">
                  <div 
                    className="relative h-32 w-32 cursor-pointer rounded-full border-2 border-muted flex items-center justify-center bg-muted overflow-hidden"
                    onClick={() => setImageDialogOpen(true)}
                  >
                    {user.avatar ? (
                      <img 
                        src={user.avatar} 
                        alt="Profile"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <User className="h-16 w-16 text-muted-foreground" />
                    )}
                  </div>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setImageDialogOpen(true)}
                  >
                    Change Avatar
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor="firstName" className="text-sm font-medium">First Name</label>
                    <Input 
                      id="firstName" 
                      name="firstName"
                      value={user.firstName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="lastName" className="text-sm font-medium">Last Name</label>
                    <Input 
                      id="lastName" 
                      name="lastName"
                      value={user.lastName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">Email</label>
                  <Input 
                    id="email" 
                    name="email"
                    type="email"
                    value={user.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="phone" className="text-sm font-medium">Phone</label>
                  <Input 
                    id="phone" 
                    name="phone"
                    type="tel"
                    value={user.phone}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="flex justify-end space-x-4 pt-4">
                  <Button type="button" variant="outline" onClick={() => navigate('/')}>
                    Cancel
                  </Button>
                  <Button type="submit" className="purple-gradient text-white" disabled={isLoading}>
                    {isLoading ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Profile Picture</DialogTitle>
            <DialogDescription>
              Upload a new profile picture or delete the current one.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-4 space-y-6">
            {user.avatar && (
              <div className="relative h-32 w-32 rounded-full overflow-hidden border-2 border-muted">
                <img 
                  src={user.avatar} 
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              </div>
            )}
            <div className="flex gap-4">
              <label className="cursor-pointer">
                <div className="flex items-center gap-2 px-4 py-2 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80">
                  <Upload className="h-4 w-4" />
                  <span>Upload</span>
                </div>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
              {user.avatar && (
                <Button variant="destructive" onClick={handleDeleteImage}>
                  <Trash className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              )}
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EditProfile;
