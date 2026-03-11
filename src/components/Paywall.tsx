import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";
import { Lock, Ticket, CheckCircle2, Loader2 } from "lucide-react";

interface PaywallProps {
  children: React.ReactNode;
  feature?: string;
}

export function Paywall({ children, feature }: PaywallProps) {
  const { hasPaid, user } = useAuth();

  if (hasPaid) return <>{children}</>;

  return (
    <div className="relative">
      <div className="pointer-events-none select-none">
        <div className="max-h-[200px] overflow-hidden" style={{ maskImage: "linear-gradient(to bottom, black 30%, transparent 100%)", WebkitMaskImage: "linear-gradient(to bottom, black 30%, transparent 100%)" }}>
          {children}
        </div>
      </div>
      <PaywallOverlay feature={feature} isLoggedIn={!!user} />
    </div>
  );
}

export function PaywallBlock({ feature }: { feature?: string }) {
  const { hasPaid, user } = useAuth();
  if (hasPaid) return null;
  return <PaywallOverlay feature={feature} isLoggedIn={!!user} />;
}

function PaywallOverlay({ feature, isLoggedIn }: { feature?: string; isLoggedIn: boolean }) {
  const { refreshUser } = useAuth();
  const { toast } = useToast();
  const [promoCode, setPromoCode] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoSuccess, setPromoSuccess] = useState(false);

  const handlePromo = async () => {
    if (!promoCode.trim()) return;
    setPromoLoading(true);
    try {
      const res = await fetch("/api/promo/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ code: promoCode.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        if (data.type === "free_access") {
          setPromoSuccess(true);
          toast({ title: "Доступ активирован!", description: "Промокод применён. Все функции доступны." });
          await refreshUser();
        } else if (data.type === "discount") {
          toast({ title: `Скидка ${data.value}%`, description: "Промокод принят. Скидка будет применена при оплате." });
        } else {
          toast({ title: "Промокод применён", description: `Бонус: ${data.value}` });
        }
      } else {
        toast({ title: "Ошибка", description: data.error, variant: "destructive" });
      }
    } catch {
      toast({ title: "Ошибка сети", variant: "destructive" });
    } finally {
      setPromoLoading(false);
    }
  };

  if (promoSuccess) return null;

  return (
    <Card className="border-primary/20 bg-gradient-to-b from-card to-primary/5">
      <CardContent className="space-y-4 p-5 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
          <Lock className="h-7 w-7 text-primary" />
        </div>

        <div className="space-y-1">
          <h3 className="text-lg font-bold">
            {feature ? `${feature} — платная функция` : "Полный доступ"}
          </h3>
          <p className="text-sm text-muted-foreground">
            Разблокируйте все возможности за 300 ₽
          </p>
        </div>

        <div className="space-y-2 text-left">
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>Полный список вакансий с сортировкой и фильтрами</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>Полное резюме + экспорт в PDF и DOCX</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>Сохранение пресетов и архив результатов</span>
          </div>
        </div>

        {!isLoggedIn ? (
          <div className="space-y-2">
            <Button variant="hero" className="w-full" onClick={() => window.location.href = "/auth"} data-testid="button-paywall-auth">
              Войти / Зарегистрироваться
            </Button>
            <p className="text-xs text-muted-foreground">Для оплаты необходима регистрация</p>
          </div>
        ) : (
          <div className="space-y-3">
            <Button variant="hero" className="w-full text-base" disabled data-testid="button-paywall-pay">
              Оплатить 300 ₽
            </Button>
            <p className="text-xs text-muted-foreground">Оплата временно недоступна. Используйте промокод для тестирования.</p>

            <div className="flex gap-2">
              <Input
                placeholder="Введите промокод"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handlePromo()}
                data-testid="input-paywall-promo"
              />
              <Button variant="outline" onClick={handlePromo} disabled={promoLoading || !promoCode.trim()} data-testid="button-paywall-promo">
                {promoLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Ticket className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
