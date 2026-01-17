"use client";

import Link from "next/link";
import Image from "next/image";
import { 
  LayoutDashboard, 
  Database, 
  Brain, 
  MessageSquare, 
  LogOut,
  Building2,
  Users,
  Settings
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useDashboard } from "./DashboardContext";

interface SidebarProps {
  organization: any;
  profile: any;
  activePanel?: string;
  onPanelChange?: (panel: string) => void;
}

export function Sidebar({ organization, profile, activePanel: externalActivePanel, onPanelChange: externalOnPanelChange }: SidebarProps) {
  const { activePanel: contextActivePanel, setActivePanel: contextSetActivePanel } = useDashboard();
  const activePanel = externalActivePanel || contextActivePanel;
  const onPanelChange = externalOnPanelChange || contextSetActivePanel;
  const router = useRouter();
  const supabase = createClient();

  const menuItems = [
    { panel: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { panel: "business", label: "Negocio", icon: Building2 },
    { panel: "team", label: "Define tu equipo", icon: Users },
    { panel: "data", label: "Conecta tus datos", icon: Database },
    { panel: "communication", label: "Elige cómo recibirlos", icon: MessageSquare },
    { panel: "insights", label: "Historial de insights", icon: Brain },
    { panel: "settings", label: "Configuración", icon: Settings },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <aside className="w-64 bg-neutral-900 h-full flex flex-col">
      {/* Logo */}
      <div className="p-6">
        <Link href="/dashboard" className="flex items-center gap-2 group">
          <div className="relative w-12 h-12 flex-shrink-0 transition-transform duration-300 group-hover:scale-110">
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
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePanel === item.panel;
            return (
              <li key={item.panel}>
                <button
                  onClick={() => onPanelChange?.(item.panel)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                    isActive
                      ? "bg-white text-neutral-900"
                      : "text-neutral-300 hover:bg-neutral-800 hover:text-white"
                  }`}
                  style={{
                    fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                  }}
                >
                  <Icon className="w-5 h-5" strokeWidth={2} />
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User info & Logout */}
      <div className="p-4 border-t border-neutral-800">
        {/* User info */}
        <div className="mb-3">
          <p 
            className="text-sm font-semibold text-white mb-1"
            style={{
              fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
            }}
          >
            {profile?.full_name || "Usuario"}
          </p>
          <p 
            className="text-xs text-neutral-400"
            style={{
              fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
            }}
          >
            {organization?.name || "Sin organización"}
          </p>
        </div>
        
        {/* Logout button - más pequeño y sutil, alineado a la izquierda */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-neutral-400 hover:text-neutral-300 hover:bg-neutral-800/50 transition-colors text-xs"
          style={{
            fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
          }}
        >
          <LogOut className="w-3.5 h-3.5" strokeWidth={2} />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
}

