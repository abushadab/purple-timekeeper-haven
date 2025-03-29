
import { useNavigate } from "react-router-dom";

export const useSubscriptionNavigation = () => {
  const navigate = useNavigate();
  
  const goToSubscriptionPage = () => {
    navigate('/subscription');
  };
  
  return { goToSubscriptionPage };
};

const Header = () => {
  return (
    <header className="bg-background border-b border-border/40 py-4">
      <div className="container px-4 sm:px-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h1 className="font-bold text-xl">TimeTrack</h1>
        </div>
      </div>
    </header>
  );
};

// Make sure the default export is explicitly defined at the end of the file
export default Header;
