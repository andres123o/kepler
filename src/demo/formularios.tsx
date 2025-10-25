import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import GlobalBackground from '../components/GlobalBackground';


const FormulariosPanel: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'crear' | 'activos'>('crear');
    const [prompt, setPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedForm, setGeneratedForm] = useState<{name: string, url: string, type: 'NPS' | 'SCAT'} | null>(null);
    
    // Formularios activos con ejemplos predefinidos
    const [activeForms, setActiveForms] = useState<Array<{
        id: string;
        name: string;
        url: string;
        type: 'ONB' | 'SOP' | 'NPS' | 'SCAT';
        createdAt: string;
        responses: number;
        isActive: boolean;
    }>>([
        {
            id: 'form_1',
            name: 'Encuesta de Onboarding',
            url: '/encuesta/onboarding',
            type: 'ONB',
            createdAt: '2024-12-15T10:00:00.000Z',
            responses: 45,
            isActive: true
        },
        {
            id: 'form_2', 
            name: 'Evaluación de Soporte Q3',
            url: '/encuesta/soporte',
            type: 'SOP',
            createdAt: '2024-12-10T14:30:00.000Z',
            responses: 23,
            isActive: false
        }
    ]);

    const handleGenerate = () => {
        if (!prompt.trim()) return;
        
        setIsGenerating(true);
        
        // Simular generación por 2 segundos
        setTimeout(() => {
            // Detectar tipo de encuesta basado en el prompt
            const promptLower = prompt.toLowerCase();
            let formType: 'NPS' | 'SCAT' = 'NPS';
            let formName = '';
            
            if (promptLower.includes('nps') || promptLower.includes('recomendación') || promptLower.includes('recomendar')) {
                formType = 'NPS';
                formName = 'Encuesta NPS (Demo)';
            } else if (promptLower.includes('scat') || promptLower.includes('satisfacción') || promptLower.includes('satisfaccion') || promptLower.includes('soporte') || promptLower.includes('agente')) {
                formType = 'SCAT';
                formName = 'Encuesta SCAT (Demo)';
            } else {
                // Default a NPS si no se detecta
                formType = 'NPS';
                formName = 'Encuesta NPS (Demo)';
            }
            
            const formUrl = formType === 'NPS' ? '/encuesta/nps' : '/encuesta/scat';
            
            const newForm = {
                id: `form_${Date.now()}`,
                name: formName,
                url: formUrl,
                type: formType,
                createdAt: new Date().toISOString(),
                responses: getResponseCount(formType),
                isActive: true
            };
            
            // Agregar a formularios activos
            setActiveForms(prev => [newForm, ...prev]);
            
            // Mostrar resultado generado
            setGeneratedForm({
                name: formName,
                url: `${window.location.origin}${formUrl}`,
                type: formType
            });
            
            setIsGenerating(false);
            setPrompt('');
        }, 2000);
    };

    const handleCreateAnother = () => {
        setGeneratedForm(null);
        setPrompt('');
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    const openInNewTab = (url: string) => {
        window.open(url, '_blank');
    };

    const toggleFormStatus = (formId: string) => {
        setActiveForms(prev => prev.map(form => 
            form.id === formId 
                ? { ...form, isActive: !form.isActive }
                : form
        ));
    };

    // Función para obtener el conteo de respuestas desde localStorage
    const getResponseCount = (formType: 'NPS' | 'SCAT') => {
        if (formType === 'NPS') {
            const npsSurveys = JSON.parse(localStorage.getItem('npsSurveys') || '[]');
            return npsSurveys.length;
        } else if (formType === 'SCAT') {
            const scatSurveys = JSON.parse(localStorage.getItem('scatSurveys') || '[]');
            return scatSurveys.length;
        }
        return 0;
    };

    // Función para actualizar el conteo de respuestas
    const updateResponseCounts = () => {
        setActiveForms(prev => prev.map(form => {
            if (form.type === 'NPS' || form.type === 'SCAT') {
                return { ...form, responses: getResponseCount(form.type) };
            }
            return form;
        }));
    };

    // Actualizar conteos cuando se monta el componente
    useEffect(() => {
        updateResponseCounts();
        
        // Escuchar cambios en localStorage
        const handleStorageChange = () => {
            updateResponseCounts();
        };
        
        window.addEventListener('storage', handleStorageChange);
        
        // También actualizar cada 2 segundos para capturar cambios en la misma pestaña
        const interval = setInterval(updateResponseCounts, 2000);
        
        return () => {
            window.removeEventListener('storage', handleStorageChange);
            clearInterval(interval);
        };
    }, []);


    return (
        <div className="h-full w-full p-0 m-0 relative">
            <div className="absolute inset-0">
                <GlobalBackground />
            </div>
            
            <div className="relative z-10 h-full flex flex-col">
                {/* Navigation Tabs */}
                <div className="px-4 mb-6">
                    <div className="flex gap-2">
                        <button
                            onClick={() => setActiveTab('crear')}
                            className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                                activeTab === 'crear'
                                    ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white'
                                    : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
                            }`}
                        >
                            Crear Formulario
                        </button>
                        <button
                            onClick={() => setActiveTab('activos')}
                            className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                                activeTab === 'activos'
                                    ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white'
                                    : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
                            }`}
                        >
                            Formularios Activos
                        </button>
                    </div>
                </div>

                {/* Tab Content */}
                <div className="flex-1 px-4 pb-4">
                    {activeTab === 'crear' && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="relative overflow-hidden rounded-xl h-full"
                        >
                            <div className="absolute inset-0">
                            </div>
                            <div className="relative z-10 p-8 flex items-center justify-center h-full">
                                <div className="max-w-2xl w-full text-center">
                                    {!generatedForm ? (
                                        <div className="space-y-6">
                                            <div>
                                                <h3 className="text-2xl font-bold text-white mb-2">GENERADOR DE FORMULARIOS</h3>
                                                <p className="text-white/70">Describe la encuesta que necesitas y nuestra IA la creará por ti en segundos.</p>
                                            </div>
                                            
                                            <textarea
                                                value={prompt}
                                                onChange={(e) => setPrompt(e.target.value)}
                                                placeholder="Crea una encuesta NPS para clientes..."
                                                className="w-full h-32 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4 text-white placeholder-white/50 focus:outline-none focus:border-white/40 resize-none"
                                            />
                                            
                                            <button
                                                onClick={handleGenerate}
                                                disabled={!prompt.trim() || isGenerating}
                                                className={`px-8 py-3 rounded-lg font-semibold transition-all duration-300 ${
                                                    prompt.trim() && !isGenerating
                                                        ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white hover:from-orange-600 hover:to-pink-600 hover:scale-105'
                                                        : 'bg-white/10 text-white/40 cursor-not-allowed'
                                                }`}
                                            >
                                                {isGenerating ? 'Generando...' : 'Generar Encuesta'}
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            <div className="flex items-center justify-center gap-2 text-green-400 mb-4">
                                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                </svg>
                                                <span className="text-lg font-semibold">¡Encuesta generada con éxito!</span>
                                            </div>
                                            
                                            <div className="space-y-4">
                                                <div>
                                                    <p className="text-white/70 mb-2">Nombre:</p>
                                                    <p className="text-white font-medium">{generatedForm.name}</p>
                                                </div>
                                                
                                                <div>
                                                    <p className="text-white/70 mb-2">URL:</p>
                                                    <div className="flex gap-2">
                                                        <input
                                                            type="text"
                                                            value={generatedForm.url}
                                                            readOnly
                                                            className="flex-1 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-3 text-white text-sm"
                                                        />
                                                        <button
                                                            onClick={() => copyToClipboard(generatedForm.url)}
                                                            className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                                                        >
                                                            Copiar
                                                        </button>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex gap-3 justify-center">
                                                    <button
                                                        onClick={() => openInNewTab(generatedForm.url)}
                                                        className="px-6 py-2 bg-white text-black rounded-lg font-medium hover:bg-white/90 transition-colors"
                                                    >
                                                        Abrir en nueva pestaña
                                                    </button>
                                                    <button
                                                        onClick={handleCreateAnother}
                                                        className="px-6 py-2 bg-white/10 text-white rounded-lg font-medium hover:bg-white/20 transition-colors"
                                                    >
                                                        Crear otro formulario
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'activos' && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="relative overflow-hidden rounded-xl h-full"
                        >
                            <div className="absolute inset-0">
                            </div>
                            <div className="relative z-10 p-6 h-full">
                                <h3 className="text-lg font-semibold text-white mb-4">Todos los Formularios</h3>
                                
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-white/10">
                                                <th className="text-left py-3 px-4 text-white font-medium">NOMBRE</th>
                                                <th className="text-left py-3 px-4 text-white font-medium">URL (Link)</th>
                                                <th className="text-left py-3 px-4 text-white font-medium">TIPO</th>
                                                <th className="text-left py-3 px-4 text-white font-medium">RESPUESTAS</th>
                                                <th className="text-left py-3 px-4 text-white font-medium">ESTADO</th>
                                                <th className="text-left py-3 px-4 text-white font-medium">ACCIONES</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {activeForms.map((form) => (
                                                <tr key={form.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                                    <td className="py-3 px-4 text-white font-medium">{form.name}</td>
                                                    <td className="py-3 px-4 text-white/70 text-sm font-mono">{window.location.origin}{form.url}</td>
                                                    <td className="py-3 px-4">
                                                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                            form.type === 'ONB' 
                                                                ? 'bg-blue-500/20 text-blue-300' 
                                                                : form.type === 'SOP'
                                                                ? 'bg-green-500/20 text-green-300'
                                                                : form.type === 'NPS'
                                                                ? 'bg-purple-500/20 text-purple-300'
                                                                : 'bg-orange-500/20 text-orange-300'
                                                        }`}>
                                                            {form.type}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4 text-white/70">{form.responses}</td>
                                                    <td className="py-3 px-4">
                                                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                            form.isActive 
                                                                ? 'bg-green-500/20 text-green-300' 
                                                                : 'bg-red-500/20 text-red-300'
                                                        }`}>
                                                            {form.isActive ? 'Activo' : 'Inactivo'}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => toggleFormStatus(form.id)}
                                                                className={`px-3 py-1 text-xs rounded transition-all w-20 ${
                                                                    form.isActive
                                                                        ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30'
                                                                        : 'bg-green-500/20 text-green-300 hover:bg-green-500/30'
                                                                }`}
                                                            >
                                                                {form.isActive ? 'Desactivar' : 'Activar'}
                                                            </button>
                                                            <button
                                                                onClick={() => openInNewTab(`${window.location.origin}${form.url}`)}
                                                                className="px-3 py-1 bg-gradient-to-r from-orange-500 to-pink-500 text-white text-xs rounded hover:from-orange-600 hover:to-pink-600 transition-all"
                                                            >
                                                                Ver
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </motion.div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default FormulariosPanel;