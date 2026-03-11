import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { ResumePreviewCard } from "@/components/ResumePreviewCard";
import { SectionCard } from "@/components/SectionCard";
import { useHrxState } from "@/context/hrx-state";
import { buildProfileSummary, mockResumePreview } from "@/data/mockResumeHelpers";

const Profile = () => {
  const navigate = useNavigate();
  const { state } = useHrxState();
  const summary = buildProfileSummary(state.quizState);

  return (
    <AppLayout>
      <div className="mx-auto max-w-3xl space-y-6 md:space-y-8">
        <button type="button" onClick={() => navigate("/quiz")} className="flex items-center gap-1.5 text-sm font-semibold text-primary" data-testid="button-back-to-quiz">
          <ArrowLeft className="h-4 w-4" />
          Вернуться к квизу
        </button>
        <h1 className="text-[28px] font-bold md:text-[32px]">Ваш профессиональный профиль</h1>

        <SectionCard title="Краткое описание">
          {summary.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </SectionCard>

        <SectionCard title="Сильные стороны">
          <p>{state.quizState.professionalSkills.join(", ") || "Структурный подход, внимательность к деталям, спокойная коммуникация"}</p>
        </SectionCard>

        <SectionCard title="Целевые роли">
          <p>{state.quizState.targetRoles.join(", ") || "Роли пока не выбраны"}</p>
        </SectionCard>

        <SectionCard title="Ограничения">
          <p>{state.quizState.restrictions.join(", ") || "Ограничения пока не заданы"}</p>
        </SectionCard>

        <ResumePreviewCard preview={mockResumePreview} />

        <div className="space-y-2 text-center">
          <p className="text-sm text-muted-foreground">Полное резюме и подборка вакансий доступны после оплаты</p>
          <Button variant="hero" className="w-full" onClick={() => navigate("/results")} data-testid="button-get-results">
            Получить за 300 ₽
          </Button>
          <p className="text-xs text-muted-foreground">Одноразовый платёж. Не подписка.</p>
        </div>
      </div>
    </AppLayout>
  );
};

export default Profile;
