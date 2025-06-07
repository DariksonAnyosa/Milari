// hooks/useGreeting.js
import useTime from './useTime';

const useGreeting = () => {
  const currentTime = useTime();
  
  const hour = currentTime.getHours();
  if (hour < 12) return 'Buenos días';
  if (hour < 18) return 'Buenas tardes';
  return 'Buenas noches';
};

export default useGreeting;

