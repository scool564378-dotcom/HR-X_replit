import { useState, useEffect } from "react";
import { Settings, Check, KeyRound } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const STORAGE_KEY = "hrx_openai_key";

export const getOpenAiKey = (): string => localStorage.getItem(STORAGE_KEY) ?? "";

export const ApiKeyModal = () => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [saved, setSaved] = useState(false);
  const [isKeySet, setIsKeySet] = useState(false);

  useEffect(() => {
    setIsKeySet(Boolean(localStorage.getItem(STORAGE_KEY)));
  }, []);

  useEffect(() => {
    if (open) {
      setValue("");
      setSaved(false);
      setIsKeySet(Boolean(localStorage.getItem(STORAGE_KEY)));
    }
  }, [open]);

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, value.trim());
    setIsKeySet(true);
    setSaved(true);
    setTimeout(() => setOpen(false), 800);
  };

  const handleClear = () => {
    localStorage.removeItem(STORAGE_KEY);
    setValue("");
    setSaved(false);
    setIsKeySet(false);
  };

  return (
    <>
      <button
        type="button"
        data-testid="button-api-settings"
        onClick={() => setOpen(true)}
        className="relative flex min-h-[40px] min-w-[40px] items-center justify-center rounded-button border border-border bg-card text-foreground transition-colors hover:bg-secondary"
        title="Настройки API"
      >
        <Settings size={18} />
        {isKeySet && (
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-primary" />
        )}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Ключ OpenAI API</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">
              Нужен для генерации резюме через ИИ. Хранится только в браузере.
            </p>

            {isKeySet && (
              <div className="flex items-center gap-2 rounded-card border border-border bg-secondary px-4 py-3 text-sm">
                <KeyRound size={16} className="shrink-0 text-primary" />
                <span className="text-muted-foreground">Ключ уже задан: <span className="font-mono">sk-•••••••••••••••••••••••</span></span>
              </div>
            )}

            <Input
              data-testid="input-openai-key"
              type="password"
              placeholder={isKeySet ? "Введите новый ключ для замены" : "sk-..."}
              value={value}
              onChange={(e) => { setValue(e.target.value); setSaved(false); }}
              autoComplete="new-password"
            />

            <div className="flex gap-2">
              <Button
                data-testid="button-save-api-key"
                variant="hero"
                className="flex-1"
                onClick={handleSave}
                disabled={!value.trim()}
              >
                {saved ? <><Check size={16} className="mr-1" />Сохранено</> : isKeySet ? "Заменить ключ" : "Сохранить"}
              </Button>
              {isKeySet && (
                <Button
                  data-testid="button-clear-api-key"
                  variant="outline"
                  onClick={handleClear}
                >
                  Удалить
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
