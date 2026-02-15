'use client';

import { GlobalTheme } from '@carbon/react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export default function CarbonThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch
  if (!mounted) {
    return <>{children}</>;
  }

  // Map next-themes to Carbon themes
  const carbonTheme = theme === 'dark' ? 'g100' : 'white';

  return (
    <GlobalTheme theme={carbonTheme}>
      {children}
    </GlobalTheme>
  );
}
