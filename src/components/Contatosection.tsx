import React, { useState, useEffect, useRef } from "react";
import { MapPin, Phone, Mail, Clock, ExternalLink } from "lucide-react";
import CalendarioAgendamento from "./CalendarioAgendamento";
import FormAgendamento from "./FormAgendamento";

// Tipos
interface ContactInfo {
  icon: React.ElementType;
  label: string;
  value: string;
  detail: string;
}

const contactInfo: ContactInfo[] = [
  {
    icon: MapPin,
    label: "Endereço",
    value: "Adelaide, South Australia",
    detail: "Visite nosso estúdio com hora marcada",
  },
  {
    icon: Phone,
    label: "Telefone",
    value: "+55 83 8609-5002",
    detail: "Seg - Sex: 8h às 18h",
  },
  {
    icon: Mail,
    label: "Email",
    value: "contato@pegasusmotorsports.com.au",
    detail: "Respondemos em até 24h",
  },
  {
    icon: Clock,
    label: "Horário",
    value: "Segunda a Sexta",
    detail: "8:00 - 18:00",
  },
];

export const Contatosection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  
  // Estados para controlar a exibição dos componentes
  const [mostrarCalendario, setMostrarCalendario] = useState(false);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  
  const sectionRef = useRef<HTMLElement>(null);
  const externalLinkRef = useRef<SVGSVGElement>(null);
  const [isHovered, setIsHovered] = useState(false);

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

  // Funções para abrir os componentes
  const abrirFormularioAgendamento = () => {
    setMostrarFormulario(true);
    setMostrarCalendario(false);
  };

  const abrirCalendario = () => {
    setMostrarCalendario(true);
    setMostrarFormulario(false);
  };

  const fecharComponentes = () => {
    setMostrarCalendario(false);
    setMostrarFormulario(false);
  };

  // Estilos responsivos dinâmicos
  const getGridStyles = () => {
    if (isDesktop) {
      return { ...styles.grid, gridTemplateColumns: '1fr 1fr' };
    } else {
      return { ...styles.grid, gridTemplateColumns: '1fr' };
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

  const getContactInfoGridStyles = () => {
    if (isMobile) {
      return { ...styles.contactInfoGrid, gridTemplateColumns: '1fr' };
    } else {
      return { ...styles.contactInfoGrid, gridTemplateColumns: 'repeat(2, 1fr)' };
    }
  };

  const getExternalIconStyle = () => {
    return {
      ...styles.externalIcon,
      transform: isHovered ? 'translateX(3px)' : 'translateX(0)'
    } as React.CSSProperties;
  };

  return (
    <section 
      id="contact" 
      ref={sectionRef}
      style={styles.section}
    >
      {/* Background decoration */}
      <div style={styles.backgroundDecoration}>
        <div style={styles.goldCircle1} />
        <div style={styles.goldCircle2} />
      </div>

      <div style={styles.container}>
        {/* Cabeçalho com botão de fechar quando algum componente está aberto */}
        {(mostrarCalendario || mostrarFormulario) && (
          <div style={styles.headerOverlay}>
            <button 
              onClick={fecharComponentes}
              style={styles.fecharButton}
            >
              ← Voltar para informações de contato
            </button>
          </div>
        )}

        {/* Exibe os componentes quando clicado */}
        {mostrarCalendario ? (
          <div style={styles.componentContainer}>
            <CalendarioAgendamento />
          </div>
        ) : mostrarFormulario ? (
          <div style={styles.componentContainer}>
            <FormAgendamento />
          </div>
        ) : (
          /* Layout normal quando nenhum componente está aberto */
          <div style={getGridStyles()}>
            {/* Content */}
            <div 
              style={{
                ...styles.content,
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateX(0)' : 'translateX(-50px)',
                transition: 'opacity 0.8s ease, transform 0.8s ease'
              }}
            >
              <span style={styles.subtitle}>
                Agendamento
              </span>
              <h2 style={getTitleStyles()}>
                PRONTO PARA <span style={styles.gradientText}>TRANSFORMAR</span> SEU CARRO?
              </h2>
              <p style={styles.description}>
                Agende uma consulta gratuita com nossos especialistas. 
                Analisaremos seu veículo e criaremos um plano personalizado 
                para atender suas necessidades e superar suas expectativas.
              </p>

              {/* Botão para abrir formulário */}
              <button
                style={{
                  ...styles.ctaButton,
                  backgroundColor: isHovered ? '#FFD700' : '#F1C232'
                }}
                onClick={abrirFormularioAgendamento}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                Agendar Agora
                <ExternalLink 
                  ref={externalLinkRef}
                  style={getExternalIconStyle()}
                />
              </button>

              {/* Contact Info */}
              <div style={getContactInfoGridStyles()}>
                {contactInfo.map((info, index) => {
                  const Icon = info.icon;
                  return (
                    <div
                      key={index}
                      style={{
                        ...styles.contactItem,
                        opacity: isVisible ? 1 : 0,
                        transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                        transition: `opacity 0.4s ease ${index * 0.1}s, transform 0.4s ease ${index * 0.1}s`
                      }}
                    >
                      <div style={styles.contactIconContainer}>
                        <Icon style={styles.contactIcon} />
                      </div>
                      <div>
                        <div style={styles.contactLabel}>
                          {info.label}
                        </div>
                        <div style={styles.contactValue}>
                          {info.value}
                        </div>
                        <div style={styles.contactDetail}>
                          {info.detail}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Booking Widget Placeholder */}
            <div 
              style={{
                ...styles.bookingWidget,
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateX(0)' : 'translateX(50px)',
                transition: 'opacity 0.8s ease, transform 0.8s ease'
              }}
            >
              <div style={styles.bookingCard}>
                <h3 style={styles.bookingTitle}>
                  ESCOLHA SUA OPÇÃO
                </h3>
                
                <div style={styles.widgetPlaceholder}>
                  <div style={styles.widgetIconContainer}>
                    <Clock style={styles.widgetIcon} />
                  </div>
                  <p style={styles.widgetText}>
                    Selecione como prefere agendar sua consulta:
                  </p>
                  
                  {/* Botões para escolher entre formulário e calendário */}
                  <div style={styles.buttonGroup}>
                    <button 
                      style={styles.optionButton}
                      onClick={abrirFormularioAgendamento}
                    >
                      📝 Preencher Formulário
                      <span style={styles.optionDescription}>
                        Solicite agendamento e entraremos em contato
                      </span>
                    </button>
                    
                    <button 
                      style={{
                        ...styles.optionButton,
                        backgroundColor: '#F1C232',
                        border: '2px solid #F1C232'
                      }}
                      onClick={abrirCalendario}
                    >
                      📅 Ver Calendário
                      <span style={styles.optionDescription}>
                        Selecione data e horário disponíveis
                      </span>
                    </button>
                  </div>
                </div>

                <p style={styles.widgetNote}>
                  Agendamento rápido e fácil. Confirmação instantânea.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

// Estilos CSS puro em constantes
const styles = {
  section: {
    padding: '6rem 0',
    backgroundColor: '#0a0a0a',
    color: '#ffffff',
    position: 'relative' as const,
    overflow: 'hidden'
  } as React.CSSProperties,
  
  backgroundDecoration: {
    position: 'absolute' as const,
    inset: 0,
    opacity: 0.3
  } as React.CSSProperties,
  
  goldCircle1: {
    position: 'absolute' as const,
    top: 0,
    right: 0,
    width: '24rem',
    height: '24rem',
    backgroundColor: 'rgba(241, 194, 50, 0.1)',
    borderRadius: '50%',
    filter: 'blur(3rem)'
  } as React.CSSProperties,
  
  goldCircle2: {
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    width: '24rem',
    height: '24rem',
    backgroundColor: 'rgba(241, 194, 50, 0.05)',
    borderRadius: '50%',
    filter: 'blur(3rem)'
  } as React.CSSProperties,
  
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 1rem',
    position: 'relative' as const,
    zIndex: 10
  } as React.CSSProperties,
  
  headerOverlay: {
    marginBottom: '2rem'
  } as React.CSSProperties,
  
  fecharButton: {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#F1C232',
    fontSize: '1rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 1rem',
    borderRadius: '0.375rem',
    transition: 'background-color 0.3s ease'
  } as React.CSSProperties,
  
  componentContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: '0.5rem',
    padding: '2rem',
    border: '1px solid #333',
    marginTop: '2rem'
  } as React.CSSProperties,
  
  grid: {
    display: 'grid',
    gap: '4rem',
    alignItems: 'start'
  } as React.CSSProperties,
  
  content: {
    maxWidth: '100%'
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
    marginBottom: '2rem',
    lineHeight: 1.7
  } as React.CSSProperties,
  
  ctaButton: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '1rem 2rem',
    backgroundColor: '#F1C232',
    color: '#000000',
    fontWeight: 600,
    fontSize: '1.125rem',
    borderRadius: '0.5rem',
    border: 'none',
    cursor: 'pointer',
    marginBottom: '3rem',
    transition: 'background-color 0.3s ease'
  } as React.CSSProperties,
  
  externalIcon: {
    width: '1.25rem',
    height: '1.25rem',
    marginLeft: '0.5rem',
    transition: 'transform 0.3s ease'
  } as React.CSSProperties,
  
  contactInfoGrid: {
    display: 'grid',
    gap: '1.5rem'
  } as React.CSSProperties,
  
  contactItem: {
    display: 'flex',
    gap: '1rem'
  } as React.CSSProperties,
  
  contactIconContainer: {
    width: '3rem',
    height: '3rem',
    borderRadius: '0.5rem',
    backgroundColor: 'rgba(241, 194, 50, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  } as React.CSSProperties,
  
  contactIcon: {
    width: '1.25rem',
    height: '1.25rem',
    color: '#F1C232'
  } as React.CSSProperties,
  
  contactLabel: {
    fontSize: '0.875rem',
    color: '#a0a0a0',
    marginBottom: '0.25rem'
  } as React.CSSProperties,
  
  contactValue: {
    fontWeight: 500,
    color: '#ffffff'
  } as React.CSSProperties,
  
  contactDetail: {
    fontSize: '0.875rem',
    color: '#a0a0a0',
    marginTop: '0.25rem'
  } as React.CSSProperties,
  
  bookingWidget: {
    width: '100%'
  } as React.CSSProperties,
  
  bookingCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: '0.5rem',
    border: '1px solid #333333',
    padding: '2rem'
  } as React.CSSProperties,
  
  bookingTitle: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '1.75rem',
    fontWeight: 700,
    marginBottom: '1.5rem',
    textAlign: 'center' as const,
    color: '#F1C232'
  } as React.CSSProperties,
  
  widgetPlaceholder: {
    backgroundColor: 'rgba(26, 26, 26, 0.5)',
    borderRadius: '0.5rem',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center' as const,
    padding: '2rem',
    border: '1px solid #333333'
  } as React.CSSProperties,
  
  widgetIconContainer: {
    width: '4rem',
    height: '4rem',
    borderRadius: '50%',
    backgroundColor: 'rgba(241, 194, 50, 0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '1.5rem'
  } as React.CSSProperties,
  
  widgetIcon: {
    width: '2rem',
    height: '2rem',
    color: '#F1C232'
  } as React.CSSProperties,
  
  widgetText: {
    color: '#ffffff',
    marginBottom: '2rem',
    fontSize: '1.1rem'
  } as React.CSSProperties,
  
  buttonGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem',
    width: '100%',
    maxWidth: '400px'
  } as React.CSSProperties,
  
  optionButton: {
    padding: '1.5rem',
    backgroundColor: '#F1C232',
    color: '#000000',
    fontWeight: 600,
    borderRadius: '0.5rem',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '1.1rem',
    transition: 'all 0.3s ease'
  } as React.CSSProperties,
  
  optionDescription: {
    fontSize: '0.85rem',
    color: 'rgba(0,0,0,0.8)',
    fontWeight: 400
  } as React.CSSProperties,
  
  widgetNote: {
    fontSize: '0.875rem',
    color: '#a0a0a0',
    textAlign: 'center' as const,
    marginTop: '1.5rem'
  } as React.CSSProperties
};

export default Contatosection;