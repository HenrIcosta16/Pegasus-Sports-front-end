import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Button } from "./Button"; // Import corrigido

const navLinks = [
  { href: "#services", label: "Serviços" },
  { href: "#about", label: "Sobre" },
  { href: "#gallery", label: "Galeria" },
  { href: "#testimonials", label: "Depoimentos" },
  { href: "#contact", label: "Contato" },
];

export const Header = () => {
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isScrollingUp, setIsScrollingUp] = useState<boolean>(false);
  const [lastScrollTop, setLastScrollTop] = useState<number>(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;
      setIsScrolled(currentScrollTop > 50);
      setIsScrollingUp(currentScrollTop < lastScrollTop);
      setLastScrollTop(currentScrollTop <= 0 ? 0 : currentScrollTop);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollTop]);

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    element?.scrollIntoView({ behavior: "smooth" });
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        style={headerStyles(isScrolled, isScrollingUp)}
      >
        <div style={containerStyles}>
          <div style={headerContentStyles}>
            {/* Logo */}
            <a href="#" style={logoStyles}>
              <span style={logoTextGoldStyles}>PEGASUS</span>
              <span style={logoTextWhiteStyles}>MOTORSPORTS</span>
            </a>

            {/* Desktop Navigation */}
            <nav style={desktopNavStyles}>
              {navLinks.map((link) => (
                <button
                  key={link.href}
                  onClick={() => scrollToSection(link.href)}
                  style={navLinkStyles}
                >
                  {link.label}
                  <span style={navLinkUnderlineStyles} />
                </button>
              ))}
            </nav>

            {/* CTA Button */}
            <div style={ctaButtonContainerStyles}>
              <Button
                variant="hero"
                size="lg"
                onClick={() => scrollToSection("#contact")}
                style={ctaButtonStyles}
              >
                Agendar Agora
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              style={mobileMenuButtonStyles}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              style={mobileMenuStyles}
            >
              <nav style={mobileNavStyles}>
                {navLinks.map((link) => (
                  <button
                    key={link.href}
                    onClick={() => scrollToSection(link.href)}
                    style={mobileNavLinkStyles}
                  >
                    {link.label}
                  </button>
                ))}
                <Button
                  variant="hero"
                  size="lg"
                  onClick={() => scrollToSection("#contact")}
                  style={mobileCtaButtonStyles}
                >
                  Agendar Agora
                </Button>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      <style>{styles}</style>
    </>
  );
};

// Constantes de CSS
const headerStyles = (isScrolled: boolean, isScrollingUp: boolean) => ({
  position: "fixed" as const,
  top: "0",
  left: "0",
  right: "0",
  zIndex: "50",
  transition: "all 0.3s",
  background: isScrollingUp
    ? "rgba(0, 0, 0, 0.95)" // Quando rolar para cima, fundo escuro
    : isScrolled
    ? "rgba(0, 0, 0, 0.95)" // Quando rolar para baixo e já tiver passado do limite
    : "transparent",
  backdropFilter: isScrolled ? "blur(10px)" : "none",
  borderBottom: isScrolled ? "1px solid #333" : "none",
});

const containerStyles = {
  maxWidth: "1200px",
  margin: "0 auto",
  padding: "0 20px",
};

const headerContentStyles = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  height: "80px",
};

const logoStyles = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
};

const logoTextGoldStyles = {
  fontSize: "2rem",
  fontWeight: "bold",
  color: "#FFD700",
};

const logoTextWhiteStyles = {
  fontSize: "2rem",
  fontWeight: "bold",
  color: "#ffffff",
};

const desktopNavStyles = {
  display: "flex",
  gap: "30px",
};

const navLinkStyles = {
  fontSize: "16px",
  fontWeight: "500",
  color: "#d1d1d1",
  textTransform: "uppercase" as const,
  position: "relative" as const,
  cursor: "pointer",
  transition: "color 0.2s",
  padding: "0",
  border: "none",
  background: "none",
};

const navLinkUnderlineStyles = {
  content: '""',
  position: "absolute" as const,
  bottom: "-3px",
  left: "0",
  width: "0",
  height: "2px",
  backgroundColor: "#FFD700",
  transition: "width 0.3s",
};

const ctaButtonContainerStyles = {
  display: "none",
};

const ctaButtonStyles = {
  background: "linear-gradient(90deg, #f0c420, #ff9e00)",
  padding: "12px 20px",
  color: "#000",
  borderRadius: "10px",
  fontSize: "16px",
  fontWeight: "bold",
  textTransform: "uppercase" as const,
  cursor: "pointer",
  border: "none",
  transition: "all 0.3s",
};

const mobileMenuButtonStyles = {
  background: "transparent",
  border: "none",
  color: "#fff",
  cursor: "pointer",
};

const mobileMenuStyles = {
  background: "rgba(0, 0, 0, 0.98)",
  backdropFilter: "blur(10px)",
  padding: "20px",
};

const mobileNavStyles = {
  display: "flex",
  flexDirection: "column" as const,
  gap: "20px",
};

const mobileNavLinkStyles = {
  fontSize: "18px",
  fontWeight: "500",
  color: "#d1d1d1",
  textTransform: "uppercase" as const,
  cursor: "pointer",
  transition: "color 0.2s",
  padding: "10px 0",
  background: "none",
  border: "none",
};

const mobileCtaButtonStyles = {
  background: "linear-gradient(90deg, #f0c420, #ff9e00)",
  padding: "12px 20px",
  color: "#000",
  borderRadius: "10px",
  fontSize: "16px",
  fontWeight: "bold",
  textTransform: "uppercase" as const,
  cursor: "pointer",
  border: "none",
  transition: "all 0.3s",
};

const styles = `
  body {
    font-family: 'Arial', sans-serif;
    margin: 0;
    padding: 0;
  }
`;
