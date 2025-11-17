import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50 backdrop-blur-sm bg-card/95">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div 
          className="flex items-center space-x-2 cursor-pointer" 
          onClick={() => navigate("/")}
        >
          <div className="w-10 h-10 rounded-lg bg-[var(--brand-gradient)] flex items-center justify-center">
            <span className="text-white font-bold text-lg">F</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            FAZ PRA MIM
          </h1>
        </div>
        
        <nav className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/search")}
            className="text-muted-foreground hover:text-foreground"
          >
            Buscar Prestadores
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => navigate("/login")}
            className="text-muted-foreground hover:text-foreground"
          >
            Entrar
          </Button>
          <Button 
            variant="default" 
            onClick={() => navigate("/register")}
            className="bg-primary hover:bg-primary-hover"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Cadastrar
          </Button>
        </nav>
      </div>
    </header>
  );
};

export default Header;