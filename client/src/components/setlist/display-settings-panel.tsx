import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Settings, Sun, Moon } from 'lucide-react';
import { type DisplaySettingsState, type DisplaySettings } from '@/lib/display-settings';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface DisplaySettingsPanelProps {
  settings: DisplaySettingsState;
  isDarkMode: boolean;
  onUpdate: (settings: DisplaySettingsState) => void;
}

export default function DisplaySettingsPanel({ settings, isDarkMode, onUpdate }: DisplaySettingsPanelProps) {
  const [mode, setMode] = useState<'light' | 'dark'>(isDarkMode ? 'dark' : 'light');
  
  const currentSettings = settings[mode];
  
  const updateSetting = (key: keyof DisplaySettings, value: any) => {
    const updated = {
      ...settings,
      [mode]: {
        ...settings[mode],
        [key]: value
      }
    };
    onUpdate(updated);
  };

  return (
    <Card className="h-32 overflow-hidden" data-testid="card-display-settings">
      <CardHeader className="pb-1 px-3 pt-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-sm">
            <Settings className="mr-2 h-3 w-3 text-primary" />
            Display Settings
          </CardTitle>
          <div className="flex gap-1">
            <Button
              variant={mode === 'light' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMode('light')}
              className="h-5 w-5 p-0"
              data-testid="button-mode-light"
            >
              <Sun className="h-3 w-3" />
            </Button>
            <Button
              variant={mode === 'dark' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMode('dark')}
              className="h-5 w-5 p-0"
              data-testid="button-mode-dark"
            >
              <Moon className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 px-3 pb-2 space-y-1 overflow-y-auto max-h-[70px]">
        <div className="flex items-center justify-between">
          <Label htmlFor="section-colors" className="text-xs">Section Colors</Label>
          <Switch
            id="section-colors"
            checked={currentSettings.showSectionColors}
            onCheckedChange={(checked) => updateSetting('showSectionColors', checked)}
            className="scale-75"
            data-testid="switch-section-colors"
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="show-chords" className="text-xs">Show Chords</Label>
          <Switch
            id="show-chords"
            checked={currentSettings.showChords}
            onCheckedChange={(checked) => updateSetting('showChords', checked)}
            className="scale-75"
            data-testid="switch-show-chords"
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="bold-chorus" className="text-xs">Bold Chorus</Label>
          <Switch
            id="bold-chorus"
            checked={currentSettings.boldChorus}
            onCheckedChange={(checked) => updateSetting('boldChorus', checked)}
            className="scale-75"
            data-testid="switch-bold-chorus"
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="show-key" className="text-xs">Show Key</Label>
          <Switch
            id="show-key"
            checked={currentSettings.showKey}
            onCheckedChange={(checked) => updateSetting('showKey', checked)}
            className="scale-75"
            data-testid="switch-show-key"
          />
        </div>
      </CardContent>
    </Card>
  );
}
