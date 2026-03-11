import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { RegionItem } from "@/types/hrx";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface RegionPickerModalProps {
  open: boolean;
  regions: RegionItem[];
  selectedRegion: RegionItem | null;
  onClose: () => void;
  onConfirm: (region: RegionItem) => void;
}

export const RegionPickerModal = ({ open, regions, selectedRegion, onClose, onConfirm }: RegionPickerModalProps) => {
  const [query, setQuery] = useState("");
  const [draftRegion, setDraftRegion] = useState<RegionItem | null>(selectedRegion);

  const filteredRegions = useMemo(
    () => regions.filter((region) => region.name.toLowerCase().includes(query.toLowerCase())),
    [regions, query],
  );

  return (
    <Dialog open={open} onOpenChange={(isOpen) => (!isOpen ? onClose() : null)}>
      <DialogContent className="max-h-[85vh] overflow-hidden rounded-card border border-border p-4">
        <DialogHeader>
          <DialogTitle>Выберите регион</DialogTitle>
          <DialogDescription>Для расчёта рабочего окна по Москве.</DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Поиск региона"
            className="min-h-[56px] w-full rounded-button border border-input bg-card pl-10 pr-4 text-foreground outline-none transition-colors focus:border-primary"
          />
        </div>

        <div className="max-h-72 space-y-2 overflow-y-auto">
          {filteredRegions.map((region) => {
            const active = draftRegion?.id === region.id;
            return (
              <button
                type="button"
                key={region.id}
                onClick={() => setDraftRegion(region)}
                className={`min-h-[56px] w-full rounded-card border px-4 py-3 text-left transition-all ${
                  active ? "border-2 border-primary bg-primary/10" : "border-border bg-card"
                }`}
              >
                <p className="font-semibold">{region.name}</p>
                <p className="text-sm text-muted-foreground">МСК{region.timezoneOffset >= 0 ? `+${region.timezoneOffset}` : region.timezoneOffset}</p>
              </button>
            );
          })}
        </div>

        <Button variant="hero" onClick={() => draftRegion && onConfirm(draftRegion)} disabled={!draftRegion}>
          Подтвердить выбор
        </Button>
      </DialogContent>
    </Dialog>
  );
};
