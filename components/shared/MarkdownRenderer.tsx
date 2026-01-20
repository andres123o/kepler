'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface MarkdownRendererProps {
  content: string
  className?: string
}

export function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  return (
    <div className={`prose prose-lg max-w-none prose-headings:font-bold prose-headings:text-neutral-900 prose-p:text-neutral-700 prose-p:leading-relaxed prose-strong:text-neutral-900 prose-strong:font-semibold prose-ul:list-outside prose-ul:pl-6 prose-ul:space-y-1.5 prose-ol:list-outside prose-ol:pl-6 prose-ol:space-y-1.5 prose-li:text-neutral-700 prose-li:leading-relaxed prose-code:text-neutral-800 prose-blockquote:border-[#8A2BE2] prose-blockquote:text-neutral-600 prose-a:text-[#8A2BE2] prose-a:no-underline hover:prose-a:underline ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Personalizar estilos para que coincidan con el diseño
          h1: ({ children }) => (
            <h1 
              className="text-3xl font-bold text-neutral-900 mt-8 mb-4"
              style={{
                fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                fontWeight: 700,
                letterSpacing: '-0.02em'
              }}
            >
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 
              className="text-2xl font-bold text-neutral-900 mt-6 mb-3"
              style={{
                fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                fontWeight: 700,
              }}
            >
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 
              className="text-xl font-semibold text-neutral-800 mt-5 mb-2"
              style={{
                fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                fontWeight: 600,
              }}
            >
              {children}
            </h3>
          ),
          p: ({ children, node }) => {
            // Si el párrafo está dentro de un <li>, no agregar margin-bottom extra
            const isInsideListItem = (node?.position?.start?.column ?? 0) > 1;
            return (
              <p 
                className={`text-neutral-700 leading-relaxed ${isInsideListItem ? 'mb-0' : 'mb-4'}`}
                style={{
                  fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                }}
              >
                {children}
              </p>
            );
          },
          strong: ({ children }) => (
            <strong className="font-semibold text-neutral-900">{children}</strong>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-outside mb-4 space-y-1.5 text-neutral-700 pl-6">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-outside mb-4 space-y-1.5 text-neutral-700 pl-6">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li 
              className="leading-relaxed"
              style={{
                fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
              }}
            >
              {children}
            </li>
          ),
          code: ({ children, className }) => {
            const isInline = !className
            return isInline ? (
              <code className="px-1.5 py-0.5 bg-neutral-100 rounded text-sm font-mono text-neutral-800">
                {children}
              </code>
            ) : (
              <code className="block p-4 bg-neutral-100 rounded-lg text-sm font-mono text-neutral-800 overflow-x-auto mb-4">
                {children}
              </code>
            )
          },
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-[#8A2BE2] pl-4 italic text-neutral-600 my-4">
              {children}
            </blockquote>
          ),
          a: ({ href, children }) => (
            <a 
              href={href} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[#8A2BE2] hover:text-[#C2185B] underline transition-colors"
            >
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

