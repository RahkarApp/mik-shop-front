/**
 * theme.js — اعمال Theme از SiteConfig به CSS Variables
 *
 * Theme از Config می‌آید — نه Hardcode در CSS
 */

/**
 * تبدیل theme از SiteConfig به متغیرهای CSS
 * @param {Object} theme — بخش theme از SiteConfig
 * @returns {Object} استایل inline برای اعمال روی root
 */
export function themeToCssVariables(theme) {
  if (!theme) return {};

  return {
    // رنگ اصلی — در Tailwind و کامپوننت‌ها استفاده می‌شود
    '--color-primary': theme.primaryColor || '#7000EE',
  };
}

/**
 * کلاس‌های body بر اساس mode (light/dark)
 * @param {string} mode
 */
export function getThemeModeClasses(mode) {
  if (mode === 'dark') {
    return 'bg-gray-900 text-gray-100';
  }
  return 'bg-white text-gray-900';
}

/**
 * استایل کامل Theme برای اعمال روی المنت root
 * @param {Object} theme
 */
export function applyThemeStyles(theme) {
  return {
    ...themeToCssVariables(theme),
    fontFamily: theme?.fontFamily || 'Ravi, sans-serif',
    borderRadius: theme?.borderRadius || '8px',
  };
}
