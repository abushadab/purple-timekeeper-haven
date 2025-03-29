
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export const SubscriptionButton = () => {
  const navigate = useNavigate();
  
  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={() => navigate('/subscription')}
      className="ml-2"
    >
      Manage Subscription
    </Button>
  );
};

// Adding a default export
const Index = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="container px-4 py-8">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="mt-4">Welcome to your TimeTrack dashboard.</p>
      </div>
    </div>
  );
};

export default Index;
