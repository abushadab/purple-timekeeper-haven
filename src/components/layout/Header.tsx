import { useNavigate } from "react-router-dom";

export const useSubscriptionNavigation = () => {
  const navigate = useNavigate();
  
  const goToSubscriptionPage = () => {
    navigate('/subscription');
  };
  
  return { goToSubscriptionPage };
};
