import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/SectionCard";
import { useHrxState } from "@/context/hrx-state";
import { mockJobs } from "@/data/mockJobs";

const AdaptResult = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { state } = useHrxState();

  const job = useMemo(() => mockJobs.find((item) => item.id === id), [id]);

  if (!job) {
    return (
      <AppLayout>
        <SectionCard title="Вакансия не найдена">
          <Button variant="hero" onClick={() => navigate("/results")}>Вернуться к результатам</Button>
        </SectionCard>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="mx-auto max-w-4xl space-y-6 md:space-y-8">
        <h1 className="text-[28px] font-bold md:text-[32px]">Адаптация под вакансию: {job.title}</h1>

        <SectionCard title="Что изменилось">
          <ul className="list-disc space-y-1 pl-6 text-foreground">
            <li>Усилен блок опыта под требования вакансии.</li>
            <li>Добавлены релевантные ключевые слова и терминология.</li>
            <li>Скорректирован порядок навыков под ожидания работодателя.</li>
          </ul>
        </SectionCard>

        <SectionCard title="Шкала совпадения">
          <div className="space-y-2">
            <div className="h-3 rounded-full bg-secondary">
              <div className="h-3 w-[78%] rounded-full bg-primary" />
            </div>
            <p className="text-sm text-muted-foreground">Совпадение: 78% (mock-оценка)</p>
          </div>
        </SectionCard>

        <SectionCard title="Адаптированное резюме">
          <pre className="whitespace-pre-wrap text-sm">
{`Профессиональный профиль
Опытный специалист по удалённому документообороту и поддержке процессов.

Релевантный опыт
• Контроль и согласование пакета документов
• Работа в CRM и ЭДО
• Координация задач между отделами`}
          </pre>
        </SectionCard>

        <div className="grid gap-2 md:max-w-md md:grid-cols-3">
          <Button variant="soft">PDF</Button>
          <Button variant="soft">DOCX</Button>
          <Button variant="soft">TXT</Button>
        </div>
      </div>
    </AppLayout>
  );
};

export default AdaptResult;
