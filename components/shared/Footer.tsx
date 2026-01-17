"use client";

import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="relative bg-neutral-900 border-t border-neutral-700/40">
      <div className="container relative px-4 py-16 md:py-20 mx-auto max-w-7xl">
        {/* Grid principal - Minimalista y equilibrado */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-16 mb-16">
          {/* Brand Section */}
          <div className="col-span-2 md:col-span-1 space-y-4">
            <Link 
              href="/" 
              className="group flex items-center space-x-2.5 transition-transform duration-200 hover:scale-105"
            >
              <div className="relative w-10 h-10 flex-shrink-0 transition-transform duration-200 group-hover:scale-110">
                <Image
                  src="https://res.cloudinary.com/dmyq0gr14/image/upload/v1765342242/unnamed-removebg-preview_xa4cji.png"
                  alt="Kepler Logo"
                  fill
                  className="object-contain"
                  sizes="40px"
                  priority
                  unoptimized={false}
                />
              </div>
              <span 
                className="text-xl font-bold text-white"
                style={{ 
                  fontFamily: 'var(--font-playfair), "Playfair Display", "Georgia", serif',
                  fontWeight: 800,
                  letterSpacing: '-0.02em'
                }}
              >
                Kepler
              </span>
            </Link>
            <p 
              className="text-sm text-neutral-400 leading-relaxed"
              style={{
                fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
              }}
            >
              Transforma feedback en insights accionables con IA.
            </p>
          </div>

          {/* Product Section */}
          <div className="space-y-4">
            <h3 
              className="text-xs font-semibold text-white uppercase tracking-wider mb-4"
              style={{
                fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                fontWeight: 600,
                letterSpacing: '0.05em'
              }}
            >
              Producto
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="#features"
                  className="text-sm text-neutral-300 hover:text-white transition-colors duration-200"
                  style={{
                    fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                  }}
                >
                  Características
                </Link>
              </li>
              <li>
                <Link
                  href="#pricing"
                  className="text-sm text-neutral-300 hover:text-white transition-colors duration-200"
                  style={{
                    fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                  }}
                >
                  Precios
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  className="text-sm text-neutral-300 hover:text-white transition-colors duration-200"
                  style={{
                    fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                  }}
                >
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Section */}
          <div className="space-y-4">
            <h3 
              className="text-xs font-semibold text-white uppercase tracking-wider mb-4"
              style={{
                fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                fontWeight: 600,
                letterSpacing: '0.05em'
              }}
            >
              Empresa
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="#about"
                  className="text-sm text-neutral-300 hover:text-white transition-colors duration-200"
                  style={{
                    fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                  }}
                >
                  Acerca de
                </Link>
              </li>
              <li>
                <Link
                  href="#contact"
                  className="text-sm text-neutral-300 hover:text-white transition-colors duration-200"
                  style={{
                    fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                  }}
                >
                  Contacto
                </Link>
              </li>
              <li>
                <Link
                  href="#blog"
                  className="text-sm text-neutral-300 hover:text-white transition-colors duration-200"
                  style={{
                    fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                  }}
                >
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Section */}
          <div className="space-y-4">
            <h3 
              className="text-xs font-semibold text-white uppercase tracking-wider mb-4"
              style={{
                fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                fontWeight: 600,
                letterSpacing: '0.05em'
              }}
            >
              Legal
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="#privacy"
                  className="text-sm text-neutral-300 hover:text-white transition-colors duration-200"
                  style={{
                    fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                  }}
                >
                  Privacidad
                </Link>
              </li>
              <li>
                <Link
                  href="#terms"
                  className="text-sm text-neutral-300 hover:text-white transition-colors duration-200"
                  style={{
                    fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                  }}
                >
                  Términos
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider minimalista */}
        <div className="border-t border-neutral-700/40 mb-8"></div>

        {/* Copyright - Minimalista y centrado */}
        <div className="text-center">
          <p 
            className="text-xs text-neutral-500"
            style={{
              fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
            }}
          >
            &copy; {new Date().getFullYear()} Kepler. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
