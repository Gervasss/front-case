"use client";

import { MantineProvider } from '@mantine/core';
import { ChatBot } from './components/ChatBot/ChatBot';
import { ThemeProvider } from './components/ThemeContext/ThemeContext';


export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MantineProvider>
      <ThemeProvider>
        {children}
        <ChatBot />
      </ThemeProvider>
    </MantineProvider>
  );
}
