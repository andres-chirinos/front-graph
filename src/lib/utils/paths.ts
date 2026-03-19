/**
 * Helper para construir rutas que funcionen tanto en desarrollo como en GitHub Pages
 * Usa import.meta.env.PUBLIC_BASE_URL automáticamente configurado por Astro
 */

/**
 * Construye una ruta absoluta considerando el base path de la aplicación
 * @param path - Ruta relativa (debe empezar con /)
 * @returns Ruta completa con el base path
 *
 * @example
 * // En desarrollo: /search?q=test
 * // En GitHub Pages: /repo-name/search?q=test
 * buildPath('/search?q=test')
 */
export function buildPath(path: string): string {
  const base = import.meta.env.PUBLIC_BASE_URL ?? '/';
  const baseRoute = import.meta.env.PUBLIC_BASE_ROUTE ?? '/';
  
  // Extraemos solo el pathname si base es una URL completa
  let cleanBase = '';
  if (base.startsWith('http')) {
    try {
      const url = new URL(base);
      cleanBase = url.pathname === '/' ? '' : url.pathname.replace(/\/+$/, '');
    } catch {
      cleanBase = '';
    }
  } else {
    cleanBase = base === '/' ? '' : base.replace(/\/+$/, '');
  }

  const route = baseRoute === '/' ? '' : baseRoute.replace(/\/+$/, '');
  const combinedBase = (cleanBase + route).replace(/\/+$/, '');
  
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${combinedBase}${cleanPath}`;
}
