import { useThemeContext } from "@/Context/ThemeStatus";
import { Switch } from "@/Components/ui/switch"; // adjust the path to where your Switch.tsx is

export default function DarkModeSwitch() {
  const { darkMode, setDarkMode } = useThemeContext();

  return (
    <div className="flex items-center gap-2">
      <Switch
        checked={darkMode}
        onCheckedChange={setDarkMode}
        aria-label="Toggle dark mode"
      />
    </div>
  );
}