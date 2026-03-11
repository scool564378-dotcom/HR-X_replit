import { useNavigate, useParams } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { guides, type Guide, type GuideSection } from "@/data/guidesData";
import {
  ArrowLeft,
  ArrowRight,
  FileText,
  Video,
  AlertTriangle,
  ShieldAlert,
  Laptop,
  Briefcase,
  BookOpen,
  ChevronRight,
  ChevronLeft,
  type LucideIcon,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  FileText,
  Video,
  AlertTriangle,
  ShieldAlert,
  Laptop,
  Briefcase,
};

const SectionBlock = ({ section }: { section: GuideSection }) => {
  if (section.pairs) {
    return (
      <div className="space-y-3">
        {section.heading && (
          <h3 className="text-base font-semibold">{section.heading}</h3>
        )}
        {section.pairs.map((p, i) => (
          <div key={i} className="rounded-lg bg-muted/50 p-3 text-sm">
            <p className="mb-1">
              <span className="font-medium text-red-500 dark:text-red-400">
                Было:
              </span>{" "}
              {p.before}
            </p>
            <p>
              <span className="font-medium text-emerald-600 dark:text-emerald-400">
                Стало:
              </span>{" "}
              {p.after}
            </p>
          </div>
        ))}
      </div>
    );
  }

  if (section.text) {
    return (
      <div className="space-y-2">
        {section.heading && (
          <h3 className="text-base font-semibold">{section.heading}</h3>
        )}
        <div className="rounded-xl bg-muted/40 p-4 text-sm leading-relaxed whitespace-pre-line">
          {section.text}
        </div>
      </div>
    );
  }

  if (section.items) {
    return (
      <div className="space-y-2">
        {section.heading && (
          <h3 className="text-base font-semibold">{section.heading}</h3>
        )}
        <ul className="space-y-2">
          {section.items.map((item, i) => (
            <li
              key={i}
              className="flex items-start gap-2.5 text-sm leading-relaxed"
            >
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return null;
};

const GuideDetail = ({ guide }: { guide: Guide }) => {
  const navigate = useNavigate();
  const Icon = iconMap[guide.icon] || BookOpen;

  const currentIndex = guides.findIndex((g) => g.id === guide.id);
  const prevGuide = currentIndex > 0 ? guides[currentIndex - 1] : null;
  const nextGuide =
    currentIndex < guides.length - 1 ? guides[currentIndex + 1] : null;

  return (
    <AppLayout>
      <button
        onClick={() => navigate("/guides")}
        className="mb-4 inline-flex items-center gap-1 text-sm text-primary hover:underline"
        data-testid="link-back-guides"
      >
        <ArrowLeft className="h-4 w-4" />
        Все гайды
      </button>

      <div className="mb-6 flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1
            className="text-[24px] font-bold leading-tight md:text-[30px]"
            data-testid="text-guide-title"
          >
            {guide.title}
          </h1>
        </div>
      </div>

      <Card className="mb-6 border-0 shadow-sm">
        <CardContent className="p-5 md:p-6">
          <p className="text-[15px] leading-relaxed text-muted-foreground">
            {guide.intro}
          </p>
        </CardContent>
      </Card>

      <div className="mb-6 space-y-6">
        {guide.sections.map((section, i) => (
          <SectionBlock key={i} section={section} />
        ))}
      </div>

      <Card className="mb-6 border-l-4 border-l-primary bg-primary/5">
        <CardContent className="p-4">
          <p className="text-sm font-medium leading-relaxed">
            {guide.conclusion}
          </p>
        </CardContent>
      </Card>

      <Button
        variant="hero"
        className="w-full shadow-lg shadow-primary/20"
        onClick={() => navigate(guide.cta.link)}
        data-testid="button-guide-cta"
      >
        <ArrowRight className="mr-2 h-4 w-4" />
        {guide.cta.text}
      </Button>

      <div className="mt-6 flex gap-3">
        {prevGuide && (
          <button
            onClick={() => navigate(`/guides/${prevGuide.id}`)}
            className="flex flex-1 items-center gap-2 rounded-xl border border-border bg-card p-3 text-left transition-all hover:border-primary/30 hover:shadow-sm"
            data-testid="link-prev-guide"
          >
            <ChevronLeft className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="text-sm font-medium line-clamp-2">
              {prevGuide.title}
            </span>
          </button>
        )}
        {nextGuide && (
          <button
            onClick={() => navigate(`/guides/${nextGuide.id}`)}
            className="flex flex-1 items-center justify-end gap-2 rounded-xl border border-border bg-card p-3 text-right transition-all hover:border-primary/30 hover:shadow-sm"
            data-testid="link-next-guide"
          >
            <span className="text-sm font-medium line-clamp-2">
              {nextGuide.title}
            </span>
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
          </button>
        )}
      </div>
    </AppLayout>
  );
};

const GuidesList = () => {
  const navigate = useNavigate();

  return (
    <AppLayout>
      <button
        onClick={() => navigate("/")}
        className="mb-4 inline-flex items-center gap-1 text-sm text-primary hover:underline"
        data-testid="link-back-home"
      >
        <ArrowLeft className="h-4 w-4" />
        На главную
      </button>

      <div className="mb-2 flex items-center gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
          <BookOpen className="h-6 w-6 text-primary" />
        </div>
        <h1
          className="text-[26px] font-bold leading-tight md:text-[34px]"
          data-testid="text-guides-title"
        >
          Полезные гайды
        </h1>
      </div>

      <p
        className="mb-8 text-muted-foreground"
        data-testid="text-guides-subtitle"
      >
        Здесь собраны простые и полезные материалы по резюме, собеседованиям,
        удалённой работе и безопасному поиску вакансий. Всё бесплатно и написано
        простым языком.
      </p>

      <div className="space-y-3">
        {guides.map((guide) => {
          const Icon = iconMap[guide.icon] || BookOpen;
          return (
            <Card
              key={guide.id}
              className="cursor-pointer border-0 shadow-sm transition-all hover:shadow-md hover:border-primary/20"
              onClick={() => navigate(`/guides/${guide.id}`)}
              data-testid={`card-guide-${guide.id}`}
            >
              <CardContent className="flex items-center gap-4 p-4 md:p-5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold leading-snug">{guide.title}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground line-clamp-2">
                    {guide.subtitle}
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-8 text-center">
        <Button
          variant="outline"
          className="w-full"
          onClick={() => navigate("/readiness")}
          data-testid="button-go-readiness"
        >
          Проверить готовность к удалённой работе
        </Button>
      </div>
    </AppLayout>
  );
};

const Guides = () => {
  const { guideId } = useParams();
  const guide = guideId ? guides.find((g) => g.id === guideId) : null;

  if (guideId && guide) {
    return <GuideDetail guide={guide} />;
  }

  return <GuidesList />;
};

export default Guides;
