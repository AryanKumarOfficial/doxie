import { createContext } from 'react';

export const SidebarToggleContext = createContext<{
  toggleSidebar: () => void;
}>({
  toggleSidebar: () => {},
});