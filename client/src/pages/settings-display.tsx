import DisplaySettingsPanel from '@/components/settings/DisplaySettingsPanel';
import { useSetlistState } from '@/hooks/use-setlist-state';
import { defaultDisplaySettingsState } from '@/lib/display-settings';

export default function SettingsDisplayPage() {
  const { state, actions } = useSetlistState();

  return (
    <main className="min-h-screen bg-background text-foreground">
      <DisplaySettingsPanel
        settings={state.displaySettings || defaultDisplaySettingsState}
        isDarkMode={state.isDarkMode}
        onUpdate={actions.updateDisplaySettings}
      />
    </main>
  );
}
