/**
 * Extrae el nombre de la empresa desde una URL
 * Ejemplo: https://www.trii.co -> "Trii"
 */
export function extractCompanyNameFromUrl(url: string): string {
  if (!url || !url.trim()) {
    return "Mi Organización"
  }

  try {
    // Limpiar URL: remover protocolo y www
    let cleanUrl = url.trim()
      .replace(/^https?:\/\//, '') // Remover http:// o https://
      .replace(/^www\./, '') // Remover www.
      .split('/')[0] // Obtener solo el dominio
    
    // Obtener el nombre del dominio (antes del primer punto)
    const domainParts = cleanUrl.split('.')
    let companyName = domainParts[0]
    
    // Si el dominio es muy corto o genérico, intentar con el segundo segmento
    if (companyName.length <= 2 && domainParts.length > 1) {
      companyName = domainParts[1]
    }
    
    // Capitalizar primera letra
    if (companyName && companyName.length > 0) {
      companyName = companyName.charAt(0).toUpperCase() + companyName.slice(1)
    }
    
    return companyName || "Mi Organización"
  } catch (error) {
    console.error('Error extrayendo nombre de empresa desde URL:', error)
    return "Mi Organización"
  }
}

