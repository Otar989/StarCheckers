/**
 * Settings manager using localStorage.
 */
const KEY = 'checkers-settings';
const defaults = {
  mode: 1,
  level: 2,
  color: 'w',
  force: true,
  sfx: true
};

export function loadSettings() {
  try {
    return { ...defaults, ...JSON.parse(localStorage.getItem(KEY) || '{}') };
  } catch (e) {
    console.warn('Settings load failed', e);
    return { ...defaults };
  }
}

export function saveSettings(s) {
  localStorage.setItem(KEY, JSON.stringify(s));
}
