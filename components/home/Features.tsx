import {
  BarChart3,
  FileText,
  Zap,
  Shield,
  TrendingUp,
  Brain,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    icon: FileText,
    title: "Sube cualquier formato",
    description:
      "Soporta texto, CSV, Excel, PDF y más. Procesamos tus datos automáticamente.",
  },
  {
    icon: Brain,
    title: "IA Avanzada",
    description:
      "Análisis inteligente con modelos de IA de última generación para insights precisos.",
  },
  {
    icon: Zap,
    title: "Resultados instantáneos",
    description:
      "Obtén insights en segundos, no en horas. Procesamiento rápido y eficiente.",
  },
  {
    icon: TrendingUp,
    title: "Visualizaciones claras",
    description:
      "Dashboards interactivos y gráficos que facilitan la comprensión de tus datos.",
  },
  {
    icon: Shield,
    title: "Seguridad empresarial",
    description:
      "Tus datos están protegidos con encriptación de nivel empresarial y cumplimiento GDPR.",
  },
  {
    icon: BarChart3,
    title: "Análisis predictivo",
    description:
      "No solo analizamos el presente, predecimos tendencias futuras para tu negocio.",
  },
];

export function Features() {
  return (
    <section id="features" className="py-20 md:py-32 bg-[#FFFEF7]">
      <div className="container px-4 mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-4">
            Todo lo que necesitas para tomar mejores decisiones
          </h2>
          <p className="text-lg text-muted-foreground">
            Herramientas poderosas diseñadas para equipos que buscan insights reales
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="border-2 hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}

