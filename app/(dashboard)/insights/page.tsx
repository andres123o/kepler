export default function InsightsPage() {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h2 
          className="text-3xl font-bold text-neutral-900 mb-2"
          style={{
            fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
            fontWeight: 700,
            letterSpacing: '-0.02em'
          }}
        >
          Historial de insights
        </h2>
        <p 
          className="text-neutral-600"
          style={{
            fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
          }}
        >
          Aquí verás todos los insights generados por IA
        </p>
      </div>
      
      {/* TODO: Implementar lista de insights */}
      <div className="bg-transparent rounded-xl border border-neutral-200/50 p-8 text-center">
        <p className="text-neutral-500">Lista de insights - En desarrollo</p>
      </div>
    </div>
  );
}

