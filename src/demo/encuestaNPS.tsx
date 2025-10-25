import React, { useState } from 'react';
import { motion } from 'framer-motion';
import GlobalBackground from '../components/GlobalBackground';

// --- ICONOS ---
const Star = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26 12,2"></polygon></svg>;
const CheckCircle = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22,4 12,14.01 9,11.01"></polyline></svg>;

// --- COMPONENTE PRINCIPAL ---
const EncuestaNPS: React.FC = () => {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [responses, setResponses] = useState({
        npsScore: 0,
        reason: '',
        usabilityRating: 0,
        supportRating: 0,
        additionalComments: '',
        userEmail: ''
    });
    const [isCompleted, setIsCompleted] = useState(false);

    const questions = [
        {
            id: 'nps',
            title: '¿Qué tan probable es que recomiendes Kepler a un amigo?',
            subtitle: 'Escala de 0 (Nada probable) a 10 (Extremadamente probable)',
            type: 'scale',
            required: true,
            autoAdvance: true
        },
        {
            id: 'reason',
            title: '¿Cuál es la razón principal?',
            type: 'text-short',
            required: true,
            autoAdvance: false
        },
        {
            id: 'usability',
            title: '¿Cómo calificarías la facilidad de uso?',
            type: 'stars',
            required: false,
            autoAdvance: true
        },
        {
            id: 'support',
            title: '¿Cómo calificarías la velocidad del soporte?',
            type: 'stars',
            required: false,
            autoAdvance: true
        },
        {
            id: 'additional',
            title: '¿Algo más que agregar?',
            type: 'text-long',
            required: false,
            autoAdvance: false
        },
        {
            id: 'userEmail',
            title: '¿Cuál es tu correo electrónico?',
            type: 'email',
            required: true,
            autoAdvance: false
        }
    ];

    const progress = ((currentQuestion + 1) / questions.length) * 100;

    const handleNext = () => {
        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        } else {
            // Enviar encuesta
            handleSubmit();
        }
    };

    const handlePrevious = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(currentQuestion - 1);
        }
    };

    const handleSubmit = () => {
        // Crear ID único para esta encuesta
        const surveyId = `nps_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // Guardar en localStorage como base de datos simulada
        const surveyData = {
            id: surveyId,
            ...responses,
            timestamp: new Date().toISOString(),
            surveyType: 'NPS',
            status: 'completed'
        };
        
        // Obtener encuestas existentes
        const existingSurveys = JSON.parse(localStorage.getItem('npsSurveys') || '[]');
        
        // Agregar nueva encuesta
        existingSurveys.push(surveyData);
        
        // Guardar en localStorage
        localStorage.setItem('npsSurveys', JSON.stringify(existingSurveys));
        
        // También guardar la última encuesta para acceso rápido
        localStorage.setItem('lastNpsSurvey', JSON.stringify(surveyData));
        
        console.log('Encuesta guardada:', surveyData);
        console.log('Total de encuestas:', existingSurveys.length);
        
        setIsCompleted(true);
        
        // Llamada al webhook
        fetch('https://primary-production-a44da.up.railway.app/webhook/ad20ffc5-7e82-45f0-ba38-bb3d6c62c8b7', {
            method: 'GET'
        }).catch(() => {
            // No hacer nada si falla, es solo para simular
        });
    };

    const handleResponseChange = (field: string, value: any) => {
        setResponses({...responses, [field]: value});
        
        // Auto-advance si está habilitado
        const currentQ = questions[currentQuestion];
        if (currentQ.autoAdvance) {
            setTimeout(() => {
                handleNext();
            }, 800); // Pequeña pausa para que se vea la selección
        }
    };

    const renderScaleQuestion = () => {
        const scaleNumbers = Array.from({ length: 11 }, (_, i) => i);
        
        return (
            <div className="space-y-8">
                <div className="flex justify-center items-center gap-2">
                    {scaleNumbers.map((number) => (
                        <motion.button
                            key={number}
                            onClick={() => handleResponseChange('npsScore', number)}
                            className={`relative w-12 h-12 rounded-lg flex items-center justify-center text-lg font-medium transition-all duration-300 ${
                                responses.npsScore === number
                                    ? 'bg-white text-black'
                                    : 'bg-white/10 text-white/60 hover:bg-white/20 hover:text-white'
                            }`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {number}
                        </motion.button>
                    ))}
                </div>
                <div className="flex justify-between text-xs text-white/50 max-w-lg mx-auto px-4">
                    <span>Nada probable</span>
                    <span>Extremadamente probable</span>
                </div>
            </div>
        );
    };

    const renderStarRating = (field: 'usabilityRating' | 'supportRating') => {
        const stars = Array.from({ length: 5 }, (_, i) => i + 1);
        
        return (
            <div className="flex justify-center gap-2">
                {stars.map((star) => (
                    <motion.button
                        key={star}
                        onClick={() => handleResponseChange(field, star)}
                        className="group relative transition-all duration-300"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        <Star 
                            className={`w-8 h-8 transition-all duration-300 ${
                                responses[field] >= star
                                    ? 'text-white fill-current'
                                    : 'text-white/30 group-hover:text-white/60'
                            }`}
                        />
                    </motion.button>
                ))}
            </div>
        );
    };

    const renderTextInput = (type: 'text-short' | 'text-long' | 'email', field: string) => {
        const isLong = type === 'text-long';
        const isEmail = type === 'email';
        
        return (
            <div className="max-w-lg mx-auto">
                {isLong ? (
                    <input
                        type="text"
                        value={responses[field as keyof typeof responses] as string}
                        onChange={(e) => setResponses({...responses, [field]: e.target.value})}
                        placeholder="Escribe tu comentario aquí..."
                        className="w-full bg-transparent border-b border-white/30 text-white placeholder-white/50 focus:outline-none focus:border-white transition-all duration-300 text-center text-lg py-2"
                    />
                ) : isEmail ? (
                    <input
                        type="email"
                        value={responses[field as keyof typeof responses] as string}
                        onChange={(e) => setResponses({...responses, [field]: e.target.value})}
                        placeholder="tu@email.com"
                        className="w-full bg-transparent border-b border-white/30 text-white placeholder-white/50 focus:outline-none focus:border-white transition-all duration-300 text-center text-lg py-2"
                    />
                ) : (
                    <input
                        type="text"
                        value={responses[field as keyof typeof responses] as string}
                        onChange={(e) => setResponses({...responses, [field]: e.target.value})}
                        placeholder="Escribe tu respuesta aquí..."
                        className="w-full bg-transparent border-b border-white/30 text-white placeholder-white/50 focus:outline-none focus:border-white transition-all duration-300 text-center text-lg py-2"
                    />
                )}
            </div>
        );
    };

    const currentQ = questions[currentQuestion];
    const canProceed = currentQ.required ? 
        (currentQ.type === 'scale' ? responses.npsScore > 0 : responses[currentQ.id as keyof typeof responses] !== '') :
        true;

    if (isCompleted) {
        return (
            <div className="min-h-screen relative overflow-hidden">
                <div className="absolute inset-0">
                    <GlobalBackground />
                </div>
                
                <div className="relative z-10 min-h-screen flex items-center justify-center p-8">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className="text-center max-w-2xl mx-auto"
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.3, duration: 0.5, type: 'spring', stiffness: 200 }}
                            className="w-20 h-20 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-8"
                        >
                            <CheckCircle className="w-10 h-10 text-white" />
                        </motion.div>
                        
                        <h1 className="text-4xl font-bold text-white mb-6">
                            ¡Gracias por tu feedback!
                        </h1>
                        
                        <p className="text-xl text-white/80 mb-8">
                            Tu opinión es invaluable para nosotros y nos ayuda a mejorar Kepler cada día.
                        </p>
                    </motion.div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen relative overflow-hidden">
            <div className="absolute inset-0">
                <GlobalBackground />
            </div>
            
            <div className="relative z-10 min-h-screen flex flex-col">
                {/* Header */}
                <div className="relative p-6">
                    <div className="flex justify-between items-center">
                        <button
                            onClick={handlePrevious}
                            disabled={currentQuestion === 0}
                            className={`text-white/60 hover:text-white transition-colors ${currentQuestion === 0 ? 'opacity-40 cursor-not-allowed' : ''}`}
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        
                        <div className="flex items-center">
                            <img src="https://res.cloudinary.com/dmyq0gr14/image/upload/v1756477610/bdb7e186-ae74-4f96-b8cc-87899e487a38-removebg-preview_fsurl6.png" alt="Kepler Logo" className="h-5 w-auto" />
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 flex items-center justify-center p-8">
                    <motion.div
                        key={currentQuestion}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.5, ease: 'easeInOut' }}
                        className="text-center max-w-4xl mx-auto"
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                            className="mb-6"
                        >
                            <h2 className="text-xl md:text-2xl font-bold text-white mb-4 leading-tight">
                                <span className="bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent mr-2">{currentQuestion + 1} →</span>
                                {currentQ.title}
                            </h2>
                            
                            {currentQ.subtitle && (
                                <motion.p
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3, duration: 0.5 }}
                                    className="text-sm text-white/60 mb-8"
                                >
                                    {currentQ.subtitle}
                                </motion.p>
                            )}
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4, duration: 0.5 }}
                        >
                            {currentQ.type === 'scale' && renderScaleQuestion()}
                            {currentQ.type === 'stars' && renderStarRating(currentQ.id as 'usabilityRating' | 'supportRating')}
                            {currentQ.type === 'text-short' && renderTextInput('text-short', currentQ.id)}
                            {currentQ.type === 'text-long' && renderTextInput('text-long', currentQ.id)}
                            {currentQ.type === 'email' && renderTextInput('email', currentQ.id)}
                        </motion.div>

                        {/* Botón OK para preguntas de texto */}
                        {!currentQ.autoAdvance && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6, duration: 0.5 }}
                                className="mt-8"
                            >
                                <button
                                    onClick={handleNext}
                                    disabled={!canProceed}
                                    className={`px-8 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 mx-auto ${
                                        canProceed
                                            ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white hover:from-orange-600 hover:to-pink-600 hover:scale-105'
                                            : 'bg-white/10 text-white/40 cursor-not-allowed'
                                    }`}
                                >
                                    OK
                                    <CheckCircle className="w-4 h-4" />
                                </button>
                            </motion.div>
                        )}

                    </motion.div>
                </div>

                {/* Progress Bar */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                        className="h-full bg-gradient-to-r from-orange-500 to-pink-500"
                    />
                </div>
            </div>
        </div>
    );
};

export default EncuestaNPS;
