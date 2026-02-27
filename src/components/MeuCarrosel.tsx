import { Button } from "./Button";
import * as React from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ArrowLeft, ArrowRight, ArrowDown } from "lucide-react";
import ServicesSection from "./ServicesSection";
import AboutSection from "./AboutSection";
import { GallerySection } from './GallerySection';
import TestimonialsSection from "./TestimonialsSection";
import Contatosection from "./Contatosection";

// Tipos para os dados do carrossel
interface CarouselItemData {
  tituloprime: string;
  imagemUrl: string;
  titulo: string;
  titulodois: string;
  titulotres: string;
  descricao: string;
  descricaodois: string;
  descricaotres: string;
}

interface MeuCarroselProps {
  itens: CarouselItemData[];
}

const MeuCarrosel = ({ itens }: MeuCarroselProps) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [canScrollPrev, setCanScrollPrev] = React.useState(false);
  const [canScrollNext, setCanScrollNext] = React.useState(false);

  const scrollPrev = React.useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = React.useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const onSelect = React.useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  React.useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);

    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  // Função para scroll suave até uma seção
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  // Função para adicionar mais conteúdo ao arrastar para baixo
  const handleScrollDown = () => {
    console.log("Arrastou para baixo - carregar mais conteúdo!");
  };

  return (
    <div>
      {/* Seção do Carrossel Principal */}
      <div style={carouselWrapperStyles} onWheel={handleScrollDown}>
        <div style={carouselContentStyles} ref={emblaRef}>
          <div style={carouselInnerStyles}>
            {itens.map((item, index) => (
              <div style={carouselItemStyles} key={index}>
                <div style={slideStyles}>
                  <img
                    src={item.imagemUrl}
                    alt={item.titulo}
                    style={imageStyles}
                  />
                  <div style={overlayStyles}>
                    <h1 style={titulopri}>{item.tituloprime}</h1>
                    <h3 style={titleone}>{item.titulo}</h3>
                    <h3 style={titleStyles}>{item.titulodois}</h3>
                    <h3 style={titletwo}>{item.titulotres}</h3>
                    <p style={descriptionStyles}>{item.descricao}</p>
                    <p style={descriptiondois}>{item.descricaodois}</p>
                    <p style={descriptiontres}>{item.descricaotres}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          style={{
            ...buttonStyles,
            left: "16px",
            top: "50%",
            transform: "translateY(-50%)",
            opacity: canScrollPrev ? 1 : 0.3,
            cursor: canScrollPrev ? "pointer" : "not-allowed"
          }}
          onClick={scrollPrev}
          disabled={!canScrollPrev}
          aria-label="Slide anterior"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>

        <button
          style={{
            ...buttonStyles,
            right: "16px",
            top: "50%",
            transform: "translateY(-50%)",
            opacity: canScrollNext ? 1 : 0.3,
            cursor: canScrollNext ? "pointer" : "not-allowed"
          }}
          onClick={scrollNext}
          disabled={!canScrollNext}
          aria-label="Próximo slide"
        >
          <ArrowRight className="h-6 w-6" />
        </button>

        {/* Setinha para baixo para carregar mais conteúdo */}
        <div style={scrollDownStyles} onClick={handleScrollDown}>
          <ArrowDown className="h-8 w-8" />
        </div>

        {/* Botões "Agendar Consulta" e "Nossos Serviços" - POSICIONAMENTO CORRIGIDO */}
        <div style={buttonsContainerStyles}>
          <button 
            style={buttonStyle}
            onClick={() => scrollToSection('contact')}
          >
            Agendar Consulta
          </button>
          <button 
            style={buttonStyledois}
            onClick={() => scrollToSection('services')}
          >
            Nossos Serviços
          </button>
        </div>
      </div>

      {/* Componente de Serviços */}
      <div id="services">
        <ServicesSection />
      </div>

      <AboutSection />

      <GallerySection />

      <TestimonialsSection />

      <div id="contact">
        <Contatosection />
      </div>
    </div>
  );
};

export default MeuCarrosel;

const carouselWrapperStyles: React.CSSProperties = {
  position: "relative",
  maxWidth: "100%",
  margin: "2rem auto",
  borderRadius: "12px",
  overflow: "hidden",
  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)",
  backgroundColor: "#000",
  height: "700px", // AUMENTADO: De 500px para 700px
  marginTop: "2rem",
  marginBottom: "4rem",
};

const carouselContentStyles: React.CSSProperties = {
  overflow: "hidden",
  height: "100%",
};

const carouselInnerStyles: React.CSSProperties = {
  display: "flex",
  userSelect: "none",
  height: "100%",
};

const carouselItemStyles: React.CSSProperties = {
  minWidth: "100%",
  flex: "0 0 100%",
  position: "relative",
  height: "100%",
};

const slideStyles: React.CSSProperties = {
  position: "relative",
  height: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-start",
  backgroundColor: "#000",
};

const imageStyles: React.CSSProperties = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  objectPosition: "center",
};

const overlayStyles: React.CSSProperties = {
  position: "absolute",
  top:'190px',
  bottom: 0,
  left: 0,
  right: 0,
  background: "linear-gradient(to top, rgba(0,0,0,0.8), transparent)",
  color: "white",
  padding: "2rem",
  textAlign: "left" as const,
};

const titleStyles: React.CSSProperties = {
  fontSize: "2.5rem",
  fontWeight: "bold",
  marginBottom: "0.5rem",
  position: 'relative',
  left: '-20px',
  color: "#F1C232",
};

const titletwo: React.CSSProperties = {
  fontSize: "2.5rem",
  fontWeight: "bold",
  marginBottom: "0.5rem",
  position: 'relative',
  left: '-20px'
};

const titleone: React.CSSProperties = {
  fontSize: "2.5rem",
  fontWeight: "bold",
  marginBottom: "0.5rem",
  position: 'relative',
  left: '-20px'
};

const titulopri: React.CSSProperties = {
  fontSize: "1.5rem",
  color: "#F1C232",
  fontWeight: "bold",
  marginBottom: "0.5rem",
  position: 'relative',
  left: '-20px',
};

const descriptionStyles: React.CSSProperties = {
  fontSize: "1.25rem",
  opacity: 0.9,
};

const descriptiondois: React.CSSProperties = {
  fontSize: "1.25rem",
  opacity: 0.9,
};

const descriptiontres: React.CSSProperties = {
  fontSize: "1.25rem",
  opacity: 0.9,
};

const buttonStyles: React.CSSProperties = {
  position: "absolute",
  width: "48px",
  height: "48px",
  borderRadius: "50%",
  backgroundColor: "rgba(255, 255, 255, 0.2)",
  border: "none",
  color: "white",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "background-color 0.3s ease",
  zIndex: 10,
  cursor: "pointer",
};

const scrollDownStyles: React.CSSProperties = {
  position: "absolute",
  bottom: "16px",
  left: "50%",
  transform: "translateX(-50%)",
  cursor: "pointer",
  color: "white",
  zIndex: 10,
};

// CONTAINER DOS BOTÕES - CORRIGIDO
const buttonsContainerStyles: React.CSSProperties = {
  position: "absolute",
  bottom: "100px", // Ajustado para ficar acima da seta
  left: "50%",
  transform: "translateX(-50%)",
  display: "flex",
  gap: "1.5rem",
  zIndex: 10,
};

// BOTÕES INDIVIDUAIS - CORRIGIDO (sem position: relative nem top negativo)
const buttonStyle: React.CSSProperties = {
  padding: "12px 24px",
  backgroundColor: "#F1C232",
  color: "black",
  fontWeight: "bold",
  fontSize: "1rem",
  borderRadius: "8px",
  border: "none",
  cursor: "pointer",
  transition: "all 0.3s ease",
  boxShadow: "0 4px 12px rgba(241, 194, 50, 0.3)",
  position:'fixed',
  top:'-10px',
  left:'-640px'
};

const buttonStyledois: React.CSSProperties = {
  padding: "12px 24px",
  backgroundColor: "transparent",
  color: "white",
  fontWeight: "bold",
  fontSize: "1rem",
  borderRadius: "8px",
  border: "2px solid #F1C232",
  cursor: "pointer",
  transition: "all 0.3s ease",
  boxShadow: "0 4px 12px rgba(241, 194, 50, 0.2)",
  position:'fixed',
  top:'-10px',
  left:'-440px'
};