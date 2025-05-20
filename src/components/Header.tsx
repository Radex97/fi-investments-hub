
import TopBar from "./TopBar";
import { useIsMobile } from "@/hooks/use-mobile";

const Header = () => {
  const isMobile = useIsMobile();

  return (
    <header className="w-full">
      <TopBar />
    </header>
  );
};

export default Header;
