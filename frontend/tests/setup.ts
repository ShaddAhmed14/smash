import '@testing-library/jest-dom'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/',
}))

// Mock next-themes
vi.mock('next-themes', () => ({
  useTheme: () => ({
    theme: 'light',
    setTheme: vi.fn(),
  }),
  ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
}))

// Mock environment variables
vi.stubGlobal('process', {
  env: {
    NEXT_PUBLIC_BACKEND_URL: 'http://localhost:8000',
    NEXT_PUBLIC_PREVIEW: '/preview',
    NEXT_PUBLIC_ANALYSIS: '/analysis',
    NEXT_PUBLIC_ANALYTICS: '/analytics',
  },
})
