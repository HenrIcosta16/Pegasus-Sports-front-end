import React, { useState, useEffect, useRef } from "react";
import { Star, Quote } from "lucide-react";

// Tipos
interface Testimonial {
  id: number;
  name: string;
  role: string;
  content: string;
  rating: number;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Lucas Mendes",
    role: "Proprietário BMW M4",
    content: "Trabalho impecável! O ceramic coating ficou perfeito e o atendimento foi excepcional do início ao fim. Recomendo a todos.",
    rating: 5,
  },
  {
    id: 2,
    name: "Rafael Santos",
    role: "Proprietário Porsche Cayenne",
    content: "A proteção PPF que instalaram no meu carro é invisível e a qualidade é impressionante. Equipe profissional e pontual.",
    rating: 5,
  },
  {
    id: 3,
    name: "Mariana Costa",
    role: "Proprietária Mercedes C63",
    content: "O detalhamento trouxe meu carro de volta à vida! O cuidado com os detalhes e a paixão pelo trabalho são evidentes.",
    rating: 5,
  },
];

export const TestimonialsSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  
  const sectionRef = useRef<HTMLElement>(null);

  // Intersection Observer para animações
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  // Responsividade
  useEffect(() => {
    const updateResponsiveStyles = () => {
      const mobile = window.matchMedia('(max-width: 767px)').matches;
      const tablet = window.matchMedia('(min-width: 768px) and (max-width: 1023px)').matches;
      const desktop = window.matchMedia('(min-width: 1024px)').matches;
      
      setIsMobile(mobile);
      setIsTablet(tablet);
      setIsDesktop(desktop);
    };

    window.addEventListener('resize', updateResponsiveStyles);
    updateResponsiveStyles();
    
    return () => {
      window.removeEventListener('resize', updateResponsiveStyles);
    };
  }, []);

  // Estilos responsivos dinâmicos
  const getTestimonialsGridStyles = () => {
    if (isDesktop) {
      return { ...styles.testimonialsGrid, gridTemplateColumns: 'repeat(3, 1fr)' };
    } else if (isTablet) {
      return { ...styles.testimonialsGrid, gridTemplateColumns: 'repeat(2, 1fr)' };
    } else {
      return { ...styles.testimonialsGrid, gridTemplateColumns: '1fr' };
    }
  };

  const getTitleStyles = () => {
    if (isDesktop) {
      return { ...styles.title, fontSize: '3.5rem' };
    } else if (isTablet) {
      return { ...styles.title, fontSize: '3rem' };
    } else {
      return { ...styles.title, fontSize: '2.5rem' };
    }
  };

  return (
    <section 
      id="testimonials" 
      ref={sectionRef}
      style={styles.section}
    >
      <div style={styles.container}>
        {/* Section Header */}
        <div 
          style={{
            ...styles.sectionHeader,
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
            transition: 'opacity 0.6s ease, transform 0.6s ease'
          }}
        >
          <span style={styles.subtitle}>
            Depoimentos
          </span>
          <h2 style={getTitleStyles()}>
            O QUE NOSSOS <span style={styles.gradientText}>CLIENTES</span> DIZEM
          </h2>
          <p style={styles.description}>
            A satisfação dos nossos clientes é nossa maior conquista.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div style={getTestimonialsGridStyles()}>
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.id}
              style={{
                ...styles.testimonialCard,
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
                transition: `opacity 0.6s ease ${index * 0.15}s, transform 0.6s ease ${index * 0.15}s`
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(241, 194, 50, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#333333';
              }}
            >
              {/* Quote Icon */}
              <Quote style={styles.quoteIcon} />

              {/* Rating */}
              <div style={styles.rating}>
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} style={styles.star} />
                ))}
              </div>

              {/* Content */}
              <p style={styles.content}>
                "{testimonial.content}"
              </p>

              {/* Author */}
              <div style={styles.author}>
                <div style={styles.avatar}>
                  <span style={styles.avatarInitial}>
                    {testimonial.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <div style={styles.authorName}>
                    {testimonial.name}
                  </div>
                  <div style={styles.authorRole}>
                    {testimonial.role}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Estilos CSS puro em constantes
const styles = {
  section: {
    padding: '6rem 0',
    backgroundColor: '#1a1a1a',
    color: '#ffffff'
  } as React.CSSProperties,
  
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 1rem'
  } as React.CSSProperties,
  
  sectionHeader: {
    textAlign: 'center' as const,
    maxWidth: '800px',
    margin: '0 auto 4rem'
  } as React.CSSProperties,
  
  subtitle: {
    fontSize: '0.875rem',
    fontWeight: 500,
    color: '#F1C232',
    letterSpacing: '0.1em',
    textTransform: 'uppercase' as const,
    display: 'block',
    marginBottom: '0.5rem'
  } as React.CSSProperties,
  
  title: {
    fontSize: '2.5rem',
    fontWeight: 700,
    marginTop: '1rem',
    marginBottom: '1.5rem',
    lineHeight: 1.2,
    fontFamily: "'Inter', sans-serif"
  } as React.CSSProperties,
  
  gradientText: {
    background: 'linear-gradient(135deg, #F1C232 0%, #FFD700 100%)',
    WebkitBackgroundClip: 'text' as const,
    WebkitTextFillColor: 'transparent' as const,
    backgroundClip: 'text' as const
  } as React.CSSProperties,
  
  description: {
    fontSize: '1.125rem',
    color: '#a0a0a0',
    lineHeight: 1.6
  } as React.CSSProperties,
  
  testimonialsGrid: {
    display: 'grid',
    gap: '2rem'
  } as React.CSSProperties,
  
  testimonialCard: {
    position: 'relative' as const,
    padding: '2rem',
    borderRadius: '0.5rem',
    backgroundColor: '#0a0a0a',
    border: '1px solid #333333',
    transition: 'all 0.5s ease'
  } as React.CSSProperties,
  
  quoteIcon: {
    position: 'absolute' as const,
    top: '1.5rem',
    right: '1.5rem',
    width: '2.5rem',
    height: '2.5rem',
    color: 'rgba(241, 194, 50, 0.2)'
  } as React.CSSProperties,
  
  rating: {
    display: 'flex',
    gap: '0.25rem',
    marginBottom: '1.5rem'
  } as React.CSSProperties,
  
  star: {
    width: '1.25rem',
    height: '1.25rem',
    color: '#F1C232',
    fill: '#F1C232'
  } as React.CSSProperties,
  
  content: {
    color: '#ffffff',
    lineHeight: 1.7,
    marginBottom: '1.5rem',
    position: 'relative' as const,
    zIndex: 10
  } as React.CSSProperties,
  
  author: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem'
  } as React.CSSProperties,
  
  avatar: {
    width: '3rem',
    height: '3rem',
    borderRadius: '50%',
    backgroundColor: 'rgba(241, 194, 50, 0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  } as React.CSSProperties,
  
  avatarInitial: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '1.25rem',
    fontWeight: 700,
    color: '#F1C232'
  } as React.CSSProperties,
  
  authorName: {
    fontWeight: 600,
    color: '#ffffff'
  } as React.CSSProperties,
  
  authorRole: {
    fontSize: '0.875rem',
    color: '#a0a0a0'
  } as React.CSSProperties
};

export default TestimonialsSection;