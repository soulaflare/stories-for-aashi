import { Heart } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border/50 bg-secondary/20">
      <div className="container-responsive py-12">
        <div className="text-center space-y-6">
          {/* Main Message */}
          <div className="flex items-center justify-center space-x-2 text-foreground">
            <span className="text-lg font-body">Made with</span>
            <Heart className="h-5 w-5 text-accent fill-current" />
            <span className="text-lg font-body">for Aashi</span>
          </div>
          
          {/* Copyright and Links */}
          <div className="text-sm text-muted-foreground space-y-2">
            <p>© 2025 Stories for Aashi. collection of stories curated by Aditya.</p>
            <a 
              href="/privacy" 
              className="text-muted-foreground hover:text-foreground transition-colors underline"
            >
              Privacy Policy
            </a>
          </div>
          
          {/* Decorative Line */}
          <div className="w-24 h-px bg-gradient-to-r from-transparent via-border to-transparent mx-auto"></div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;