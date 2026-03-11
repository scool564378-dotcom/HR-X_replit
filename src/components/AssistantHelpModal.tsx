import { MessageCircleQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from "@/components/ui/drawer";

interface AssistantHelpModalProps {
  open: boolean;
  onClose: () => void;
  text: string;
}

export const AssistantHelpModal = ({ open, onClose, text }: AssistantHelpModalProps) => {
  return (
    <Drawer open={open} onOpenChange={(isOpen) => (!isOpen ? onClose() : null)}>
      <DrawerContent className="mx-auto max-w-lg px-5 pb-[calc(env(safe-area-inset-bottom)+16px)]">
        <DrawerHeader className="px-0 text-left">
          <DrawerTitle className="flex items-center gap-2 text-xl">
            <MessageCircleQuestion className="h-5 w-5 shrink-0 text-primary" />
            Подсказка по шагу
          </DrawerTitle>
          <DrawerDescription className="text-base text-foreground">{text}</DrawerDescription>
        </DrawerHeader>
        <DrawerFooter className="px-0">
          <Button variant="hero" onClick={onClose} data-testid="button-hint-close">
            Понятно
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};
