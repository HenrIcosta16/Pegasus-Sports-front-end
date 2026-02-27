import React, { useState, useEffect, useRef } from "react";

// Placeholder gallery images
const galleryItems = [
  {
    id: 1,
    category: "Detalhamento",
    title: "Porsche 911 GT3",
    image: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&q=80",
  },
  {
    id: 2,
    category: "PPF",
    title: "Mercedes AMG GT",
    image: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80",
  },
  {
    id: 3,
    category: "Ceramic",
    title: "BMW M4 Competition",
    image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80",
  },
  {
    id: 4,
    category: "Personalização",
    title: "Audi RS6 Avant",
    image: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&q=80",
  },
  {
    id: 5,
    category: "Performance",
    title: "Lamborghini Huracán",
    image: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&q=80",
  },
  {
    id: 6,
    category: "Detalhamento",
    title: "Ferrari 488 Pista",
    image: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&q=80",
  },
];

const categories = ["Todos", "Detalhamento", "PPF", "Ceramic", "Personalização", "Performance"];

interface GalleryItem {
  id: number;
  category: string;
  title: string;
  image: string;
}

export const GallerySection = () => {
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  
  const sectionRef = useRef<HTMLElement>(null);
  const galleryItemRefs = useRef<(HTMLDivElement | null)[]>([]);

  const filteredItems: GalleryItem[] =
    activeCategory === "Todos"
      ? galleryItems
      : galleryItems.filter((item) => item.category === activeCategory);

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

  // Efeitos hover com event listeners
  useEffect(() => {
    const handleMouseEnter = (index: number) => {
      const item = galleryItemRefs.current[index];
      if (item) {
        const img = item.querySelector('img') as HTMLImageElement;
        const overlay = item.querySelector('[data-overlay]') as HTMLElement;
        const content = item.querySelector('[data-content]') as HTMLElement;
        const goldLine = item.querySelector('[data-goldline]') as HTMLElement;
        
        if (img) img.style.transform = 'scale(1.1)';
        if (overlay) overlay.style.opacity = '1';
        if (content) content.style.transform = 'translateY(0)';
        if (goldLine) goldLine.style.width = '100%';
      }
    };

    const handleMouseLeave = (index: number) => {
      const item = galleryItemRefs.current[index];
      if (item) {
        const img = item.querySelector('img') as HTMLImageElement;
        const overlay = item.querySelector('[data-overlay]') as HTMLElement;
        const content = item.querySelector('[data-content]') as HTMLElement;
        const goldLine = item.querySelector('[data-goldline]') as HTMLElement;
        
        if (img) img.style.transform = 'scale(1)';
        if (overlay) overlay.style.opacity = '0';
        if (content) content.style.transform = 'translateY(100%)';
        if (goldLine) goldLine.style.width = '0%';
      }
    };

    // Adiciona listeners para cada item
    filteredItems.forEach((_, index) => {
      const item = galleryItemRefs.current[index];
      if (item) {
        item.addEventListener('mouseenter', () => handleMouseEnter(index));
        item.addEventListener('mouseleave', () => handleMouseLeave(index));
      }
    });

    // Limpa listeners
    return () => {
      filteredItems.forEach((_, index) => {
        const item = galleryItemRefs.current[index];
        if (item) {
          item.removeEventListener('mouseenter', () => handleMouseEnter(index));
          item.removeEventListener('mouseleave', () => handleMouseLeave(index));
        }
      });
    };
  }, [filteredItems]);

  // Estilos responsivos dinâmicos
  const getGalleryGridStyles = () => {
    if (isDesktop) {
      return { ...styles.galleryGrid, gridTemplateColumns: 'repeat(3, 1fr)' };
    } else if (isTablet) {
      return { ...styles.galleryGrid, gridTemplateColumns: 'repeat(2, 1fr)' };
    } else {
      return { ...styles.galleryGrid, gridTemplateColumns: '1fr' };
    }
  };

  const getTitleStyles = () => {
    if (isDesktop) {
      return { ...styles.title, fontSize: '3.5rem' };
    } else if (isTablet) {
      return { ...styles.title, fontSize: '3rem' };
    } else {
      return styles.title;
    }
  };

  return (
    <section 
      id="gallery" 
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
            Nosso Trabalho
          </span>
          <h2 style={getTitleStyles()}>
            GALERIA DE <span style={styles.gradientText}>PROJETOS</span>
          </h2>
          <p style={styles.description}>
            Confira alguns dos veículos que passaram por nossas mãos 
            e receberam o tratamento Pegasus Motorsports.
          </p>
        </div>

        {/* Category Filter */}
        <div 
          style={{
            ...styles.filterContainer,
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 0.6s ease 0.2s, transform 0.6s ease 0.2s'
          }}
        >
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              style={{
                ...styles.filterButton,
                backgroundColor: activeCategory === category ? '#F1C232' : '#1a1a1a',
                color: activeCategory === category ? '#000000' : '#a0a0a0',
                border: activeCategory === category ? 'none' : '1px solid #333'
              }}
              onMouseEnter={(e) => {
                if (activeCategory !== category) {
                  e.currentTarget.style.backgroundColor = '#1a1a1a';
                  e.currentTarget.style.color = '#ffffff';
                }
              }}
              onMouseLeave={(e) => {
                if (activeCategory !== category) {
                  e.currentTarget.style.backgroundColor = '#1a1a1a';
                  e.currentTarget.style.color = '#a0a0a0';
                }
              }}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        <div style={getGalleryGridStyles()}>
          {filteredItems.map((item, index) => (
            <div
              key={item.id}
              ref={(el) => { galleryItemRefs.current[index] = el; }}
              style={{
                ...styles.galleryItem,
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'scale(1)' : 'scale(0.9)',
                transition: `opacity 0.4s ease ${index * 0.1}s, transform 0.4s ease ${index * 0.1}s`
              }}
            >
              <div style={styles.imageContainer}>
                <img
                  src={item.image}
                  alt={item.title}
                  style={styles.image}
                />
                {/* Overlay */}
                <div data-overlay style={styles.overlay} />
                {/* Content */}
                <div data-content style={styles.content}>
                  <span style={styles.category}>{item.category}</span>
                  <h3 style={styles.itemTitle}>{item.title}</h3>
                </div>
                {/* Gold accent line */}
                <div data-goldline style={styles.goldLine} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Estilos CSS puro com tipos corretos
const styles = {
  section: {
    padding: '6rem 0',
    backgroundColor: '#0a0a0a',
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
    margin: '0 auto 3rem'
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
  
  filterContainer: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    justifyContent: 'center',
    gap: '0.75rem',
    marginBottom: '3rem'
  } as React.CSSProperties,
  
  filterButton: {
    padding: '0.5rem 1.5rem',
    borderRadius: '9999px',
    fontSize: '0.875rem',
    fontWeight: 500,
    cursor: 'pointer',
    border: 'none',
    transition: 'all 0.3s ease'
  } as React.CSSProperties,
  
  galleryGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '1.5rem'
  } as React.CSSProperties,
  
  galleryItem: {
    position: 'relative' as const,
    aspectRatio: '4/3',
    borderRadius: '0.5rem',
    overflow: 'hidden',
    cursor: 'pointer'
  } as React.CSSProperties,
  
  imageContainer: {
    width: '100%',
    height: '100%',
    position: 'relative' as const
  } as React.CSSProperties,
  
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const,
    transition: 'transform 0.7s ease'
  } as React.CSSProperties,
  
  overlay: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(to top, #0a0a0a, rgba(10, 10, 10, 0.2), transparent)',
    opacity: 0,
    transition: 'opacity 0.5s ease'
  } as React.CSSProperties,
  
  content: {
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    right: 0,
    padding: '1.5rem',
    transform: 'translateY(100%)',
    transition: 'transform 0.5s ease'
  } as React.CSSProperties,
  
  category: {
    fontSize: '0.75rem',
    fontWeight: 500,
    color: '#F1C232',
    letterSpacing: '0.05em',
    textTransform: 'uppercase' as const,
    display: 'block'
  } as React.CSSProperties,
  
  itemTitle: {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: '#ffffff',
    marginTop: '0.25rem',
    fontFamily: "'Inter', sans-serif"
  } as React.CSSProperties,
  
  goldLine: {
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    width: '0%',
    height: '3px',
    backgroundColor: '#F1C232',
    transition: 'width 0.5s ease'
  } as React.CSSProperties
};

export default GallerySection;