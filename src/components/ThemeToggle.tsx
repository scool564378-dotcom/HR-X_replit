import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useHrxState } from "@/context/hrx-state";

export const ThemeToggle = () => {
  const { state, dispatch } = useHrxState();
  const isDark = state.uiState.theme === "dark";

  return (
    <Button
      variant="soft"
      size="icon"
      aria-label="Переключить тему"
      onClick={() => dispatch({ type: "SET_THEME", payload: isDark ? "light" : "dark" })}
    >
      {isDark ? <Sun /> : <Moon />}
    </Button>
  );
};
