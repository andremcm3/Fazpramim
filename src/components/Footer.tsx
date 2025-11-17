const Footer = () => {
  return (
    <footer className="bg-muted/30 border-t border-border py-8 mt-16">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <div className="w-8 h-8 rounded-lg bg-[var(--brand-gradient)] flex items-center justify-center">
              <span className="text-white font-bold">F</span>
            </div>
            <span className="text-lg font-semibold text-foreground">FAZ PRA MIM</span>
          </div>
          
          <div className="flex items-center space-x-6 text-sm text-muted-foreground">
            <a 
              href="/termos" 
              className="hover:text-foreground transition-colors"
            >
              Termos de Uso
            </a>
            <a 
              href="/privacidade" 
              className="hover:text-foreground transition-colors"
            >
              Política de Privacidade
            </a>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-border text-center text-sm text-muted-foreground">
          © 2024 FAZ PRA MIM. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
};

export default Footer;