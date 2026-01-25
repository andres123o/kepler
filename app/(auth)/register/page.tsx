"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2, Check, Instagram, Smartphone, Building2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { fetchCompanyContext } from "@/app/actions/fetch-company-context";
import { generateFirstAnalysis } from "@/app/actions/generate-first-analysis";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedPlan = searchParams.get("plan") || "hobby";
  
  // Campos básicos
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  
  // Campos adicionales
  const [companyName, setCompanyName] = useState("");
  const [instagramUsername, setInstagramUsername] = useState("");
  const [playStoreUrl, setPlayStoreUrl] = useState("");
  
  // Estados de UI
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isOAuthLoading, setIsOAuthLoading] = useState(false);
  const [showAdditionalFields, setShowAdditionalFields] = useState(false);
  const [basicFieldsValid, setBasicFieldsValid] = useState(false);
  
  // Validación en tiempo real
  const [instagramValid, setInstagramValid] = useState<boolean | null>(null);
  const [playStoreValid, setPlayStoreValid] = useState<boolean | null>(null);

  const supabase = createClient();
  
  // Validar campos básicos
  const validateBasicFields = () => {
    const valid = fullName.trim() !== "" && 
                  email.trim() !== "" && 
                  email.includes("@") && 
                  password.length >= 6;
    setBasicFieldsValid(valid);
    return valid;
  };
  
  // Validar Instagram username
  const validateInstagram = (username: string) => {
    if (!username.trim()) {
      setInstagramValid(null);
      return;
    }
    const clean = username.trim().replace(/^@/, '').replace(/\s+/g, '');
    setInstagramValid(clean.length >= 1 && /^[a-zA-Z0-9._]+$/.test(clean));
  };
  
  // Validar Play Store URL
  const validatePlayStore = (url: string) => {
    if (!url.trim()) {
      setPlayStoreValid(null);
      return;
    }
    const playStorePattern = /play\.google\.com\/store\/apps\/details/i;
    setPlayStoreValid(playStorePattern.test(url));
  };
  
  // Auto-completar nombre empresa desde email
  useEffect(() => {
    if (email && !companyName) {
      const emailDomain = email.split("@")[1];
      if (emailDomain) {
        const domainName = emailDomain.split(".")[0];
        if (domainName && domainName.length > 2) {
          const capitalized = domainName.charAt(0).toUpperCase() + domainName.slice(1);
          setCompanyName(capitalized);
        }
      }
    }
  }, [email, companyName]);
  
  // Validar campos básicos en tiempo real
  useEffect(() => {
    validateBasicFields();
  }, [fullName, email, password]);
  
  // Validar campos adicionales
  const validateAdditionalFields = () => {
    return companyName.trim() !== "" && 
           instagramUsername.trim() !== "" && 
           playStoreUrl.trim() !== "";
  };

  const handleBasicFieldsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!validateBasicFields()) {
      setError("Por favor completa todos los campos básicos correctamente");
      return;
    }
    
    // Expandir campos adicionales
    setShowAdditionalFields(true);
  };
  
  const handleEmailSignUp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError("");
    
    // Validar campos adicionales antes de continuar
    if (!validateAdditionalFields()) {
      setError("Por favor completa todos los campos para obtener tu análisis");
      return;
    }
    
    setIsLoading(true);

    try {
      // Determinar la URL base para redirecciones
      let baseUrl = window.location.origin;
      if (process.env.NEXT_PUBLIC_APP_URL) {
        baseUrl = process.env.NEXT_PUBLIC_APP_URL;
      } else if (window.location.hostname !== 'localhost' && !window.location.hostname.includes('127.0.0.1')) {
        baseUrl = 'https://www.iskepler.com';
      }

      // 1. Crear usuario en Supabase Auth
      // Guardar datos del formulario en user_metadata para que estén disponibles después de confirmar email
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            company_name: companyName.trim(),
            instagram_username: instagramUsername.trim(),
            playstore_url: playStoreUrl.trim(),
            registration_plan: selectedPlan,
          },
          emailRedirectTo: `${baseUrl}/auth/callback?plan=${selectedPlan}`,
        },
      });

      if (authError) throw authError;

      if (!authData.user) {
        throw new Error("No se pudo crear el usuario");
      }

      // 2. Verificar si necesita confirmar email
      if (authData.user && !authData.session) {
        // Email confirmation está habilitado
        // El perfil se crea automáticamente por el trigger
        // La organización se creará cuando confirme el email (en el callback o al iniciar sesión)
        setError("");
        setIsLoading(false);
        alert("¡Registro exitoso! Por favor, revisa tu correo y haz clic en el enlace de confirmación para activar tu cuenta. Luego podrás iniciar sesión.");
        router.push("/login");
        return;
      }

      // 3. Si tiene sesión activa (sin confirmación de email), crear organización
      if (authData.session && authData.user) {
        // El perfil ya fue creado por el trigger con el full_name del metadata
        // No necesitamos actualizarlo manualmente

        // Usar nombre de empresa si está disponible, sino usar el nombre completo
        const orgName = companyName.trim() || (fullName ? `${fullName}'s Organization` : "Mi Organización");
        
        // Crear organización con el plan seleccionado
        const trialEndsAt = selectedPlan === "hobby" 
          ? new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
          : null;

        const { data: organization, error: orgError } = await supabase
          .from("organizations")
          // @ts-ignore - Supabase client types issue in client components
          .insert({
            name: orgName,
            slug: `${authData.user.id}-${Date.now()}`,
            owner_id: authData.user.id,
            plan: selectedPlan as "hobby" | "startup" | "growth",
            trial_ends_at: trialEndsAt,
            subscription_status: selectedPlan === "hobby" ? "trial" : "active",
          } as any)
          .select()
          .single();

        if (orgError) {
          // Si la org ya existe, no es problema (puede pasar si se registra dos veces)
          if (!orgError.message.includes("duplicate") && !orgError.message.includes("unique")) {
            throw orgError;
          }
        }

        // Verificar que organization existe y tiene id
        const org = organization as any;
        if (!org || !org.id) {
          throw new Error("No se pudo crear la organización");
        }

        // 4. Crear data_sources si se proporcionaron datos (necesario antes de generar análisis)
        if ((instagramUsername.trim() || playStoreUrl.trim())) {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const dataSourcesToCreate: any[] = [];
            
            // Instagram data source
            if (instagramUsername.trim()) {
              const cleanInstagram = instagramUsername.trim().replace(/^@/, '').replace(/\s+/g, '');
              dataSourcesToCreate.push({
                organization_id: org.id,
                source_type: 'social',
                source_name: 'Instagram',
                social_platform: 'instagram',
                social_username: cleanInstagram,
                uploaded_by: user.id,
              });
            }
            
            // Play Store data source
            if (playStoreUrl.trim()) {
              dataSourcesToCreate.push({
                organization_id: org.id,
                source_type: 'app_store',
                source_name: 'Play Store',
                app_store_type: 'play_store',
                app_url: playStoreUrl.trim(),
                uploaded_by: user.id,
              });
            }
            
            // Insertar data sources
            if (dataSourcesToCreate.length > 0) {
              await supabase
                .from("data_sources")
                // @ts-ignore
                .insert(dataSourcesToCreate as any);
            }
          }
        }

        // 5. Ejecutar generación de primer análisis en background (no bloquea)
        // Esto ejecuta: scraping de contexto empresa + Instagram + Play Store + análisis automático
        if (companyName.trim()) {
          generateFirstAnalysis(
            org.id,
            companyName.trim(),
            authData.user.id,
            instagramUsername.trim() || undefined,
            playStoreUrl.trim() || undefined
          )
            .then((result) => {
              if (result.success) {
                console.log(`✅ Primer análisis generado exitosamente: ${result.insightId}`);
              } else {
                console.error(`⚠️ Error al generar primer análisis: ${result.error}`);
              }
            })
            .catch((error) => {
              console.error('⚠️ Error al ejecutar generateFirstAnalysis:', error);
            });
        }

        // Redirigir al dashboard
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Error al crear la cuenta");
    } finally {
      setIsLoading(false);
    }
  };
  

  const handleOAuthSignUp = async (provider: "google") => {
    setError("");
    setIsOAuthLoading(true);

    try {
      // Determinar la URL base: usar variable de entorno, o detectar producción, o usar origin actual
      let baseUrl = window.location.origin;
      if (process.env.NEXT_PUBLIC_APP_URL) {
        baseUrl = process.env.NEXT_PUBLIC_APP_URL;
      } else if (window.location.hostname !== 'localhost' && !window.location.hostname.includes('127.0.0.1')) {
        // En producción, usar la URL de producción
        baseUrl = 'https://www.iskepler.com';
      }
      
      const redirectUrl = `${baseUrl}/auth/callback?plan=${selectedPlan}`;
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: redirectUrl,
        },
      });

      if (error) throw error;
    } catch (err: any) {
      setError(err.message || "Error al iniciar sesión con Google");
      setIsOAuthLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFEF7] flex items-center justify-center px-4 pt-32 pb-12">
      <div className="w-full max-w-md">
        {!showAdditionalFields && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 
              className="text-3xl font-bold text-neutral-900 mb-2"
              style={{
                fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                fontWeight: 700,
                letterSpacing: '-0.02em'
              }}
            >
              Crea tu cuenta
            </h1>
            <p 
              className="text-muted-foreground text-sm"
              style={{
                fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
              }}
            >
              Solo necesitamos estos 3 datos para comenzar
            </p>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-neutral-200/50 p-6 md:p-8 bg-white/60 backdrop-blur-sm relative"
        >
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Cápsula de datos básicos completados - mitad arriba, mitad abajo */}
          {showAdditionalFields && (
            <motion.div
              initial={{ scale: 0, y: -20 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="absolute -top-6 left-1/2 -translate-x-1/2 z-10"
            >
              <div className="bg-gradient-to-r from-[#4A0072] via-[#C2185B] to-[#FF8C00] rounded-full px-5 py-2.5 shadow-lg">
                <div className="flex items-center gap-2 text-sm text-white whitespace-nowrap">
                  <Check className="w-4 h-4" />
                  <span className="font-semibold">Datos básicos completados</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Formulario principal */}
          <form onSubmit={showAdditionalFields ? handleEmailSignUp : handleBasicFieldsSubmit} className="space-y-4 relative overflow-visible">
            {/* Campos básicos - se deslizan hacia la izquierda */}
            <AnimatePresence mode="wait">
              {!showAdditionalFields && (
                <motion.div
                  key="basic-fields"
                  initial={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="space-y-4"
                >
              <div>
                <label 
                  htmlFor="fullName"
                  className="block text-sm font-semibold text-neutral-900 mb-2"
                  style={{
                    fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                  }}
                >
                  Nombre completo
                </label>
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-neutral-200/60 bg-white focus:outline-none transition-all"
                  style={{
                    fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                  }}
                  placeholder="Juan Pérez"
                />
              </div>

              <div>
                <label 
                  htmlFor="email"
                  className="block text-sm font-semibold text-neutral-900 mb-2"
                  style={{
                    fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                  }}
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-neutral-200/60 bg-white focus:outline-none transition-all"
                  style={{
                    fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                  }}
                  placeholder="tu@email.com"
                />
              </div>

              <div>
                <label 
                  htmlFor="password"
                  className="block text-sm font-semibold text-neutral-900 mb-2"
                  style={{
                    fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                  }}
                >
                  Contraseña
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-4 py-3 rounded-xl border border-neutral-200/60 bg-white focus:outline-none transition-all"
                  style={{
                    fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                  }}
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Campos adicionales - aparecen desde la derecha */}
            <AnimatePresence mode="wait">
              {showAdditionalFields && (
                <motion.div
                  key="additional-fields"
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 100 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="space-y-4"
                >
                  {/* Título y descripción dentro de la card */}
                  <div className="mb-6 text-center pt-4">
                    <h3 className="text-xl font-bold text-neutral-900 mb-2" style={{
                      fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                      fontWeight: 700,
                    }}>
                      Tu primer análisis en segundos
                    </h3>
                    <p className="text-sm text-neutral-600" style={{
                      fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                    }}>
                      Conecta tus canales y obtén tus primeros insights
                    </p>
                  </div>

                  <div>
                    <label 
                      htmlFor="companyName"
                      className="block text-sm font-semibold text-neutral-900 mb-2 flex items-center gap-2"
                      style={{
                        fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                      }}
                    >
                      <Building2 className="w-4 h-4" />
                      Nombre de la empresa
                    </label>
                    <input
                      id="companyName"
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-neutral-200/60 bg-white focus:outline-none transition-all"
                      style={{
                        fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                      }}
                      placeholder="Trii"
                    />
                  </div>

                  <div>
                    <label 
                      htmlFor="instagramUsername"
                      className="block text-sm font-semibold text-neutral-900 mb-2 flex items-center gap-2"
                      style={{
                        fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                      }}
                    >
                      <Instagram className="w-4 h-4" />
                      Usuario de Instagram
                    </label>
                    <div className="relative">
                      <input
                        id="instagramUsername"
                        type="text"
                        value={instagramUsername}
                        onChange={(e) => {
                          const value = e.target.value;
                          setInstagramUsername(value);
                          validateInstagram(value);
                        }}
                        required
                        className={`w-full px-4 py-3 rounded-xl border bg-white focus:outline-none transition-all ${
                          instagramValid === true 
                            ? 'border-green-300' 
                            : instagramValid === false
                            ? 'border-red-300'
                            : 'border-neutral-200/60'
                        }`}
                        style={{
                          fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                        }}
                        placeholder="@tu_empresa"
                      />
                      {instagramValid === true && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute right-3 top-1/2 -translate-y-1/2"
                        >
                          <Check className="w-5 h-5 text-green-500" />
                        </motion.div>
                      )}
                    </div>
                    {instagramValid === true && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xs text-green-600 mt-1"
                      >
                        ✓ Usuario válido
                      </motion.p>
                    )}
                  </div>

                  <div>
                    <label 
                      htmlFor="playStoreUrl"
                      className="block text-sm font-semibold text-neutral-900 mb-2 flex items-center gap-2"
                      style={{
                        fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                      }}
                    >
                      <Smartphone className="w-4 h-4" />
                      URL de Play Store
                    </label>
                    <div className="relative">
                      <input
                        id="playStoreUrl"
                        type="url"
                        value={playStoreUrl}
                        onChange={(e) => {
                          const value = e.target.value;
                          setPlayStoreUrl(value);
                          validatePlayStore(value);
                        }}
                        required
                        className={`w-full px-4 py-3 rounded-xl border bg-white focus:outline-none transition-all ${
                          playStoreValid === true 
                            ? 'border-green-300' 
                            : playStoreValid === false
                            ? 'border-red-300'
                            : 'border-neutral-200/60'
                        }`}
                        style={{
                          fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                        }}
                        placeholder="https://play.google.com/store/apps/details?id=..."
                      />
                      {playStoreValid === true && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute right-3 top-1/2 -translate-y-1/2"
                        >
                          <Check className="w-5 h-5 text-green-500" />
                        </motion.div>
                      )}
                    </div>
                    {playStoreValid === true && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xs text-green-600 mt-1"
                      >
                        ✓ URL válida
                      </motion.p>
                    )}
                  </div>

                  {/* Botón final */}
                  <Button
                    type="submit"
                    disabled={isLoading || isOAuthLoading || !validateAdditionalFields()}
                    className="w-full rounded-full bg-neutral-900 text-white font-semibold py-6 hover:bg-neutral-800 transition-colors disabled:cursor-not-allowed disabled:opacity-100"
                    style={{
                      fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                    }}
                  >
                    <span className={`flex items-center justify-center ${isLoading || isOAuthLoading || !validateAdditionalFields() ? "opacity-50" : ""}`}>
                      {isLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          <span>Creando cuenta...</span>
                        </>
                      ) : (
                        "Obtener análisis"
                      )}
                    </span>
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Botón inicial - solo visible cuando no hay campos adicionales */}
            {!showAdditionalFields && (
              <>
                <Button
                  type="submit"
                  disabled={!basicFieldsValid || isLoading || isOAuthLoading}
                  className="w-full rounded-full bg-neutral-900 text-white font-semibold py-6 hover:bg-neutral-800 transition-colors disabled:cursor-not-allowed disabled:opacity-100"
                  style={{
                    fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                  }}
                >
                  <span className={!basicFieldsValid || isLoading || isOAuthLoading ? "opacity-50" : ""}>
                    Continuar
                  </span>
                </Button>
                <div className="text-center mt-4">
                  <p className="text-sm text-neutral-600">
                    ¿Ya tienes cuenta?{" "}
                    <Link 
                      href="/login" 
                      className="text-neutral-900 font-semibold hover:underline"
                      style={{
                        fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                      }}
                    >
                      Inicia sesión
                    </Link>
                  </p>
                </div>
              </>
            )}
          </form>
        </motion.div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FFFEF7] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
      </div>
    }>
      <RegisterForm />
    </Suspense>
  );
}

