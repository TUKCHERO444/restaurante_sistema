import { useCallback, useEffect, useState } from 'react';

type Tema = 'light' | 'dark';

const CLAVE = 'restaurante-tema';

function temaInicial(): Tema {
  const guardado = localStorage.getItem(CLAVE);
  if (guardado === 'light' || guardado === 'dark') return guardado;
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

/** Tema claro/oscuro con persistencia. Aplica la clase `dark` al <html>. */
export function useTheme() {
  const [tema, setTema] = useState<Tema>(temaInicial);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', tema === 'dark');
    localStorage.setItem(CLAVE, tema);
  }, [tema]);

  const alternar = useCallback(() => {
    setTema((anterior) => (anterior === 'dark' ? 'light' : 'dark'));
  }, []);

  return { tema, alternar };
}
