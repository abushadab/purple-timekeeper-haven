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
