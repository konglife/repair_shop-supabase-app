import type { ThemeDefinition } from 'vuetify'

export const light: ThemeDefinition = {
  dark: false,
  colors: { 
    primary: '#3B82F6',   // Blue
    secondary: '#6366F1', // Indigo
    accent: '#EC4899',    // Pink
    error: '#EF4444',     // Red
    warning: '#F59E0B',   // Amber 
    info: '#3B82F6',      // Blue
    success: '#10B981',   // Emerald
    background: '#FFFFFF',
    surface: '#FFFFFF',
  }
}

export const dark: ThemeDefinition = {
  dark: true,
  colors: { 
    primary: '#3B82F6',   // Blue
    secondary: '#6366F1', // Indigo
    accent: '#EC4899',    // Pink
    error: '#EF4444',     // Red
    warning: '#F59E0B',   // Amber
    info: '#3B82F6',      // Blue
    success: '#10B981',   // Emerald
    background: '#121212',
    surface: '#1E1E1E',
  }
}

export default { defaultTheme: 'light', themes: { light, dark } }
