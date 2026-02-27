import { useEffect } from "react";
import { Shield, Sparkles, Gauge, Wrench, Car, Droplets } from "lucide-react";
import { Button } from "./Button"; // Certifique-se de que o caminho para Button está correto

const services = [
  {
    icon: Sparkles,
    title: "Detalhamento Premium",
    description:
      "Correção de pintura, polimento e acabamento de nível show. Restauramos o brilho original do seu veículo.",
  },
  {
    icon: Shield,
    title: "Proteção de Pintura",
    description:
      "PPF (Paint Protection Film) e ceramic coating para proteção duradoura contra arranhões e elementos.",
  },
  {
    icon: Gauge,
    title: "Upgrades de Performance",
    description:
      "Remapeamento de ECU, sistemas de escape, intake e muito mais para máxima performance.",
  },
  {
    icon: Droplets,
    title: "Ceramic Coating",
    description:
      "Proteção cerâmica de longa duração com brilho intenso e hidrofobicidade extrema.",
  },
  {
    icon: Car,
    title: "Personalização",
    description:
      "Envelopamento, rodas, suspensão e acessórios para deixar seu carro único e exclusivo.",
  },
  {
    icon: Wrench,
    title: "Manutenção Especializada",
    description:
      "Serviços de manutenção preventiva e corretiva por especialistas certificados.",
  },
];

const ServicesSection = () => {
  const scrollToContact = () => {
    document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const handleScroll = (event) => {
      if (event.target.id === "services") {
        document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" });
      }
    };

    return () => {
      document.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <section id="services" style={sectionStyles}>
      <div style={containerStyles}>
        {/* Section Header */}
        <div style={sectionHeaderStyles}>
          <span style={sectionSubtitleStyles}>O Que Fazemos</span>
          <h2 style={sectionTitleStyles}>
            NOSSOS <span style={highlightTextStyles}>SERVIÇOS</span>
          </h2>
          <p style={sectionDescriptionStyles}>
            Oferecemos uma gama completa de serviços automotivos premium, desde detalhamento até upgrades de performance.
          </p>
        </div>

        {/* Services Grid */}
        <div style={servicesGridStyles}>
          {services.map((service, index) => (
            <div key={index} style={serviceCardStyles}>
              <div style={serviceIconStyles}>
                <service.icon style={iconStyles} />
              </div>
              <h3 style={serviceTitleStyles}>{service.title}</h3>
              <p style={serviceDescriptionStyles}>{service.description}</p>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <div style={ctaButtonContainerStyles}>
          <Button style={buttonStyles} variant="hero" size="xl" onClick={scrollToContact}>
            Solicitar Orçamento
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;

// Estilos CSS como constantes

const sectionStyles = {
  paddingTop: "6rem",
  paddingBottom: "6rem",
  background: "linear-gradient(to right, #2b2b2b, #1f1f1f)",
};

const containerStyles = {
  width: "100%",
  margin: "0 auto",
};

const sectionHeaderStyles = {
  textAlign: "center",
  maxWidth: "2xl",
  margin: "0 auto",
  marginBottom: "4rem",
};

const sectionSubtitleStyles = {
  fontSize: "0.875rem",
  fontWeight: 500,
  color: "#FFD700",
  textTransform: "uppercase",
  letterSpacing: "1px",
};

const sectionTitleStyles = {
  fontSize: "2.5rem",
  marginTop: "1rem",
  marginBottom: "1.5rem",
  color:"white"
};

const highlightTextStyles = {
  color: "#FFD700",
};

const sectionDescriptionStyles = {
  color: "rgba(255, 255, 255, 0.6)",
  fontSize: "1.125rem",
};

const servicesGridStyles = {
  display: "grid",
  gridTemplateColumns: "repeat(2, 1fr)",
  gap: "1.5rem",
  "@media (min-width: 1024px)": {
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "2rem",
  },
};

const serviceCardStyles = {
  position: "relative",
  padding: "2rem",
  borderRadius: "1rem",
  backgroundColor: "#2B2B2B",
  border: "1px solid #4B4B4B",
  transition: "all 0.3s ease",
};

const serviceIconStyles = {
  width: "3.5rem",
  height: "3.5rem",
  borderRadius: "1rem",
  backgroundColor: "rgba(255, 215, 0, 0.1)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  marginBottom: "1.5rem",
  transition: "background-color 0.3s ease",
};

const iconStyles = {
  color: "#FFD700",
};

const serviceTitleStyles = {
  fontSize: "1.5rem",
  marginBottom: "1rem",
  color: "white",
  transition: "color 0.3s ease",
};

const serviceDescriptionStyles = {
  color: "rgba(255, 255, 255, 0.6)",
  lineHeight: "1.75",
};

const ctaButtonContainerStyles = {
  textAlign: "center",
  marginTop: "4rem",
  
};

const buttonStyles = {
  padding: "1rem 2rem",
  backgroundColor: "#FFD700", // Cor amarela
  color: "#000", // Texto preto
  fontWeight: "bold",
  borderRadius: "8px",
  border: "none",
  cursor: "pointer",
  transition: "background-color 0.3s ease",
};