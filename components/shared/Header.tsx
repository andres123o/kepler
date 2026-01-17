"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

export function Header() {
  const [hasScrolled, setHasScrolled] = useState(false);
  const [isOverDarkSection, setIsOverDarkSection] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("");
  const pathname = usePathname();

  // Detectar ruta actual y actualizar sección activa
  useEffect(() => {
    if (pathname === '/integraciones') {
      setActiveSection('integraciones');
    } else if (pathname === '/faqs') {
      setActiveSection('faqs');
    } else if (pathname === '/price') {
      setActiveSection('price');
    } else if (pathname === '/contact') {
      setActiveSection('contact');
    } else if (pathname === '/about') {
      setActiveSection('about');
    } else if (pathname === '/') {
      setActiveSection('home');
    } else {
      // Para otras rutas, mantener el estado actual o resetear
      setActiveSection('');
    }
  }, [pathname]);

  useEffect(() => {

    const handleScroll = () => {
      setHasScrolled(window.scrollY > 50);
      
      // Detectar si el header está sobre el div negro (card) de "Cómo funciona"
      const darkCard = document.getElementById('how-it-works-card');
      if (darkCard) {
        const headerHeight = 80; // Altura aproximada del header
        const cardRect = darkCard.getBoundingClientRect();
        const cardTop = cardRect.top;
        const cardBottom = cardRect.bottom;
        
        // El header está sobre el div negro solo si:
        // - El div está intersectando con el área del header (0 a headerHeight desde el top)
        // - cardTop debe estar por encima o en el área del header (<= headerHeight)
        // - cardBottom debe estar por debajo del inicio del header (> 0)
        // Esto asegura que el header está realmente sobre el div negro
        const isIntersecting = cardTop <= headerHeight && cardBottom > 0 && cardTop < cardBottom;
        
        setIsOverDarkSection(isIntersecting);
      } else {
        setIsOverDarkSection(false);
      }

      // Detectar sección activa para marcadores de posición (solo en home)
      if (pathname === '/') {
        const sections = ['home', 'faqs', 'price', 'about'];
        const scrollPosition = window.scrollY + 150; // Offset para detectar sección

        for (const section of sections) {
          const element = document.getElementById(section);
          if (element) {
            const { offsetTop, offsetHeight } = element;
            if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
              setActiveSection(section);
              break;
            }
          }
        }

        // Si estamos al inicio, marcar "home" como activo
        if (window.scrollY < 200) {
          setActiveSection('home');
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Llamar una vez al montar
    return () => window.removeEventListener('scroll', handleScroll);
  }, [pathname]);

  return (
    <header className="fixed top-0 z-50 w-full select-none">
      <div className="flex justify-center pt-4 px-4">
        {/* Cápsula con Efecto "Apple Liquid / VisionOS Material"
          
          Desglose de las claves del efecto:
          1.  `rounded-full`: Forma de pastilla esencial.
          2.  `backdrop-blur-[50px] backdrop-saturate-[1.8]`: Desenfoque extremo y alta saturación para que los colores del fondo "exploten" a través del vidrio.
          3.  `bg-gradient-to-b from-white/60 via-white/20 to-white/5`: El gradiente crucial. Muy brillante arriba (el reflejo líquido) y se desvanece hacia abajo.
          4.  `border border-white/40`: Un borde sutil y nítido.
          5.  `shadow-[...]`: LA CLAVE. Una sombra compleja compuesta:
              - `0_20px_40px_-10px_rgba(0,0,0,0.2)`: Sombra de caída suave y profunda para elevación.
              - `inset_0_2px_2px_0_rgba(255,255,255,0.8)`: El brillo blanco interno (rim light) en el borde superior.
              - `inset_0_-2px_5px_0_rgba(0,0,0,0.05)`: Una sutil sombra interna inferior para volumen.
        */}
        <div className={`
            relative w-full max-w-7xl mx-auto z-10
            rounded-full
            /* Material Base y Efectos Ópticos */
            backdrop-blur-[50px] backdrop-saturate-[1.8]
            
            /* Gradiente Líquido (Brillo superior intenso que se desvanece) */
            bg-gradient-to-b from-white/60 via-white/20 to-white/5
            dark:from-white/30 dark:via-white/10 dark:to-transparent
            
            /* Definición de Borde */
            border border-white/40 dark:border-white/20

            /* Sombras Complejas para Profundidad y Brillo Interno (Inset Shine) */

            transition-all duration-300 ease-in-out
            ${hasScrolled ? 'shadow-[0_4px_20px_rgba(0,0,0,0.08),0_2px_8px_rgba(0,0,0,0.04)]' : ''}
            `}>
            
          <div className="relative flex h-16 items-center justify-between px-6 md:px-8 lg:px-10">
            {/* Logo con Kepler */}
            <Link 
              href="/" 
              className="flex items-center space-x-2 group relative z-20"
            >
              <div className="transition-transform duration-300 group-hover:scale-110 group-active:scale-95 flex-shrink-0 w-12 h-12 relative filter drop-shadow-sm">
                <Image
                  src="https://res.cloudinary.com/dmyq0gr14/image/upload/v1765342242/unnamed-removebg-preview_xa4cji.png"
                  alt="Kepler Logo"
                  fill
                  className="object-contain"
                  sizes="48px"
                  priority
                  unoptimized={false}
                />
              </div>
              <span 
                className={`text-2xl font-bold tracking-tight drop-shadow-[0_1px_1px_rgba(255,255,255,0.5)] dark:drop-shadow-none transition-colors duration-300 ${
                  isOverDarkSection 
                    ? 'text-white' 
                    : 'text-neutral-900 dark:text-white/90'
                }`}
                style={{ 
                  fontFamily: 'var(--font-playfair), "Playfair Display", "Georgia", serif',
                  fontWeight: 800,
                  letterSpacing: '-0.02em'
                }}
              >
                Kepler
              </span>
            </Link>

            {/* Desktop Navigation - Estilo píldora en hover con marcadores minimalistas */}
            <nav className="hidden lg:flex items-center p-1 absolute left-1/2 -translate-x-1/2 bg-white/10 dark:bg-white/5 rounded-full border border-white/20 backdrop-blur-md shadow-sm">
              {[
                { label: 'Home', id: 'home', href: '/' },
                { label: 'Integraciones', id: 'integraciones', href: '/integraciones' },
                { label: 'FAQs', id: 'faqs', href: '/faqs' },
                { label: 'Price', id: 'price', href: '/price' },
                { label: 'Contacto', id: 'contact', href: '/contact' },
                { label: 'About', id: 'about', href: '/about' }
              ].map((item) => {
                const isActive = activeSection === item.id;
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    // Hover effect tipo píldora que se siente parte del material
                    className={`relative px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 hover:bg-white/40 dark:hover:bg-white/20 hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.6)] active:scale-95 ${
                      isOverDarkSection
                        ? 'text-white hover:text-white'
                        : 'text-neutral-800 dark:text-neutral-200 hover:text-black dark:hover:text-white'
                    }`}
                    style={{ 
                      fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                      letterSpacing: '-0.01em'
                    }}
                  >
                    {item.label}
                    {/* Marcador de posición minimalista */}
                    {isActive && (
                      <span 
                        className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full transition-all duration-300 ${
                          isOverDarkSection ? 'bg-white' : 'bg-neutral-900 dark:bg-white'
                        }`}
                      />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Auth Buttons */}
            <div className="flex items-center space-x-2 z-20">
              {/* En /login: solo mostrar botón "Registrarse" */}
              {/* En /register: solo mostrar botón "Iniciar Sesión" */}
              {/* En otras rutas: mostrar ambos botones */}
              {pathname === '/login' ? (
                <Button 
                  asChild
                  // Botón principal con gradiente sutil y sombra suave
                  className="bg-neutral-900/90 dark:bg-white/90 text-white dark:text-neutral-900 text-base font-semibold rounded-full px-6 py-2.5
                  shadow-[0_4px_10px_rgba(0,0,0,0.15)] dark:shadow-[0_4px_15px_rgba(255,255,255,0.2)]
                  hover:bg-black dark:hover:bg-white hover:scale-[1.02] active:scale-98 transition-all duration-300
                  border-t border-white/20
                  "
                >
                  <Link href="/register">Registrarse</Link>
                </Button>
              ) : pathname === '/register' ? (
                <Button 
                  variant="ghost" 
                  asChild
                  // Botón ghost mejorado para el entorno líquido
                  className={`hidden md:inline-flex text-base font-semibold rounded-full px-5 transition-all hover:shadow-[inset_0_1px_2px_rgba(255,255,255,0.5)] ${
                    isOverDarkSection
                      ? 'text-white hover:bg-white/20'
                      : 'text-neutral-800 dark:text-neutral-200 hover:bg-white/30 dark:hover:bg-white/10'
                  }`}
                >
                  <Link href="/login">Iniciar Sesión</Link>
                </Button>
              ) : (
                <>
                  <Button 
                    variant="ghost" 
                    asChild
                    // Botón ghost mejorado para el entorno líquido
                    className={`hidden md:inline-flex text-base font-semibold rounded-full px-5 transition-all hover:shadow-[inset_0_1px_2px_rgba(255,255,255,0.5)] ${
                      isOverDarkSection
                        ? 'text-white hover:bg-white/20'
                        : 'text-neutral-800 dark:text-neutral-200 hover:bg-white/30 dark:hover:bg-white/10'
                    }`}
                  >
                    <Link href="/login">Iniciar Sesión</Link>
                  </Button>
                  
                  <Button 
                    asChild
                    // Botón principal con gradiente sutil y sombra suave
                    className="bg-neutral-900/90 dark:bg-white/90 text-white dark:text-neutral-900 text-base font-semibold rounded-full px-6 py-2.5
                    shadow-[0_4px_10px_rgba(0,0,0,0.15)] dark:shadow-[0_4px_15px_rgba(255,255,255,0.2)]
                    hover:bg-black dark:hover:bg-white hover:scale-[1.02] active:scale-98 transition-all duration-300
                    border-t border-white/20
                    "
                  >
                    <Link href="/register">Registrarse</Link>
                  </Button>
                </>
              )}
              
              {/* Mobile Menu Button */}
              <Button 
                variant="ghost" 
                size="icon" 
                className={`lg:hidden rounded-full h-10 w-10 ml-1 transition-all hover:shadow-[inset_0_1px_2px_rgba(255,255,255,0.5)] ${
                  isOverDarkSection
                    ? 'text-white hover:bg-white/20'
                    : 'text-neutral-700 dark:text-neutral-300 hover:bg-white/30 dark:hover:bg-white/10'
                }`}
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}