import { useEffect, useState } from 'react';

/**
 * Hook que evalúa una media query de CSS.
 * Devuelve `true` cuando coincide, `false` en caso contrario.
 */
export function useMediaQuery(query: string): boolean {
  const [coincide, setCoincide] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(query).matches : false,
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);

    const manejarCambio = () => setCoincide(mediaQuery.matches);

    // Evaluar por si acaso ya cambió
    manejarCambio();

    mediaQuery.addEventListener('change', manejarCambio);
    return () => mediaQuery.removeEventListener('change', manejarCambio);
  }, [query]);

  return coincide;
}
