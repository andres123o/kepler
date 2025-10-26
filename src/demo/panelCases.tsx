import React, { useState, useMemo, useEffect, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlobalBackground from '../components/GlobalBackground';
import { MdOutlineWhatsapp } from 'react-icons/md';
import { FaInstagram } from 'react-icons/fa';
import { BiLogoGmail } from 'react-icons/bi';
import { BsBrowserChrome } from 'react-icons/bs';

// --- ICONOS (SVG en línea para eliminar dependencias) ---
const Eye = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>;
const X = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
const AlertTriangle = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>;
const Clock = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;
const Search = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width={props.size || 30} height={props.size || 30} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>;
const ChevronDown = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>;



// --- SIMULACIÓN DE COMPONENTES DE UI ---
const Button = ({ children, className, ...props }: any) => <button className={`transition-all ${className}`} {...props}>{children}</button>;
const Input = ({ className, ...props }: any) => <input className={`bg-white/10 border-white/20 rounded-md p-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400 ${className}`} {...props} />;
const Textarea = ({ className, ...props }: any) => <textarea className={`bg-white/10 border-white/20 rounded-md p-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400 ${className}`} {...props} />;

// --- COMPONENTE DE FONDO REUTILIZABLE ---
const CardBackground = () => (
    <>
        <div className="absolute inset-0 rounded-2xl opacity-80" style={{ background: 'linear-gradient(to bottom,rgb(255, 133, 19) 0%,rgb(228, 113, 51) 20%,rgb(241, 100, 75) 40%,rgb(212, 87, 106) 60%, #b84378 80%,rgb(211, 38, 127) 100%)' }} />
        <div className="absolute inset-0 opacity-30 mix-blend-color-burn" style={{ background: `linear-gradient(45deg, transparent 25%, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.05) 50%, transparent 50%, transparent 75%, rgba(255,255,255,0.05) 75%)`, backgroundSize: '30px 30px' }} />
        <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity duration-500" style={{ backgroundImage: 'url(https://res.cloudinary.com/dmyq0gr14/image/upload/f_auto,q_auto,w_1920,c_fill/v1756495637/ilustracion-de-hawai-en-estilo-comico-retro_bg0093.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', mixBlendMode: 'multiply' }} />
    </>
);

// --- COMPONENTE MODAL NUEVO INCIDENTE ---
const NewIncidentModal: React.FC<{ isOpen: boolean, onClose: () => void, onSave: (incident: Omit<Incident, 'id'>) => void }> = ({ isOpen, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        customer_name: '',
        customer_email: '',
        customer_profile_url: '',
        country: 'COL' as Country,
        priority: 'Medio' as Priority,
        cx_agent: 'Alejandra',
        tech_rep: 'Camila',
        report_description: '',
        channel: 'Email' as Channel,
        incident_type: 'Falla in-app' as IncidentType
    });

    const generateTicketNumber = () => {
        const countryPrefix = formData.country === 'COL' ? 'CO' : formData.country === 'PE' ? 'PE' : 'CH';
        const randomNumber = Math.floor(Math.random() * 9000) + 1000;
        return `${countryPrefix}-${randomNumber}`;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newIncident = {
            ticket_number: generateTicketNumber(),
            cx_agent: formData.cx_agent,
            priority: formData.priority,
            customer_name: formData.customer_name,
            customer_email: formData.customer_email,
            country: formData.country,
            report_description: formData.report_description,
            status: 'En progreso' as Status,
            channel: formData.channel,
            incident_type: formData.incident_type,
            createdAt: new Date()
        };
        
        // Llamada al webhook
        fetch('https://primary-production-a44da.up.railway.app/webhook/ad20ffc5-7e82-45f0-ba38-bb3d6c62c8b7', {
            method: 'GET'
        }).catch(() => {
            // No hacer nada si falla, es solo para simular
        });
        
        onSave(newIncident);
        setFormData({
            customer_name: '',
            customer_email: '',
            customer_profile_url: '',
            country: 'COL' as Country,
            priority: 'Medio' as Priority,
            cx_agent: 'Alejandra',
            tech_rep: 'Camila',
            report_description: '',
            channel: 'Email' as Channel,
            incident_type: 'Falla in-app' as IncidentType
        });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-2">
            <div className="relative bg-slate-950 rounded-2xl border border-white/10 w-full max-w-5xl max-h-[98vh] overflow-hidden">
                {/* Header */}
                <div className="relative p-4 border-b border-white/10 overflow-hidden">
                    <div className="absolute inset-0 opacity-80" style={{ background: 'linear-gradient(to bottom,rgb(255, 133, 19) 0%,rgb(228, 113, 51) 20%,rgb(241, 100, 75) 40%,rgb(212, 87, 106) 60%, #b84378 80%,rgb(211, 38, 127) 100%)' }} />
                    <div className="absolute inset-0 opacity-30 mix-blend-color-burn" style={{ background: `linear-gradient(45deg, transparent 25%, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.05) 50%, transparent 50%, transparent 75%, rgba(255,255,255,0.05) 75%)`, backgroundSize: '30px 30px' }} />
                    <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity duration-500" style={{ backgroundImage: 'url(https://res.cloudinary.com/dmyq0gr14/image/upload/f_auto,q_auto,w_1920,c_fill/v1756495637/ilustracion-de-hawai-en-estilo-comico-retro_bg0093.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', mixBlendMode: 'multiply' }} />
                    <div className="relative z-10 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-white">Nuevo Incidente</h2>
                        <div className="flex gap-3">
                            <Button
                                type="button"
                                onClick={onClose}
                                className="bg-white/10 text-white/80 hover:bg-white/20 px-6 py-2 rounded-lg transition-all duration-200 font-medium"
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                form="new-incident-form"
                                className="bg-gradient-to-r from-orange-500 to-pink-500 text-white font-semibold px-6 py-2 rounded-lg hover:from-orange-600 hover:to-pink-600 transition-all duration-200"
                            >
                                Crear Incidente
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="relative p-4 flex-1 overflow-hidden">
                    <div className="absolute inset-0">
                        <GlobalBackground />
                    </div>
                    <div className="relative z-10 h-full overflow-y-auto scrollbar-hide">
                        <form id="new-incident-form" onSubmit={handleSubmit} className="space-y-4">
                            {/* Información del Cliente */}
                            <div className="p-4">
                                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                                    <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                                    Información del Cliente
                                </h3>
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-white/80">Nombre del Cliente</label>
                                        <Input
                                            value={formData.customer_name}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, customer_name: e.target.value})}
                                            placeholder="Nombre del cliente"
                                            required
                                            className="bg-white/10 border-white/20 rounded-lg px-2 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all w-75"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-white/80">Correo Electrónico</label>
                                        <Input
                                            type="email"
                                            value={formData.customer_email}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, customer_email: e.target.value})}
                                            placeholder="correo@ejemplo.com"
                                            required
                                            className="bg-white/10 border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all w-75"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-white/80">URL del Perfil del Cliente</label>
                                        <Input
                                            type="url"
                                            value={formData.customer_profile_url}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, customer_profile_url: e.target.value})}
                                            placeholder="https://perfil.ejemplo.com"
                                            className="bg-white/10 border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all w-80"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Configuración del Ticket */}
                            <div className="p-4">
                                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                                    <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
                                    Configuración del Ticket
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-white/80">País</label>
                                        <AnimatedSelect
                                            options={COUNTRY_OPTIONS}
                                            value={formData.country}
                                            onValueChange={(value: any) => setFormData({...formData, country: value as Country})}
                                            placeholder="Seleccionar país"
                                            className="w-58"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-white/80">Prioridad</label>
                                        <AnimatedSelect
                                            options={PRIORITY_OPTIONS}
                                            value={formData.priority}
                                            onValueChange={(value: any) => setFormData({...formData, priority: value as Priority})}
                                            placeholder="Seleccionar prioridad"
                                            className="w-58"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-white/80">Agente de CX</label>
                                        <AnimatedSelect
                                            options={AGENT_OPTIONS.filter(agent => agent !== 'Todos los agentes')}
                                            value={formData.cx_agent}
                                            onValueChange={(value: any) => setFormData({...formData, cx_agent: value})}
                                            placeholder="Seleccionar agente"
                                            className="w-58"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-white/80">Representante Tech</label>
                                        <AnimatedSelect
                                            options={TECH_REP_OPTIONS}
                                            value={formData.tech_rep}
                                            onValueChange={(value: any) => setFormData({...formData, tech_rep: value})}
                                            placeholder="Seleccionar representante"
                                            className="w-58"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Descripción del Reporte */}
                            <div className="p-4">
                                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                                    <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                                    Descripción del Reporte
                                </h3>
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-white/80">Descripción Detallada</label>
                                    <Textarea
                                        value={formData.report_description}
                                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({...formData, report_description: e.target.value})}
                                        placeholder="Describe detalladamente el problema o solicitud del cliente..."
                                        rows={2}
                                        required
                                        className="bg-white/10 border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all resize-none w-full"
                                    />
                                </div>
                            </div>

                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- TIPOS Y DATOS MOCK (CON NOMBRES DE PERSONAS) ---
type Status = 'En progreso' | 'Gestionado' | 'Pendiente';
type Priority = 'Alto' | 'Medio' | 'Bajo';
type Country = 'COL' | 'PE' | 'CHL';
type Channel = 'WhatsApp' | 'Instagram' | 'Email' | 'Web' | 'In-App';
type IncidentType = 'Falla in-app' | 'Pagos' | 'Interfaz';

interface Incident {
    id: number;
    ticket_number: string;
    cx_agent: string;
    priority: Priority;
    customer_name: string;
    customer_email: string;
    country: Country;
    report_description: string;
    status: Status;
    channel: Channel;
    incident_type: IncidentType;
    createdAt: Date | string | undefined;
}

// Función para generar un tiempo aleatorio entre 1 y 30 minutos
const getRandomMinutes = (max: number = 30) => Math.floor(Math.random() * max) + 1;

const mockIncidents: Incident[] = [
    // TICKETS EN PROGRESO (2) - ANS aleatorio máximo 30 minutos
    { id: 1, ticket_number: 'CO-01419', cx_agent: 'Alejandra', priority: 'Medio', customer_name: 'Brian Ordoñez', customer_email: 'brian.s.ordonez@gmail.com', country: 'COL', report_description: 'No le permite invertir en el fondo dinámico', status: 'En progreso', channel: 'WhatsApp', incident_type: 'Falla in-app', createdAt: new Date(Date.now() - getRandomMinutes(30) * 60 * 1000) },
    { id: 2, ticket_number: 'PE-00215', cx_agent: 'Laura', priority: 'Bajo', customer_name: 'Sofia Rodriguez', customer_email: 'sofia.r@email.com', country: 'PE', report_description: 'Consulta sobre comisiones de retiro', status: 'En progreso', channel: 'Email', incident_type: 'Pagos', createdAt: new Date(Date.now() - getRandomMinutes(30) * 60 * 1000) },
    
    // TICKETS GESTIONADOS/FINALIZADOS (3) - ANS aleatorio máximo 30 minutos
    { id: 3, ticket_number: 'CO-01418', cx_agent: 'Jesús', priority: 'Alto', customer_name: 'Wilson Vasquez', customer_email: 'wilsonap15@gmail.com', country: 'COL', report_description: 'Usuario no pasa validación, tiene slack', status: 'Gestionado', channel: 'Instagram', incident_type: 'Interfaz', createdAt: new Date(Date.now() - getRandomMinutes(30) * 60 * 1000) },
    { id: 4, ticket_number: 'CH-00876', cx_agent: 'Carlos', priority: 'Medio', customer_name: 'Mateo González', customer_email: 'mateo.g@email.com', country: 'CHL', report_description: 'La app se cierra al intentar abrir el mercado global', status: 'Gestionado', channel: 'Web', incident_type: 'Falla in-app', createdAt: new Date(Date.now() - getRandomMinutes(30) * 60 * 1000) },
    { id: 5, ticket_number: 'CO-01417', cx_agent: 'Jesús', priority: 'Alto', customer_name: 'Esteban Pérez', customer_email: 'esteban.david.perez0312@gmail.com', country: 'COL', report_description: 'Validación de foto, tiene slack', status: 'Gestionado', channel: 'In-App', incident_type: 'Interfaz', createdAt: new Date(Date.now() - getRandomMinutes(30) * 60 * 1000) },
];

const AGENT_OPTIONS = ['Todos los agentes', 'Alejandra', 'Jesús', 'Laura', 'Carlos'];
const COUNTRY_OPTIONS = ['COL', 'PE', 'CHL'];
const PRIORITY_OPTIONS = ['Alto', 'Medio', 'Bajo'];
const TECH_REP_OPTIONS = ['Camila', 'Andres', 'Jorge', 'Camilo'];
const INCIDENT_TYPE_OPTIONS = ['Falla in-app', 'Pagos', 'Interfaz'];

// --- COMPONENTES DE UI RE-ESTILIZADOS ---
const StatCard = memo<{ title: string, value: string | number, icon: React.ReactNode, backgroundImage?: string }>(({ title, value, icon, backgroundImage }) => (
    <div className="relative p-4 rounded-xl overflow-hidden border border-white/10 backdrop-blur-xl bg-white/5 flex items-center gap-4">
        {backgroundImage ? (
            <>
                <div className="absolute inset-0 opacity-80" style={{ background: 'linear-gradient(to bottom,rgb(255, 133, 19) 0%,rgb(228, 113, 51) 20%,rgb(241, 100, 75) 40%,rgb(212, 87, 106) 60%, #b84378 80%,rgb(211, 38, 127) 100%)' }} />
                <div className="absolute inset-0 opacity-30 mix-blend-color-burn" style={{ background: `linear-gradient(45deg, transparent 25%, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.05) 50%, transparent 50%, transparent 75%, rgba(255,255,255,0.05) 75%)`, backgroundSize: '30px 30px' }} />
                <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity duration-500" style={{ backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center', mixBlendMode: 'multiply' }} />
            </>
        ) : (
            <div className="absolute inset-0"><CardBackground /></div>
        )}
        <div className="relative z-10 p-3 bg-white/10 rounded-lg">{icon}</div>
        <div className="relative z-10">
            <p className="text-sm text-white/60">{title}</p>
            <p className="text-2xl font-bold text-white">{value}</p>
        </div>
    </div>
));

const AnimatedSelect = memo(({ value, onValueChange, options, placeholder = "Seleccionar...", className = "w-48" }: { value: any, onValueChange: (value: any) => void, options: any[], placeholder?: string, className?: string }) => {
    const [isOpen, setIsOpen] = useState(false);
    
    const handleToggle = useCallback(() => {
        setIsOpen(prev => !prev);
    }, []);
    
    const handleOptionClick = useCallback((option: any) => {
        onValueChange(option);
        setIsOpen(false);
    }, [onValueChange]);
    
    return (
      <div className={`relative ${className}`}>
        <button onClick={handleToggle} className="flex items-center justify-between w-full px-3 py-2 text-sm text-white/70 bg-white/10 rounded-md hover:bg-white/20 hover:text-white transition-colors">
          <span>{value || placeholder}</span>
          <ChevronDown className={`h-4 w-4 text-white/60 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        <AnimatePresence>
          {isOpen && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute right-0 w-full mt-2 origin-top-right bg-slate-950 border border-white/20 rounded-md shadow-lg z-50">
              <div className="py-1">
                {options.map((option: any) => (
                  <button key={option} onClick={() => handleOptionClick(option)} className="block w-full text-left px-4 py-2 text-sm text-white/70 hover:bg-white/20 hover:text-white transition-colors">
                    {option}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
});

const StatusBadge = memo<{ status: Status }>(({ status }) => {
    const colorMap = {
        'Gestionado': 'bg-green-500/20 text-green-300',
        'En progreso': 'bg-yellow-500/20 text-yellow-300',
        'Pendiente': 'bg-blue-500/20 text-blue-300',
    };
    return <span className={`px-2 py-1 text-xs font-medium rounded-full ${colorMap[status]}`}>{status}</span>;
});

const PriorityBadge = memo<{ priority: Priority }>(({ priority }) => {
    const colorMap = {
        'Alto': 'border-red-500/50 text-red-400',
        'Medio': 'border-yellow-500/50 text-yellow-400',
        'Bajo': 'border-green-500/50 text-green-400',
    };
    return <span className={`px-2 py-0.5 text-xs border rounded-full ${colorMap[priority]}`}>{priority}</span>;
});

// Función para calcular tiempo transcurrido (máximo 30 minutos)
const getTimeElapsed = (createdAt: Date | string | undefined): string => {
    if (!createdAt) {
        return '0 min';
    }
    
    const now = new Date();
    const createdAtDate = createdAt instanceof Date ? createdAt : new Date(createdAt);
    
    if (isNaN(createdAtDate.getTime())) {
        return '0 min';
    }
    
    const diffMs = now.getTime() - createdAtDate.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    // Si pasa de 30 minutos, mostrar 30 min como máximo
    const displayMins = Math.min(diffMins, 30);
    
    return `${displayMins} min`;
};

// Componente para mostrar el ícono del canal con nombre
const ChannelIcon = memo<{ channel?: Channel }>(({ channel }) => {
    return <span className="text-sm text-white/80">{channel || 'N/A'}</span>;
});

// --- COMPONENTE DEL MODAL ---
const IncidentModal: React.FC<{ incident: Incident | null, isOpen: boolean, onClose: () => void, onStatusChange?: (incidentId: number, newStatus: Status) => void }> = ({ incident, isOpen, onClose, onStatusChange }) => {
    const [comments, setComments] = useState<Array<{ name: string, comment: string }>>([]);
    const [newComment, setNewComment] = useState({ name: '', comment: '' });
    const [message, setMessage] = useState({ subject: '', content: '' });
    const [showNotification, setShowNotification] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState<Status>(incident?.status || 'En progreso');
    const [showSaveButton, setShowSaveButton] = useState(false);

    // Cargar comentarios desde localStorage al abrir el modal
    useEffect(() => {
        if (incident) {
            const savedComments = localStorage.getItem(`comments_${incident.id}`);
            if (savedComments) {
                setComments(JSON.parse(savedComments));
            }
            setSelectedStatus(incident.status);
            setShowSaveButton(false);
        }
    }, [incident]);

    if (!isOpen || !incident) return null;

    const addComment = () => {
        if (newComment.name && newComment.comment) {
            const updatedComments = [...comments, newComment];
            setComments(updatedComments);
            setNewComment({ name: '', comment: '' });
            
            // Guardar en localStorage simulando base de datos
            localStorage.setItem(`comments_${incident.id}`, JSON.stringify(updatedComments));
        }
    };

    const sendResponse = () => {
        if (message.subject && message.content) {
            // Llamada al webhook
            fetch('https://primary-production-a44da.up.railway.app/webhook/6b936286-a74d-4bb7-8e89-97c4f49e28da', {
                method: 'GET'
            }).catch(() => {
                // No hacer nada si falla, es solo para simular
            });
            
            // Simular envío de respuesta
            setShowNotification(true);
            setMessage({ subject: '', content: '' });
            
            // Ocultar notificación después de 3 segundos
            setTimeout(() => {
                setShowNotification(false);
            }, 3000);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="relative bg-slate-950 rounded-2xl border border-white/10 w-full max-w-4xl max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-track-slate-950 scrollbar-thumb-slate-600 hover:scrollbar-thumb-slate-500">
                {/* Header */}
                <div className="relative p-6 border-b border-white/10 overflow-hidden">
                    <div className="absolute inset-0 opacity-80" style={{ background: 'linear-gradient(to bottom,rgb(255, 133, 19) 0%,rgb(228, 113, 51) 20%,rgb(241, 100, 75) 40%,rgb(212, 87, 106) 60%, #b84378 80%,rgb(211, 38, 127) 100%)' }} />
                    <div className="absolute inset-0 opacity-30 mix-blend-color-burn" style={{ background: `linear-gradient(45deg, transparent 25%, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.05) 50%, transparent 50%, transparent 75%, rgba(255,255,255,0.05) 75%)`, backgroundSize: '30px 30px' }} />
                    <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity duration-500" style={{ backgroundImage: 'url(https://res.cloudinary.com/dmyq0gr14/image/upload/f_auto,q_auto,w_1920,c_fill/v1756495637/ilustracion-de-hawai-en-estilo-comico-retro_bg0093.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', mixBlendMode: 'multiply' }} />
                    <div className="relative z-10 flex justify-between items-start">
                        <div>
                            <h2 className="text-2xl font-bold text-white">Detalle del incidente {incident.ticket_number}</h2>
                            <p className="text-white/60 mt-1">Información completa del ticket</p>
                        </div>
                        <button onClick={onClose} className="text-white/60 hover:text-white transition-colors">
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="relative p-6 space-y-6">
                    <div className="relative z-10 space-y-6">
                    {/* Incident Details */}
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm text-white/60">Fecha del incidente</label>
                                <p className="text-white">2024-01-15</p>
                            </div>
                            <div>
                                <label className="text-sm text-white/60">Prioridad</label>
                                <p className="text-white"><PriorityBadge priority={incident.priority} /></p>
                            </div>
                            <div>
                                <label className="text-sm text-white/60">Nombre del cliente</label>
                                <p className="text-white">{incident.customer_name}</p>
                            </div>
                            <div>
                                <label className="text-sm text-white/60">Correo del cliente</label>
                                <p className="text-white">{incident.customer_email}</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm text-white/60">País</label>
                                <p className="text-white">{incident.country}</p>
                            </div>
                            <div>
                                <label className="text-sm text-white/60">Agente de CX</label>
                                <p className="text-white">{incident.cx_agent}</p>
                            </div>
                            <div>
                                <label className="text-sm text-white/60">URL del perfil del cliente</label>
                                <p className="text-white break-all">https://perfil.cliente.com/{incident.customer_name.toLowerCase().replace(' ', '-')}</p>
                            </div>
                            <div>
                                <label className="text-sm text-white/60">Representante Tech</label>
                                <AnimatedSelect 
                                    value="Camila" 
                                    onValueChange={(value: any) => console.log(value)}
                                    options={['Camila', 'Andres', 'Jorge', 'Camilo']}
                                    placeholder="Seleccionar representante"
                                    className="w-full"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="text-sm text-white/60">Descripción del reporte</label>
                        <p className="text-white bg-white/5 rounded-md p-3 mt-1">{incident.report_description}</p>
                    </div>

                    {/* Status and Channel */}
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="text-sm text-white/60">Estado</label>
                            <AnimatedSelect 
                                value={selectedStatus} 
                                onValueChange={(value: any) => {
                                    setSelectedStatus(value);
                                    setShowSaveButton(value !== incident.status);
                                }}
                                options={['Pendiente', 'En progreso', 'Gestionado']}
                                placeholder="Seleccionar estado"
                                className="w-full"
                            />
                            {showSaveButton && (
                                <Button 
                                    onClick={async () => {
                                        if (incident && onStatusChange) {
                                            // Preparar los datos del cambio de estado
                                            const statusChangeData = {
                                                incident_id: incident.id,
                                                ticket_number: incident.ticket_number,
                                                old_status: incident.status,
                                                new_status: selectedStatus,
                                                updated_at: new Date().toISOString()
                                            };
                                            
                                            console.log('📤 Enviando cambio de estado al webhook:', statusChangeData);
                                            
                                            // Enviar el cambio de estado al webhook
                                            try {
                                                const response = await fetch('https://primary-production-a44da.up.railway.app/webhook/71242354-cfda-4be0-842f-2d6a50cc2c17', {
                                                    method: 'POST',
                                                    headers: {
                                                        'Content-Type': 'application/json'
                                                    },
                                                    body: JSON.stringify(statusChangeData)
                                                });
                                                
                                                console.log('✅ Respuesta del webhook:', await response.text());
                                            } catch (error) {
                                                console.error('❌ Error al enviar cambio de estado:', error);
                                            }
                                            
                                            onStatusChange(incident.id, selectedStatus);
                                            setShowSaveButton(false);
                                        }
                                    }}
                                    className="mt-2 bg-gradient-to-r from-orange-500 to-pink-500 font-semibold px-4 py-2 rounded-md text-sm w-full"
                                >
                                    Guardar Cambio
                                </Button>
                            )}
                        </div>
                        <div>
                            <label className="text-sm text-white/60">Tiempo transcurrido</label>
                            <p className="text-white">{getTimeElapsed(incident.createdAt)}</p>
                        </div>
                        <div>
                            <label className="text-sm text-white/60">Canal</label>
                            <div className="flex items-center gap-2 mt-2">
                                <ChannelIcon channel={incident.channel} />
                            </div>
                        </div>
                    </div>

                    {/* Comments Section */}
                    <div className="border-t border-white/10 pt-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Comentarios del incidente</h3>
                        
                        {/* Add Comment */}
                        <div className="bg-white/5 rounded-lg p-4 mb-4">
                            <div className="space-y-3">
                                <input
                                    type="text"
                                    placeholder="Nombre"
                                    value={newComment.name}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewComment({...newComment, name: e.target.value})}
                                    className="w-full bg-white/10 text-white/70 rounded-md px-3 py-2 text-sm hover:bg-white/20 hover:text-white transition-colors placeholder-white/50"
                                />
                                <textarea
                                    placeholder="Escribe tu comentario..."
                                    value={newComment.comment}
                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewComment({...newComment, comment: e.target.value})}
                                    className="w-full bg-white/10 text-white/70 rounded-md px-3 py-2 text-sm hover:bg-white/20 hover:text-white transition-colors placeholder-white/50"
                                    rows={3}
                                />
                                <div className="flex justify-start">
                                    <Button onClick={addComment} className="bg-gradient-to-r from-orange-500 to-pink-500 font-semibold px-4 py-2 rounded-md">
                                        Agregar comentario
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Comments List */}
                        <div className="space-y-3">
                            {comments.map((comment, index) => (
                                <div key={index} className="bg-white/5 rounded-lg p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-white font-medium">{comment.name}</span>
                                        <span className="text-white/60 text-sm">hace 2 horas</span>
                                    </div>
                                    <p className="text-white/80">{comment.comment}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Send Response Section */}
                    <div className="border-t border-white/10 pt-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Enviar respuesta al cliente</h3>
                        <div className="space-y-4">
                            <input
                                type="text"
                                placeholder="Asunto del mensaje"
                                value={message.subject}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMessage({...message, subject: e.target.value})}
                                className="w-full bg-white/10 text-white/70 rounded-md px-3 py-2 text-sm hover:bg-white/20 hover:text-white transition-colors placeholder-white/50"
                            />
                            <textarea
                                placeholder="Escribe el mensaje para el cliente..."
                                value={message.content}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMessage({...message, content: e.target.value})}
                                className="w-full bg-white/10 text-white/70 rounded-md px-3 py-2 text-sm hover:bg-white/20 hover:text-white transition-colors placeholder-white/50"
                                rows={4}
                            />
                            <div className="flex items-center gap-2 flex-wrap">
                                <Button 
                                    onClick={sendResponse}
                                    className="bg-gradient-to-r from-orange-500 to-pink-500 font-semibold px-4 py-2 rounded-md hover:from-orange-600 hover:to-pink-600 transition-all duration-200"
                                >
                                    Enviar respuesta
                                </Button>
                                <input
                                    type="file"
                                    multiple
                                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif"
                                    className="bg-white/10 text-white/70 rounded-md px-3 py-2 text-sm hover:bg-white/20 hover:text-white transition-colors file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:bg-white/20 file:text-white file:cursor-pointer"
                                />
                            </div>
                        </div>
                    </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="relative z-10 p-6 border-t border-white/10 bg-slate-950">
                    <div className="flex justify-between items-center">
                        <div className="text-white/60 text-sm">
                            Estado del ticket: <span className="text-white font-medium">{incident.status}</span>
                        </div>
                        <Button onClick={onClose} className="bg-white/10 text-white/70 px-4 py-2 rounded-md hover:bg-white/20 hover:text-white transition-colors">
                            Cerrar
                        </Button>
                    </div>
                </div>
            </div>

            {/* Notificación de éxito */}
            {showNotification && (
                <div className="fixed top-4 right-4 text-white px-6 py-3 rounded-lg shadow-lg z-[10001] flex items-center gap-2" style={{ background: 'linear-gradient(to bottom,rgb(255, 133, 19) 0%,rgb(228, 113, 51) 20%,rgb(241, 100, 75) 40%,rgb(212, 87, 106) 60%, #b84378 80%,rgb(211, 38, 127) 100%)' }}>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Respuesta enviada con éxito
                </div>
            )}
        </div>
    );
};

// --- COMPONENTE PRINCIPAL DEL PANEL ---
const CasesPanel: React.FC = () => {
    const [incidents, setIncidents] = useState(mockIncidents);
    const [statusFilterType, setStatusFilterType] = useState('En proceso');
    const [agentFilter, setAgentFilter] = useState('Todos los agentes');
    const [dateFilter, setDateFilter] = useState('');
    const [searchTicket, setSearchTicket] = useState('');
    const [debouncedSearchTicket, setDebouncedSearchTicket] = useState('');
    const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isNewIncidentModalOpen, setIsNewIncidentModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Debounce para la búsqueda
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTicket(searchTicket);
        }, 300);
        
        return () => clearTimeout(timer);
    }, [searchTicket]);

    // Cargar datos desde localStorage al inicializar
    useEffect(() => {
        const savedIncidents = localStorage.getItem('incidents');
        
        // Limpiar localStorage si hay datos antiguos sin channel (para evitar problemas)
        const needsReset = savedIncidents && JSON.parse(savedIncidents).some((inc: any) => !inc.channel);
        if (needsReset) {
            localStorage.removeItem('incidents');
        }
        
        if (savedIncidents && !needsReset) {
            const parsed = JSON.parse(savedIncidents);
            // Convertir createdAt de string a Date y agregar defaults si faltan campos
            const incidentsWithDates = parsed.map((incident: any) => {
                return {
                    ...incident,
                    createdAt: incident.createdAt 
                        ? (typeof incident.createdAt === 'string' ? new Date(incident.createdAt) : incident.createdAt)
                        : new Date(Date.now() - Math.random() * 48 * 60 * 60 * 1000)
                };
            });
            setIncidents(incidentsWithDates);
        }
        setIsLoading(false);
    }, []);

    // Listen para recibir incidentes del webhook en tiempo real
    useEffect(() => {
        const handleIncidentCreated = (event: any) => {
            const newIncident = event.detail;
            setIncidents(prev => [...prev, newIncident]);
        };

        window.addEventListener('incident-created', handleIncidentCreated);
        
        return () => {
            window.removeEventListener('incident-created', handleIncidentCreated);
        };
    }, []);

    const handleNewIncident = useCallback((newIncidentData: Omit<Incident, 'id'>) => {
        const newIncident: Incident = {
            ...newIncidentData,
            id: Math.max(...incidents.map(i => i.id)) + 1
        };
        const updatedIncidents = [...incidents, newIncident];
        setIncidents(updatedIncidents);
        
        // Guardar en localStorage para persistencia durante la sesión
        localStorage.setItem('incidents', JSON.stringify(updatedIncidents));
    }, [incidents]);

    const filteredIncidents = useMemo(() => {
        if (isLoading) return [];
        
        let filtered = incidents;
        
        // Filtro por estado
        if (statusFilterType === 'Finalizados') {
            filtered = filtered.filter(inc => inc.status === 'Gestionado');
        } else {
            filtered = filtered.filter(inc => inc.status !== 'Gestionado');
        }

        // Filtro por agente
        if (agentFilter !== 'Todos los agentes') {
            filtered = filtered.filter(inc => inc.cx_agent === agentFilter);
        }

        // Filtro por ticket
        if (debouncedSearchTicket) {
            filtered = filtered.filter(inc => 
                inc.ticket_number.toLowerCase().includes(debouncedSearchTicket.toLowerCase())
            );
        }

        // Filtro por fecha (simulado - en una app real vendría de la base de datos)
        if (dateFilter) {
            const selectedDate = new Date(dateFilter);
            // Simulamos que algunos incidentes tienen fechas específicas
            const mockDates = [
                new Date('2024-01-15'),
                new Date('2024-01-16'),
                new Date('2024-01-17'),
                new Date('2024-01-18'),
                new Date('2024-01-19'),
                new Date('2024-01-20')
            ];
            
            filtered = filtered.filter((_, index) => {
                const incidentDate = mockDates[index % mockDates.length];
                return incidentDate.toDateString() === selectedDate.toDateString();
            });
        }

        // Ordenar por prioridad: Alto > Medio > Bajo
        const priorityOrder = { 'Alto': 1, 'Medio': 2, 'Bajo': 3 };
        filtered = filtered.sort((a, b) => {
            return priorityOrder[a.priority] - priorityOrder[b.priority];
        });

        return filtered;
    }, [incidents, statusFilterType, agentFilter, dateFilter, debouncedSearchTicket, isLoading]);

    const stats = useMemo(() => ({
        total: filteredIncidents.length,
        highPriority: filteredIncidents.filter(i => i.priority === 'Alto').length,
        pending: filteredIncidents.filter(i => i.status === 'Pendiente').length,
    }), [filteredIncidents]);

    if (isLoading) {
        return (
            <div className="h-full w-full flex items-center justify-center text-white">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    <p className="text-white/60">Cargando panel de casos...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full w-full flex flex-col text-white p-0 m-0 overflow-auto">
            {/* Header section with minimal padding */}
            <div className="flex-shrink-0 pb-2 px-4 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <StatCard 
                        title="Total Incidentes" 
                        value={stats.total} 
                        icon={<Eye size={24} className="text-yellow-400" />}
                        backgroundImage="https://res.cloudinary.com/dmyq0gr14/image/upload/v1756505436/escena-de-verano-del-estilo-de-vida-de-los-dibujos-animados_we0fan.jpg"
                    />
                    <StatCard 
                        title="Alta Prioridad" 
                        value={stats.highPriority} 
                        icon={<AlertTriangle size={24} className="text-yellow-400" />}
                        backgroundImage="https://res.cloudinary.com/dmyq0gr14/image/upload/v1756505290/ilustracion-de-hawai-en-estilo-comico-retro_1_bbrnqq.jpg"
                    />
                    <StatCard 
                        title="Pendientes" 
                        value={stats.pending} 
                        icon={<Clock size={24} className="text-yellow-400" />}
                        backgroundImage="https://res.cloudinary.com/dmyq0gr14/image/upload/v1756495637/ilustracion-de-hawai-en-estilo-comico-retro_bg0093.jpg"
                    />
                </div>
                <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                        <Button onClick={() => setStatusFilterType('En proceso')} className={`text-sm px-3 py-1.5 rounded-md ${statusFilterType === 'En proceso' ? 'bg-white text-black font-semibold' : 'bg-white/10 text-white/70'}`}>En proceso</Button>
                        <Button onClick={() => setStatusFilterType('Finalizados')} className={`text-sm px-3 py-1.5 rounded-md ${statusFilterType === 'Finalizados' ? 'bg-white text-black font-semibold' : 'bg-white/10 text-white/70'}`}>Finalizados</Button>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative flex items-center">
                            <Search size={12} className="absolute left-3 text-white/40" />
                            <input 
                                type="text" 
                                placeholder="Buscar por Ticket" 
                                value={searchTicket}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTicket(e.target.value)}
                                className="bg-white/10 text-white/70 rounded-md pl-9 pr-3 py-1.5 text-sm w-48 hover:bg-white/20 hover:text-white transition-colors placeholder-white/50"
                            />
                        </div>
                        <AnimatedSelect value={agentFilter} onValueChange={setAgentFilter} options={AGENT_OPTIONS} placeholder="Filtrar por Agente" />
                        <div className="relative flex items-center">
                           <input 
                               type="date" 
                               onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDateFilter(e.target.value)} 
                               className="bg-white/10 text-white/70 rounded-md pl-3 pr-3 py-1.5 text-sm w-36 hover:bg-white/20 hover:text-white transition-colors [color-scheme:dark]"
                           />
                        </div>
                        <Button 
                            onClick={() => setIsNewIncidentModalOpen(true)}
                            className="bg-gradient-to-r from-orange-500 to-pink-500 font-semibold px-4 py-1 rounded-md hover:from-orange-600 hover:to-pink-600 transition-all duration-200 transform hover:scale-105"
                        >
                            Nuevo Incidente
                        </Button>
                    </div>
                </div>
            </div>

            {/* Table section taking full remaining space */}
            <div className="flex-grow relative overflow-hidden px-4">
                <div className="relative z-10 h-full flex flex-col">
                    <div className="overflow-y-auto h-full max-h-[600px] scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/20 hover:scrollbar-thumb-white/30">
                        <table className="w-full text-sm table-fixed">
                            <thead className="sticky top-0 border-b border-white/10 bg-slate-950/80 backdrop-blur-sm">
                                <tr>
                                    <th className="p-3 text-left font-semibold text-white/60 w-24">No. Ticket</th>
                                    <th className="p-3 text-left font-semibold text-white/60 w-20">Prioridad</th>
                                    <th className="p-3 text-left font-semibold text-white/60 w-24">Tipo</th>
                                    <th className="p-3 text-left font-semibold text-white/60 w-20">Agente CX</th>
                                    <th className="p-3 text-left font-semibold text-white/60 w-36">Cliente</th>
                                    <th className="p-3 text-left font-semibold text-white/60 w-16">País</th>
                                    <th className="p-3 text-left font-semibold text-white/60 w-20">ANS</th>
                                    <th className="p-3 text-left font-semibold text-white/60 w-20">Canal</th>
                                    <th className="p-3 text-left font-semibold text-white/60 w-28">Estado</th>
                                    <th className="p-3 text-left font-semibold text-white/60 w-20">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredIncidents.length === 0 ? (
                                    <tr>
                                        <td colSpan={10} className="p-8 text-center text-white/60">
                                            No se encontraron incidentes con los filtros aplicados
                                        </td>
                                    </tr>
                                ) : (
                                    filteredIncidents.map(incident => (
                                        <tr key={incident.id} className="border-b border-white/10 hover:bg-white/5 cursor-pointer transition-colors duration-150">
                                            <td className="p-3 font-mono text-xs">{incident.ticket_number}</td>
                                            <td className="p-3"><PriorityBadge priority={incident.priority}/></td>
                                            <td className="p-3 text-white/80 font-medium">{incident.incident_type}</td>
                                            <td className="p-3">{incident.cx_agent}</td>
                                            <td className="p-3">
                                                <div className="font-medium">{incident.customer_name}</div>
                                                <div className="text-xs text-white/60">{incident.customer_email}</div>
                                            </td>
                                            <td className="p-3">{incident.country}</td>
                                            <td className="p-3 text-white/80 font-medium">
                                                {getTimeElapsed(incident.createdAt)}
                                            </td>
                                            <td className="p-3">
                                                <ChannelIcon channel={incident.channel} />
                                            </td>
                                            <td className="p-3"><StatusBadge status={incident.status}/></td>
                                            <td className="p-3 text-center">
                                                <Button 
                                                    onClick={() => {
                                                        setSelectedIncident(incident);
                                                        setIsModalOpen(true);
                                                    }}
                                                    className="text-white/70 hover:text-white transition-colors duration-150"
                                                >
                                                    <Eye size={16} />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal */}
            <IncidentModal 
                incident={selectedIncident} 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)}
                onStatusChange={(incidentId, newStatus) => {
                    // Actualizar el estado en el array de incidents
                    const updatedIncidents = incidents.map(inc => 
                        inc.id === incidentId ? { ...inc, status: newStatus } : inc
                    );
                    setIncidents(updatedIncidents);
                    
                    // Actualizar en localStorage
                    localStorage.setItem('incidents', JSON.stringify(updatedIncidents));
                    
                    // Actualizar selectedIncident para reflejar el cambio en el modal
                    const updated = updatedIncidents.find(inc => inc.id === incidentId);
                    if (updated) {
                        setSelectedIncident(updated);
                    }
                }}
            />

            {/* Modal de nuevo incidente */}
            <NewIncidentModal
                isOpen={isNewIncidentModalOpen}
                onClose={() => setIsNewIncidentModalOpen(false)}
                onSave={handleNewIncident}
            />
        </div>
    );
};

export default CasesPanel;

// Función global para manejar webhook del agente de voz
// Puede ser llamada desde cualquier parte de la aplicación o desde un servidor externo
(window as any).handleVoiceAgentWebhook = (payload: any) => {
    try {
        // Obtener incidentes existentes del localStorage
        const savedIncidents = localStorage.getItem('incidents');
        const existingIncidents = savedIncidents ? JSON.parse(savedIncidents) : mockIncidents;
        
        // Crear nuevo incidente
        const newIncident: Incident = {
            id: existingIncidents.length > 0 ? Math.max(...existingIncidents.map((i: Incident) => i.id)) + 1 : 1,
            ticket_number: payload.ticket_number,
            cx_agent: payload.cx_agent || 'Alejandra',
            priority: payload.priority || 'Medio',
            customer_name: payload.customer_name,
            customer_email: payload.customer_email,
            country: payload.country || 'COL',
            report_description: payload.report_description,
            status: payload.status || 'En progreso',
            channel: payload.channel || 'WhatsApp',
            incident_type: payload.incident_type || 'Falla in-app',
            createdAt: new Date()
        };
        
        // Agregar a la lista
        const updatedIncidents = [...existingIncidents, newIncident];
        
        // Guardar en localStorage
        localStorage.setItem('incidents', JSON.stringify(updatedIncidents));
        
        // Disparar evento para actualizar la UI
        window.dispatchEvent(new CustomEvent('incident-created', { detail: newIncident }));
        
        console.log('✅ Incidente creado desde webhook:', newIncident);
        
        return { 
            success: true, 
            message: 'Incidente creado exitosamente',
            incident: newIncident 
        };
    } catch (error) {
        console.error('❌ Error al procesar webhook:', error);
        return { 
            success: false, 
            message: 'Error al procesar el webhook: ' + (error as Error).message 
        };
    }
};
