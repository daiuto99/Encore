export interface DisplaySettings {
  showSectionColors: boolean;
  showChords: boolean;
  chordDisplayStyle: 'inline' | 'above' | 'hidden';
  chordFontSize: number;
  boldChorus: boolean;
  sectionIndent: boolean;
  showKey: boolean;
}

export interface DisplaySettingsState {
  light: DisplaySettings;
  dark: DisplaySettings;
}

export const defaultDisplaySettings: DisplaySettings = {
  showSectionColors: true,
  showChords: true,
  chordDisplayStyle: 'inline',
  chordFontSize: 100,
  boldChorus: false,
  sectionIndent: false,
  showKey: true,
};

export const defaultDisplaySettingsState: DisplaySettingsState = {
  light: { ...defaultDisplaySettings },
  dark: { ...defaultDisplaySettings }
};

export function loadDisplaySettings(): DisplaySettingsState {
  try {
    const saved = localStorage.getItem('encore-display-settings');
    return saved ? JSON.parse(saved) : defaultDisplaySettingsState;
  } catch {
    return defaultDisplaySettingsState;
  }
}

export function saveDisplaySettings(settings: DisplaySettingsState): void {
  localStorage.setItem('encore-display-settings', JSON.stringify(settings));
}

export function getCurrentSettings(state: DisplaySettingsState, isDarkMode: boolean): DisplaySettings {
  return isDarkMode ? state.dark : state.light;
}
