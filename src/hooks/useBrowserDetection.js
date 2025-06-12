import { useEffect } from 'react';

/**
 * Hook personalizado para detectar el navegador y aplicar fixes específicos
 */
export const useBrowserDetection = () => {
  useEffect(() => {
    const detectAndApplyBrowserFixes = () => {
      try {
        const userAgent = navigator.userAgent;
        const isBrave = navigator.brave?.isBrave;
        const isZen = /Zen/.test(userAgent);
        const isFirefox = /Firefox/.test(userAgent);
        
        console.log('🌐 Navegador detectado:', {
          isBrave: !!isBrave,
          isZen,
          isFirefox,
          userAgent: userAgent.substring(0, 50) + '...'
        });
        
        // Aplicar clases CSS específicas por navegador
        const browserClasses = [];
        if (isBrave) browserClasses.push('brave-browser');
        if (isZen) browserClasses.push('zen-browser');
        if (isFirefox) browserClasses.push('firefox-browser');
        
        if (browserClasses.length > 0) {
          document.documentElement.classList.add(...browserClasses);
          document.body.classList.add(...browserClasses);
          
          // Cleanup function
          return () => {
            document.documentElement.classList.remove(...browserClasses);
            document.body.classList.remove(...browserClasses);
          };
        }
        
        return () => {}; // No-op cleanup
        
      } catch (error) {
        console.warn('⚠️ Error detectando navegador:', error);
        return () => {};
      }
    };
    
    return detectAndApplyBrowserFixes();
  }, []);
};

export default useBrowserDetection;
