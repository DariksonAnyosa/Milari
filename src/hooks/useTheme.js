import { useState, useEffect, useCallback } from 'react';

/**
 * Hook personalizado para manejar el tema (dark/light mode)
 */
export const useTheme = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Aplicar tema al documento
  const applyThemeToDocument = useCallback((isDark) => {
    try {
      const targets = [document.documentElement, document.body];
      
      targets.forEach(target => {
        if (isDark) {
          target.classList.add('dark-mode');
          target.setAttribute('data-theme', 'dark');
          target.setAttribute('data-dark', 'true');
        } else {
          target.classList.remove('dark-mode');
          target.setAttribute('data-theme', 'light');
          target.setAttribute('data-dark', 'false');
        }
      });

      // Para navegadores problemáticos, forzar aplicación
      const needsForceReflow = navigator.brave?.isBrave || /Zen/.test(navigator.userAgent);
      
      if (needsForceReflow) {
        document.body.style.display = 'none';
        void document.body.offsetHeight; // Force reflow
        document.body.style.display = '';
        
        if (isDark) {
          document.body.classList.add('force-dark-mode', 'js-dark-mode');
        } else {
          document.body.classList.remove('force-dark-mode', 'js-dark-mode');
        }
      }
      
      console.log(`✅ Tema aplicado: ${isDark ? 'oscuro' : 'claro'}`);
    } catch (error) {
      console.error('⚠️ Error aplicando tema:', error);
    }
  }, []);

  // Inicializar tema
  useEffect(() => {
    const savedTheme = localStorage.getItem('milari-theme');
    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    const shouldUseDarkMode = savedTheme ? savedTheme === 'dark' : prefersDarkMode;
    
    console.log('🔍 Inicializando tema:', {
      savedTheme,
      prefersDarkMode,
      shouldUseDarkMode
    });
    
    setDarkMode(shouldUseDarkMode);
    applyThemeToDocument(shouldUseDarkMode);
    setIsInitialized(true);
    
    // Escuchar cambios del sistema solo si no hay preferencia guardada
    if (!savedTheme) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e) => {
        console.log('🔄 Cambio del sistema:', e.matches);
        setDarkMode(e.matches);
        applyThemeToDocument(e.matches);
      };
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [applyThemeToDocument]);

  // Función para alternar tema
  const toggleTheme = useCallback(() => {
    const newDarkMode = !darkMode;
    console.log('🎯 Toggle manual:', darkMode, '→', newDarkMode);
    
    setDarkMode(newDarkMode);
    applyThemeToDocument(newDarkMode);
    
    // Guardar preferencia
    localStorage.setItem('milari-theme', newDarkMode ? 'dark' : 'light');
    
    // Dispatch evento personalizado
    window.dispatchEvent(new CustomEvent('themeChanged', {
      detail: { darkMode: newDarkMode }
    }));
  }, [darkMode, applyThemeToDocument]);

  return {
    darkMode,
    toggleTheme,
    isInitialized
  };
};

export default useTheme;
