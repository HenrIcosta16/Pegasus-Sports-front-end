import React from 'react';
import { Award, Users, Clock, CheckCircle } from 'lucide-react';

// Tipos
interface StatItem {
  icon: React.ElementType;
  value: string;
  label: string;
}

interface AboutSectionProps {
  className?: string;
}

// Dados
const stats: StatItem[] = [
  { icon: Award, value: "10+", label: "Anos de Experiência" },
  { icon: Users, value: "2000+", label: "Clientes Satisfeitos" },
  { icon: Clock, value: "48h", label: "Tempo Médio de Serviço" },
  { icon: CheckCircle, value: "100%", label: "Garantia de Qualidade" },
];

const features: string[] = [
  "Produtos premium de marcas líderes mundiais",
  "Equipe certificada e especializada",
  "Ambiente climatizado e controlado",
  "Garantia estendida em todos os serviços",
  "Atendimento personalizado e exclusivo",
  "Acompanhamento fotográfico do processo",
];

export const AboutSection: React.FC<AboutSectionProps> = ({ className = '' }) => {
  // Animações básicas com CSS
  const [isVisible, setIsVisible] = React.useState(false);
  const sectionRef = React.useRef<HTMLElement>(null);

  React.useEffect(() => {
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

  return (
    <section 
      id="about" 
      ref={sectionRef}
      className={className}
      style={styles.section}
    >
      <div style={styles.container}>
        <div style={styles.grid}>
          {/* Conteúdo à esquerda */}
          <div 
            style={{
              ...styles.content,
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateX(0)' : 'translateX(-50px)',
              transition: 'opacity 0.8s ease, transform 0.8s ease'
            }}
          >
            <span style={styles.subtitle}>
              Quem Somos
            </span>
            <h2 style={styles.title}>
              PAIXÃO POR <span style={styles.gradientText}>EXCELÊNCIA</span>
            </h2>
            <p style={styles.paragraph}>
              A Pegasus Motorsports nasceu da paixão genuína por automóveis e da 
              busca incansável pela perfeição. Em Adelaide, somos referência em 
              personalização, proteção e performance automotiva.
            </p>
            <p style={{ ...styles.paragraph, marginBottom: '2rem' }}>
              Nossa missão é transformar cada veículo que passa por nossas mãos, 
              oferecendo um serviço que vai além das expectativas. Combinamos 
              técnicas avançadas, produtos premium e uma equipe apaixonada para 
              entregar resultados excepcionais.
            </p>

            {/* Lista de características */}
            <div style={styles.featuresGrid}>
              {features.map((feature, index) => (
                <div
                  key={index}
                  style={{
                    ...styles.featureItem,
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                    transition: `opacity 0.4s ease ${index * 0.1}s, transform 0.4s ease ${index * 0.1}s`
                  }}
                >
                  <CheckCircle style={styles.featureIcon} />
                  <span style={styles.featureText}>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Estatísticas à direita */}
          <div 
            style={{
              ...styles.statsContainer,
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateX(0)' : 'translateX(50px)',
              transition: 'opacity 0.8s ease, transform 0.8s ease'
            }}
          >
            <div style={styles.statsGrid}>
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={index}
                    style={{
                      ...styles.statCard,
                      opacity: isVisible ? 1 : 0,
                      transform: isVisible ? 'scale(1)' : 'scale(0.9)',
                      transition: `opacity 0.5s ease ${index * 0.1}s, transform 0.5s ease ${index * 0.1}s`
                    }}
                  >
                    <div style={styles.statHoverEffect} />
                    <div style={styles.statContent}>
                      <Icon style={styles.statIcon} />
                      <div style={styles.statValue}>{stat.value}</div>
                      <div style={styles.statLabel}>{stat.label}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Estilos em CSS puro (JavaScript objects)
const styles = {
  section: {
    padding: '6rem 0',
    backgroundColor: '#0a0a0a',
    color: '#ffffff',
    position: 'relative' as 'relative'
  },
  
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 1rem'
  },
  
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '4rem',
    alignItems: 'center'
  },
  
  content: {
    maxWidth: '100%'
  },
  
  subtitle: {
    fontSize: '0.875rem',
    fontWeight: 500,
    color: '#F1C232',
    letterSpacing: '0.1em',
    textTransform: 'uppercase' as 'uppercase',
    display: 'block',
    marginBottom: '0.5rem'
  },
  
  title: {
    fontSize: '2.25rem',
    fontWeight: 700,
    marginTop: '1rem',
    marginBottom: '1.5rem',
    lineHeight: 1.2,
    fontFamily: "'Inter', sans-serif"
  },
  
  gradientText: {
    background: 'linear-gradient(135deg, #F1C232 0%, #FFD700 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text'
  },
  
  paragraph: {
    fontSize: '1.125rem',
    color: '#a0a0a0',
    marginBottom: '1.5rem',
    lineHeight: 1.7
  },
  
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '0.75rem'
  },
  
  featureItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem'
  },
  
  featureIcon: {
    width: '1.25rem',
    height: '1.25rem',
    color: '#F1C232',
    flexShrink: 0
  },
  
  featureText: {
    fontSize: '0.875rem',
    color: '#ffffff'
  },
  
  statsContainer: {
    width: '100%'
  },
  
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '1.5rem'
  },
  
  statCard: {
    position: 'relative' as 'relative',
    padding: '2rem',
    borderRadius: '0.5rem',
    backgroundColor: '#1a1a1a',
    border: '1px solid #333333',
    overflow: 'hidden',
    transition: 'all 0.3s ease'
  },
  
  statHoverEffect: {
    position: 'absolute' as 'absolute',
    inset: 0,
    borderRadius: '0.5rem',
    backgroundColor: 'rgba(241, 194, 50, 0.05)',
    opacity: 0,
    transition: 'opacity 0.5s ease'
  },
  
  statContent: {
    position: 'relative' as 'relative',
    zIndex: 10
  },
  
  statIcon: {
    width: '2rem',
    height: '2rem',
    color: '#F1C232',
    marginBottom: '1rem'
  },
  
  statValue: {
    fontSize: '2.25rem',
    fontWeight: 700,
    background: 'linear-gradient(135deg, #F1C232 0%, #FFD700 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    marginBottom: '0.5rem',
    fontFamily: "'Inter', sans-serif"
  },
  
  statLabel: {
    fontSize: '0.875rem',
    color: '#a0a0a0'
  }
};

// Media Queries para responsividade
if (typeof window !== 'undefined') {
  // Adicionar estilos responsivos
  const mediaQuery = window.matchMedia('(min-width: 1024px)');
  
  if (mediaQuery.matches) {
    // Estilos para desktop
    Object.assign(styles.grid, {
      gridTemplateColumns: '1fr 1fr',
      gap: '4rem'
    });
    
    Object.assign(styles.title, {
      fontSize: '3rem'
    });
    
    Object.assign(styles.statValue, {
      fontSize: '2.5rem'
    });
  }
  
  // Para tablets
  const tabletQuery = window.matchMedia('(min-width: 768px)');
  if (tabletQuery.matches) {
    Object.assign(styles.featuresGrid, {
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '1rem'
    });
    
    Object.assign(styles.title, {
      fontSize: '2.5rem'
    });
  }
}

export default AboutSection;