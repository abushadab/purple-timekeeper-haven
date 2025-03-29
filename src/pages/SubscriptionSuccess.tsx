
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Header from "@/components/layout/Header";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const SubscriptionSuccess = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Show success message
    toast({
      title: "Subscription Successful",
      description: "Your subscription has been processed successfully.",
    });
    
    // You would typically verify the subscription server-side
    // For now, we'll just simulate a loading state
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [toast]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <div className="flex-1 container py-12 flex items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardHeader className="pb-2">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-2xl">Subscription Confirmed!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Thank you for subscribing to TimeTrack. Your account has been upgraded successfully.
            </p>
            {isLoading ? (
              <div className="flex justify-center py-4">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              </div>
            ) : (
              <div className="bg-muted p-4 rounded-lg">
                <p className="font-medium">You now have access to:</p>
                <ul className="mt-2 space-y-1 text-sm">
                  <li>Unlimited projects and portfolios</li>
                  <li>Advanced reporting tools</li>
                  <li>Team collaboration features</li>
                  <li>Priority support</li>
                </ul>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button 
              onClick={() => navigate("/")} 
              className="gap-2"
              disabled={isLoading}
            >
              Go to Dashboard <ArrowRight className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default SubscriptionSuccess;
