import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { FileText, Search, Shield, Clock, Users, ClipboardCheck, BookOpen } from "lucide-react";

const benefits = [
  {
    icon: FileText,
    title: "Готовое резюме",
    description: "Профессионально оформленное резюме на основе ваших ответов",
  },
  {
    icon: Search,
    title: "Подбор вакансий",
    description: "Список подходящих вакансий с учётом вашего опыта и навыков",
  },
  {
    icon: Shield,
    title: "Конфиденциальность",
    description: "Никакой регистрации и персональных данных не требуется",
  },
  {
    icon: Clock,
    title: "Быстро и просто",
    description: "Весь процесс занимает не более 10 минут",
  },
];

const Index = () => {
  const navigate = useNavigate();

  return (
    <AppLayout centered>
      <section className="my-auto space-y-8 text-center">
        <h1 className="text-[32px] font-bold leading-tight md:text-[40px]" data-testid="text-hero-title">
          Поможем составить резюме и найти работу
        </h1>
        <p className="text-muted-foreground md:text-[22px]" data-testid="text-hero-subtitle">
          Простой опрос на 10 минут — и у вас готовое резюме и список подходящих вакансий
        </p>

        <div className="mx-auto h-1 w-16 rounded-full bg-gradient-to-r from-primary/30 via-primary/60 to-primary/30" />

        <div className="grid grid-cols-1 gap-4 text-left sm:grid-cols-2">
          {benefits.map((item) => (
            <div
              key={item.title}
              className="flex items-start gap-3 rounded-md p-3"
              data-testid={`card-benefit-${item.title}`}
            >
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10">
                <item.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold">{item.title}</p>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mx-auto h-1 w-16 rounded-full bg-gradient-to-r from-primary/30 via-primary/60 to-primary/30" />

        <Button
          variant="hero"
          className="w-full shadow-lg shadow-primary/20"
          onClick={() => navigate("/quiz")}
          data-testid="button-start-quiz"
        >
          Начать
        </Button>

        <p className="text-sm text-muted-foreground" data-testid="text-trust-note">
          Без регистрации. Без ввода личных данных. Первый этап бесплатно.
        </p>

        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground" data-testid="text-social-proof">
          <Users className="h-4 w-4" />
          <span>Более 2 000 человек уже составили резюме с HR-X</span>
        </div>

        <div className="mx-auto h-1 w-16 rounded-full bg-gradient-to-r from-primary/30 via-primary/60 to-primary/30" />

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            onClick={() => navigate("/readiness")}
            className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-primary/30 hover:shadow-sm"
            data-testid="link-readiness"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <ClipboardCheck className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold">Чек-лист готовности</p>
              <p className="text-xs text-muted-foreground">Проверьте свою готовность к удалёнке</p>
            </div>
          </button>
          <button
            onClick={() => navigate("/guides")}
            className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-primary/30 hover:shadow-sm"
            data-testid="link-guides"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold">Полезные гайды</p>
              <p className="text-xs text-muted-foreground">Советы по резюме и собеседованиям</p>
            </div>
          </button>
        </div>
      </section>
    </AppLayout>
  );
};

export default Index;
