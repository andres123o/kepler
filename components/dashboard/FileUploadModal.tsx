"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, FileText, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { NPSSurvey, CSATSurvey, Ticket } from "@/app/agents/kepler/types";

// Funciones helper para parsear archivos en el cliente
async function fileToText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = (e) => reject(new Error('Error leyendo archivo'));
    reader.readAsText(file);
  });
}

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.split('\n').filter(line => line.trim());
  if (lines.length === 0) return [];
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  const rows: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
    if (values.length !== headers.length) continue;
    const row: Record<string, string> = {};
    headers.forEach((header, idx) => {
      row[header.toLowerCase()] = values[idx];
    });
    rows.push(row);
  }
  return rows;
}

async function parseNPSFile(file: File, sourceId: string): Promise<{ surveys: NPSSurvey[], rawRows: Record<string, string>[] }> {
  const text = await fileToText(file);
  const surveys: NPSSurvey[] = [];
  const rawRows: Record<string, string>[] = [];
  const fileType = file.name.split('.').pop()?.toLowerCase() || '';
  
  if (fileType === 'csv' || fileType === 'txt') {
    const rows = parseCSV(text);
    rawRows.push(...rows); // Guardar datos crudos
    rows.forEach((row, idx) => {
      const score = parseInt(row.score || row.nps || row.rating || '0');
      const comment = row.comment || row.comentario || row.feedback || row.text || '';
      const timestamp = row.timestamp || row.date || row.fecha || new Date().toISOString();
      if (score >= 0 && score <= 10) {
        surveys.push({
          id: `${sourceId}-nps-${idx}`,
          score,
          comment: comment || undefined,
          timestamp,
          source: 'file',
        });
      }
    });
  } else if (fileType === 'json') {
    const data = JSON.parse(text);
    const items = Array.isArray(data) ? data : [data];
    rawRows.push(...items); // Guardar datos crudos
    items.forEach((item: any, idx: number) => {
      const score = parseInt(item.score || item.nps || item.rating || '0');
      const comment = item.comment || item.comentario || item.feedback || item.text || '';
      const timestamp = item.timestamp || item.date || item.fecha || new Date().toISOString();
      if (score >= 0 && score <= 10) {
        surveys.push({
          id: `${sourceId}-nps-${idx}`,
          score,
          comment: comment || undefined,
          timestamp,
          source: 'file',
        });
      }
    });
  }
  return { surveys, rawRows };
}

async function parseCSATFile(file: File, sourceId: string): Promise<{ surveys: CSATSurvey[], rawRows: Record<string, string>[] }> {
  const text = await fileToText(file);
  const surveys: CSATSurvey[] = [];
  const rawRows: Record<string, string>[] = [];
  const fileType = file.name.split('.').pop()?.toLowerCase() || '';
  
  if (fileType === 'csv' || fileType === 'txt') {
    const rows = parseCSV(text);
    rawRows.push(...rows); // Guardar datos crudos
    rows.forEach((row, idx) => {
      const score = parseInt(row.score || row.csat || row.rating || '0');
      const comment = row.comment || row.comentario || row.feedback || row.text || '';
      const timestamp = row.timestamp || row.date || row.fecha || new Date().toISOString();
      if (score >= 0 && score <= 5) {
        surveys.push({
          id: `${sourceId}-csat-${idx}`,
          score,
          comment: comment || undefined,
          timestamp,
          source: 'file',
        });
      }
    });
  } else if (fileType === 'json') {
    const data = JSON.parse(text);
    const items = Array.isArray(data) ? data : [data];
    rawRows.push(...items); // Guardar datos crudos
    items.forEach((item: any, idx: number) => {
      const score = parseInt(item.score || item.csat || item.rating || '0');
      const comment = item.comment || item.comentario || item.feedback || item.text || '';
      const timestamp = item.timestamp || item.date || item.fecha || new Date().toISOString();
      if (score >= 0 && score <= 5) {
        surveys.push({
          id: `${sourceId}-csat-${idx}`,
          score,
          comment: comment || undefined,
          timestamp,
          source: 'file',
        });
      }
    });
  }
  return { surveys, rawRows };
}

async function parseTicketsFile(file: File, sourceId: string): Promise<{ tickets: Ticket[], rawRows: Record<string, string>[] }> {
  const text = await fileToText(file);
  const tickets: Ticket[] = [];
  const rawRows: Record<string, string>[] = [];
  const fileType = file.name.split('.').pop()?.toLowerCase() || '';
  
  if (fileType === 'csv' || fileType === 'txt') {
    const rows = parseCSV(text);
    rawRows.push(...rows); // Guardar datos crudos
    rows.forEach((row, idx) => {
      const ticketNumber = row.id || row.ticket_id || row.number || row.ticket_number || `TICKET-${idx}`;
      const subject = row.subject || row.asunto || row.title || row.titulo || '';
      const description = row.description || row.descripcion || row.body || row.content || '';
      const status = row.status || row.estado || 'open';
      const priority = row.priority || row.prioridad || undefined;
      const timestamp = row.timestamp || row.date || row.fecha || row.created_at || new Date().toISOString();
      if (subject || description) {
        tickets.push({
          id: `${sourceId}-ticket-${idx}`,
          ticket_number: ticketNumber,
          subject: subject || 'Sin asunto',
          description: description || '',
          status,
          priority,
          created_at: timestamp,
          source: 'file',
        });
      }
    });
  } else if (fileType === 'json') {
    const data = JSON.parse(text);
    const items = Array.isArray(data) ? data : [data];
    rawRows.push(...items); // Guardar datos crudos
    items.forEach((item: any, idx: number) => {
      const ticketNumber = item.id || item.ticket_id || item.number || item.ticket_number || `TICKET-${idx}`;
      const subject = item.subject || item.asunto || item.title || item.titulo || '';
      const description = item.description || item.descripcion || item.body || item.content || '';
      const status = item.status || item.estado || 'open';
      const priority = item.priority || item.prioridad || undefined;
      const timestamp = item.timestamp || item.date || item.fecha || item.created_at || new Date().toISOString();
      if (subject || description) {
        tickets.push({
          id: `${sourceId}-ticket-${idx}`,
          ticket_number: ticketNumber,
          subject: subject || 'Sin asunto',
          description: description || '',
          status,
          priority,
          created_at: timestamp,
          source: 'file',
        });
      }
    });
  }
  return { tickets, rawRows };
}

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (parsedData: {
    nps?: NPSSurvey[];
    csat?: CSATSurvey[];
    tickets?: Ticket[];
    rawData?: {
      nps?: Record<string, string>[];
      csat?: Record<string, string>[];
      tickets?: Record<string, string>[];
    };
  }) => void;
  missingFiles: Array<{
    id: string;
    sourceName: string;
    sourceType: string;
    sourceId: string;
  }>;
}

export function FileUploadModal({ isOpen, onClose, onComplete, missingFiles }: FileUploadModalProps) {
  const [selectedFiles, setSelectedFiles] = useState<Record<string, File>>({});
  const [parsedData, setParsedData] = useState<{
    nps?: NPSSurvey[];
    csat?: CSATSurvey[];
    tickets?: Ticket[];
    rawData?: {
      nps?: Record<string, string>[];
      csat?: Record<string, string>[];
      tickets?: Record<string, string>[];
    };
  }>({});
  const [parsingStatus, setParsingStatus] = useState<Record<string, "idle" | "parsing" | "success" | "error">>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleFileSelect = (sourceId: string, file: File | null) => {
    if (!file) return;

    // Validar tipo de archivo
    const validExtensions = [".csv", ".json", ".txt", ".xlsx", ".xls"];
    const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();
    
    if (!validExtensions.includes(fileExtension)) {
      setErrors((prev) => ({
        ...prev,
        [sourceId]: "Formato no válido. Aceptamos CSV, JSON, TXT, XLSX, XLS",
      }));
      return;
    }

    // Validar tamaño (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        [sourceId]: "El archivo es muy grande. Máximo 10MB",
      }));
      return;
    }

    setErrors((prev => {
      const newErrors = { ...prev };
      delete newErrors[sourceId];
      return newErrors;
    }));
    setSelectedFiles((prev) => ({ ...prev, [sourceId]: file }));
    setParsingStatus((prev) => ({ ...prev, [sourceId]: "idle" }));
  };

  const handleParse = async (sourceId: string, sourceType: string, file: File) => {
    if (!file) return;

    setParsingStatus((prev) => ({ ...prev, [sourceId]: "parsing" }));

    try {
      if (sourceType === "nps") {
        const { surveys, rawRows } = await parseNPSFile(file, sourceId);
        setParsedData((prev) => ({ 
          ...prev, 
          nps: prev.nps ? [...prev.nps, ...surveys] : surveys,
          rawData: {
            ...prev.rawData,
            nps: prev.rawData?.nps ? [...prev.rawData.nps, ...rawRows] : rawRows,
          }
        }));
      } else if (sourceType === "csat") {
        const { surveys, rawRows } = await parseCSATFile(file, sourceId);
        setParsedData((prev) => ({ 
          ...prev, 
          csat: prev.csat ? [...prev.csat, ...surveys] : surveys,
          rawData: {
            ...prev.rawData,
            csat: prev.rawData?.csat ? [...prev.rawData.csat, ...rawRows] : rawRows,
          }
        }));
      } else if (sourceType === "tickets") {
        const { tickets, rawRows } = await parseTicketsFile(file, sourceId);
        setParsedData((prev) => ({ 
          ...prev, 
          tickets: prev.tickets ? [...prev.tickets, ...tickets] : tickets,
          rawData: {
            ...prev.rawData,
            tickets: prev.rawData?.tickets ? [...prev.rawData.tickets, ...rawRows] : rawRows,
          }
        }));
      }

      setParsingStatus((prev) => ({ ...prev, [sourceId]: "success" }));
    } catch (error: any) {
      console.error("Error parseando archivo:", error);
      setParsingStatus((prev) => ({ ...prev, [sourceId]: "error" }));
      setErrors((prev) => ({
        ...prev,
        [sourceId]: error.message || "Error al parsear el archivo",
      }));
    }
  };

  const allFilesParsed = missingFiles.every((file) => 
    parsingStatus[file.sourceId] === "success" || !selectedFiles[file.sourceId]
  );
  const hasFilesToParse = Object.keys(selectedFiles).length > 0;

  const handleComplete = () => {
    if (allFilesParsed && Object.keys(parsedData).length > 0) {
      onComplete(parsedData);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-[#FFFEF7] rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="relative rounded-t-2xl bg-gradient-to-br from-[#4A0072]/15 via-[#8A2BE2]/15 to-[#C2185B]/15 p-6 border-b border-white/30">
                <div className="flex items-center justify-between">
                  <div>
                    <h2
                      className="text-2xl font-bold text-neutral-900 mb-2"
                      style={{
                        fontFamily: 'var(--font-inter), "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                        fontWeight: 700,
                      }}
                    >
                      Subir archivos requeridos
                    </h2>
                    <p className="text-sm text-neutral-600">
                      Necesitamos estos archivos para generar el análisis completo
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 rounded-lg text-neutral-400 hover:text-neutral-900 hover:bg-white/50 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {missingFiles.map((file) => {
                  const status = parsingStatus[file.sourceId] || "idle";
                  const error = errors[file.sourceId];
                  const selectedFile = selectedFiles[file.sourceId];

                  return (
                    <motion.div
                      key={file.sourceId}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="relative rounded-xl bg-gradient-to-br from-neutral-50 to-white border border-neutral-200/50 p-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-gradient-to-br from-[#8A2BE2]/20 to-[#C2185B]/20 rounded-lg">
                              <FileText className="w-5 h-5 text-neutral-700" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-neutral-900">{file.sourceName}</h3>
                              <p className="text-xs text-neutral-500">Formato: CSV, JSON, TXT, XLSX (máx. 10MB)</p>
                            </div>
                          </div>

                          {/* File Input */}
                          <label className="block">
                            <input
                              type="file"
                              accept=".csv,.json,.txt,.xlsx,.xls"
                              onChange={(e) => {
                                const selectedFile = e.target.files?.[0] || null;
                                handleFileSelect(file.sourceId, selectedFile);
                              }}
                              className="hidden"
                              disabled={status === "parsing" || status === "success"}
                            />
                            <div className="flex items-center gap-3">
                              <div
                                className={`flex-1 px-4 py-3 rounded-lg border-2 border-dashed transition-colors ${
                                  selectedFile
                                    ? "border-green-300 bg-green-50/50"
                                    : "border-neutral-300 hover:border-neutral-400"
                                } ${
                                  status === "parsing" || status === "success"
                                    ? "opacity-50 cursor-not-allowed"
                                    : "cursor-pointer"
                                }`}
                              >
                                {selectedFile ? (
                                  <div className="flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-green-600" />
                                    <span className="text-sm font-medium text-green-700">
                                      {selectedFile.name}
                                    </span>
                                    <span className="text-xs text-neutral-500 ml-auto">
                                      {(selectedFile.size / 1024).toFixed(1)} KB
                                    </span>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2 text-neutral-600">
                                    <Upload className="w-4 h-4" />
                                    <span className="text-sm">
                                      {status === "success" ? "Archivo subido" : "Seleccionar archivo"}
                                    </span>
                                  </div>
                                )}
                              </div>
                              {selectedFile && status !== "success" && status !== "parsing" && (
                                <motion.button
                                  onClick={() => handleParse(file.sourceId, file.sourceType, selectedFile)}
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  className="px-4 py-3 bg-black text-white rounded-lg font-semibold text-sm hover:bg-neutral-900 transition-colors"
                                >
                                  Procesar
                                </motion.button>
                              )}
                            </div>
                          </label>

                          {/* Status Indicators */}
                          {status === "parsing" && (
                            <div className="flex items-center gap-2 mt-3 text-sm text-blue-600">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Procesando archivo...</span>
                            </div>
                          )}

                          {status === "success" && (
                            <div className="flex items-center gap-2 mt-3 text-sm text-green-600">
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Archivo procesado exitosamente</span>
                            </div>
                          )}

                          {error && (
                            <div className="flex items-center gap-2 mt-3 text-sm text-red-600">
                              <AlertCircle className="w-4 h-4" />
                              <span>{error}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="border-t border-neutral-200/50 p-6 bg-gradient-to-br from-neutral-50/50 to-transparent">
                <div className="flex items-center justify-end gap-3">
                  <button
                    onClick={onClose}
                    className="px-6 py-3 rounded-xl bg-neutral-100 text-neutral-700 hover:bg-neutral-200 transition-colors font-semibold"
                  >
                    Cancelar
                  </button>
                  <motion.button
                    onClick={handleComplete}
                    disabled={!allFilesParsed || Object.keys(parsedData).length === 0}
                    whileHover={allFilesParsed && Object.keys(parsedData).length > 0 ? { scale: 1.02 } : {}}
                    whileTap={allFilesParsed && Object.keys(parsedData).length > 0 ? { scale: 0.98 } : {}}
                    className="px-6 py-3 rounded-xl bg-black text-white hover:bg-neutral-900 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continuar con el análisis
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

