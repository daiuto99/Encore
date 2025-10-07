export interface DisplaySettings {
  // Text colors
  mainTextColor: string;
  
  // Section colors - override markdown inline styles
  introColor: string;
  verseColor: string;
  chorusColor: string;
  bridgeColor: string;
  outroColor: string;
  soloColor: string;
  interludeColor: string;
  instrumentalColor: string;
  
  // Display toggles
  showChords: boolean;
  showKey: boolean;
  boldChorus: boolean;
}

export interface DisplaySettingsState {
  light: DisplaySettings;
  dark: DisplaySettings;
}

const defaultLight: DisplaySettings = {
  mainTextColor: '#1e293b',
  introColor: '#3B82F6',
  verseColor: '#F97316',
  chorusColor: '#EF4444',
  bridgeColor: '#8B5CF6',
  outroColor: '#F59E0B',
  soloColor: '#10B981',
  interludeColor: '#06B6D4',
  instrumentalColor: '#EC4899',
  showChords: true,
  showKey: true,
  boldChorus: false,
};

const defaultDark: DisplaySettings = {
  mainTextColor: '#f8fafc',
  introColor: '#60A5FA',
  verseColor: '#FB923C',
  chorusColor: '#F87171',
  bridgeColor: '#A78BFA',
  outroColor: '#FBBF24',
  soloColor: '#34D399',
  interludeColor: '#22D3EE',
  instrumentalColor: '#F472B6',
  showChords: true,
  showKey: true,
  boldChorus: false,
};

export const defaultDisplaySettingsState: DisplaySettingsState = {
  light: defaultLight,
  dark: defaultDark
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
