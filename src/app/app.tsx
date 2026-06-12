"use client";

import { MantineProvider } from '@mantine/core';
import { ThemeProvider } from './components/ThemeContext/ThemeContext';


export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MantineProvider>
      <ThemeProvider>
        {children}
      </ThemeProvider>
    </MantineProvider>
  );
}
