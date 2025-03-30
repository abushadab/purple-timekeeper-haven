
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signIn, signUp, user } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (isSignUp) {
        // Handle signup
        const { error, needsSubscription } = await signUp(email, password, { firstName, lastName });
        if (error) {
          toast({
            title: "Registration failed",
            description: error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Registration successful",
            description: "Please check your email to confirm your account.",
          });
          
          if (needsSubscription) {
            // Redirect new users to the pricing page after a brief delay
            setTimeout(() => navigate('/pricing'), 500);
          } else {
            setIsSignUp(false); // Switch back to login view
          }
        }
      } else {
        // Handle login
        const { error } = await signIn(email, password);
        if (error) {
          toast({
            title: "Login failed",
            description: error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Logged in successfully",
            description: "Welcome to TabTracker!",
          });
          // The redirect will be handled by the AuthContext
        }
      }
    } catch (error: any) {
      toast({
        title: isSignUp ? "Registration failed" : "Login failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md card-glass">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-2">
            <Clock className="h-10 w-10 text-purple-600" />
          </div>
          <CardTitle className="text-2xl font-bold">TabTracker</CardTitle>
          <CardDescription>
            {isSignUp 
              ? "Create a new account to start tracking your time" 
              : "Enter your credentials to access your account"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <>
                <div className="space-y-2">
                  <label htmlFor="firstName" className="text-sm font-medium">First Name</label>
                  <Input 
                    id="firstName" 
                    type="text" 
                    placeholder="John" 
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="lastName" className="text-sm font-medium">Last Name</label>
                  <Input 
                    id="lastName" 
                    type="text" 
                    placeholder="Doe" 
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
              </>
            )}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">Email</label>
              <Input 
                id="email" 
                type="email" 
                placeholder="name@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium">Password</label>
                {!isSignUp && (
                  <Button variant="link" className="p-0 h-auto text-xs text-purple-600">
                    Forgot password?
                  </Button>
                )}
              </div>
              <Input 
                id="password" 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full purple-gradient text-white" disabled={isLoading}>
              {isLoading ? "Processing..." : isSignUp ? "Sign Up" : "Log in"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <Button 
              variant="link" 
              className="p-0 h-auto text-purple-600"
              onClick={() => setIsSignUp(!isSignUp)}
            >
              {isSignUp ? "Log in" : "Sign up"}
            </Button>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
