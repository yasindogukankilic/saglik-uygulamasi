import { useState, useEffect } from 'react';

const useSidebar = (defaultOpen = false) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [activeItem, setActiveItem] = useState('statistics');

  // Mobile responsiveness
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsOpen(false); // Reset sidebar state on desktop
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggle = () => setIsOpen(!isOpen);
  const close = () => setIsOpen(false);
  const open = () => setIsOpen(true);

  const handleMenuClick = (itemId) => {
    setActiveItem(itemId);
    // Close sidebar on mobile after menu selection
    if (window.innerWidth < 1024) {
      close();
    }
  };

  return {
    isOpen,
    activeItem,
    toggle,
    close,
    open,
    setActiveItem,
    handleMenuClick
  };
};

export default useSidebar;