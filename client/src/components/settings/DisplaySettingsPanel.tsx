import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Sun, Moon, ArrowLeft } from 'lucide-react';
import { type DisplaySettingsState, type DisplaySettings } from '@/lib/display-settings';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from 'wouter';

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

  const ColorPicker = ({ label, value, onChange }: { label: string; value: string; onChange: (color: string) => void }) => (
    <div className="flex items-center justify-between py-2">
      <Label className="text-sm">{label}</Label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-12 h-8 rounded border cursor-pointer"
          data-testid={`color-${label.toLowerCase().replace(/\s+/g, '-')}`}
        />
        <span className="text-xs font-mono text-muted-foreground w-20">{value}</span>
      </div>
    </div>
  );

  return (
    <div className="mx-auto w-full max-w-2xl p-4 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/">
            <Button variant="outline" size="sm" data-testid="button-back">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          </Link>
          <h1 className="text-xl font-semibold">Display Settings</h1>
        </div>
        <div className="flex gap-2">
          <Button
            variant={mode === 'light' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setMode('light')}
            data-testid="button-settings-mode-light"
          >
            <Sun className="h-4 w-4 mr-1" />
            Light
          </Button>
          <Button
            variant={mode === 'dark' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setMode('dark')}
            data-testid="button-settings-mode-dark"
          >
            <Moon className="h-4 w-4 mr-1" />
            Dark
          </Button>
        </div>
      </div>

      <Tabs defaultValue="colors" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="colors" data-testid="tab-colors">Colors</TabsTrigger>
          <TabsTrigger value="display" data-testid="tab-display">Display Options</TabsTrigger>
        </TabsList>

        <TabsContent value="colors" className="space-y-4 mt-4">
          <div>
            <h3 className="text-sm font-semibold mb-3">Text Colors</h3>
            <ColorPicker
              label="Main Text"
              value={currentSettings.mainTextColor}
              onChange={(color) => updateSetting('mainTextColor', color)}
            />
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-3">Section Header Colors</h3>
            <ColorPicker
              label="Intro"
              value={currentSettings.introColor}
              onChange={(color) => updateSetting('introColor', color)}
            />
            <ColorPicker
              label="Verse"
              value={currentSettings.verseColor}
              onChange={(color) => updateSetting('verseColor', color)}
            />
            <ColorPicker
              label="Chorus"
              value={currentSettings.chorusColor}
              onChange={(color) => updateSetting('chorusColor', color)}
            />
            <ColorPicker
              label="Bridge"
              value={currentSettings.bridgeColor}
              onChange={(color) => updateSetting('bridgeColor', color)}
            />
            <ColorPicker
              label="Outro"
              value={currentSettings.outroColor}
              onChange={(color) => updateSetting('outroColor', color)}
            />
            <ColorPicker
              label="Solo"
              value={currentSettings.soloColor}
              onChange={(color) => updateSetting('soloColor', color)}
            />
            <ColorPicker
              label="Interlude"
              value={currentSettings.interludeColor}
              onChange={(color) => updateSetting('interludeColor', color)}
            />
            <ColorPicker
              label="Instrumental"
              value={currentSettings.instrumentalColor}
              onChange={(color) => updateSetting('instrumentalColor', color)}
            />
          </div>
        </TabsContent>

        <TabsContent value="display" className="space-y-4 mt-4">
          <div className="flex items-center justify-between py-3">
            <Label htmlFor="show-chords">Show Chords</Label>
            <Switch
              id="show-chords"
              checked={currentSettings.showChords}
              onCheckedChange={(checked) => updateSetting('showChords', checked)}
              data-testid="switch-show-chords"
            />
          </div>

          <div className="flex items-center justify-between py-3">
            <Label htmlFor="show-key">Show Key Info</Label>
            <Switch
              id="show-key"
              checked={currentSettings.showKey}
              onCheckedChange={(checked) => updateSetting('showKey', checked)}
              data-testid="switch-show-key"
            />
          </div>

          <div className="flex items-center justify-between py-3">
            <Label htmlFor="bold-chorus">Bold Chorus Sections</Label>
            <Switch
              id="bold-chorus"
              checked={currentSettings.boldChorus}
              onCheckedChange={(checked) => updateSetting('boldChorus', checked)}
              data-testid="switch-bold-chorus"
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
