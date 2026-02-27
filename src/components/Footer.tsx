import { motion } from "framer-motion";
import { Instagram, Facebook, Youtube, Mail } from "lucide-react";

const socialLinks = [
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Facebook, href: "#", label: "Facebook" },
  { icon: Youtube, href: "#", label: "YouTube" },
  { icon: Mail, href: "mailto:contato@pegasusmotorsports.com.au", label: "Email" },
];

const footerLinks = [
  {
    title: "Serviços",
    links: [
      { label: "Detalhamento", href: "#services" },
      { label: "PPF", href: "#services" },
      { label: "Ceramic Coating", href: "#services" },
      { label: "Performance", href: "#services" },
    ],
  },
  {
    title: "Empresa",
    links: [
      { label: "Sobre Nós", href: "#about" },
      { label: "Galeria", href: "#gallery" },
      { label: "Depoimentos", href: "#testimonials" },
      { label: "Contato", href: "#contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Política de Privacidade", href: "#" },
      { label: "Termos de Serviço", href: "#" },
      { label: "Garantia", href: "#" },
    ],
  },
];

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  const scrollToSection = (href: string) => {
    if (href.startsWith("#")) {
      const element = document.querySelector(href);
      element?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer style={footerStyles}>
      <div style={containerStyles}>
        {/* Main Footer */}
        <div style={footerGridStyles}>
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={brandStyles}
          >
            <div style={logoContainerStyles}>
              <span style={logoTextGoldStyles}>PEGASUS</span>
              <span style={logoTextWhiteStyles}>MOTORSPORTS</span>
            </div>
            <p style={brandDescriptionStyles}>
              Especialistas em personalização, proteção e performance automotiva em Adelaide.
              Transformamos sua paixão por carros em realidade.
            </p>
            <div style={socialIconsContainerStyles}>
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  aria-label={social.label}
                  style={socialIconStyles}
                >
                  <social.icon style={socialIconSizeStyles} />
                </a>
              ))}
            </div>
          </motion.div>

          {/* Links */}
          {footerLinks.map((section, sectionIndex) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: (sectionIndex + 1) * 0.1 }}
              style={footerLinkSectionStyles}
            >
              <h4 style={footerLinkTitleStyles}>{section.title}</h4>
              <ul style={footerLinkListStyles}>
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex} style={footerLinkItemStyles}>
                    <button
                      onClick={() => scrollToSection(link.href)}
                      style={footerLinkButtonStyles}
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div style={bottomBarStyles}>
          <p style={bottomBarTextStyles}>
            © {currentYear} Pegasus Motorsports. Todos os direitos reservados.
          </p>
          <p style={bottomBarLocationStyles}>
            Adelaide, South Australia 🇦🇺
          </p>
        </div>
      </div>
    </footer>
  );
};

// Constantes de CSS Puro
const footerStyles = {
  backgroundColor: "#1e1e1e",
  borderTop: "1px solid #333",
};

const containerStyles = {
  maxWidth: "1200px",
  margin: "0 auto",
  padding: "0 20px",
};

const footerGridStyles = {
  display: "grid",
  gridTemplateColumns: "repeat(5, 1fr)",
  gap: "12px",
  padding: "40px 0",
};

const brandStyles = {
  gridColumn: "span 2",
};

const logoContainerStyles = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  marginBottom: "24px",
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

const brandDescriptionStyles = {
  color: "#d1d1d1",
  maxWidth: "350px",
  marginBottom: "24px",
};

const socialIconsContainerStyles = {
  display: "flex",
  gap: "16px",
};

const socialIconStyles = {
  width: "40px",
  height: "40px",
  borderRadius: "50%",
  backgroundColor: "#333",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  color: "#fff",
  cursor: "pointer",
  transition: "all 0.3s",
};

const socialIconSizeStyles = {
  width: "20px",
  height: "20px",
};

const footerLinkSectionStyles = {
  marginBottom: "32px",
};

const footerLinkTitleStyles = {
  fontSize: "1.25rem",
  fontWeight: "bold",
  color: "#ffffff",
  marginBottom: "16px",
};

const footerLinkListStyles = {
  listStyleType: "none",
  padding: "0",
};

const footerLinkItemStyles = {
  marginBottom: "12px",
};

const footerLinkButtonStyles = {
  background: "none",
  border: "none",
  color: "#d1d1d1",
  fontSize: "1rem",
  fontWeight: "500",
  cursor: "pointer",
  transition: "color 0.3s",
};

const bottomBarStyles = {
  borderTop: "1px solid #333",
  padding: "24px 0",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const bottomBarTextStyles = {
  color: "#d1d1d1",
  fontSize: "0.875rem",
};

const bottomBarLocationStyles = {
  color: "#d1d1d1",
  fontSize: "0.875rem",
};
