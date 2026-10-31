import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/ui/button';

/** Alterna entre tema claro y oscuro. */
export function ThemeToggle() {
  const { tema, alternar } = useTheme();

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={alternar}
      aria-label={tema === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
      title={tema === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
    >
      {tema === 'dark' ? <Sun /> : <Moon />}
    </Button>
  );
}
