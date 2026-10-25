'use client';

/**
 * useTheme — دسترسی به Theme فعال از Config
 */

import { useMemo } from 'react';
import { useSiteConfig } from './useSiteConfig';
import { applyThemeStyles } from '@/utils/theme';

export function useTheme() {
  const { config, themeModeClasses } = useSiteConfig();

  const theme = useMemo(() => config?.theme || {}, [config]);

  const cssVariables = useMemo(
    () => applyThemeStyles(theme),
    [theme]
  );

  return {
    theme,
    mode: theme.mode || 'light',
    primaryColor: theme.primaryColor,
    fontFamily: theme.fontFamily,
    borderRadius: theme.borderRadius,
    themeModeClasses,
    cssVariables,
  };
}
