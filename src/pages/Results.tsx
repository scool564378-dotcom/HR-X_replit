import { useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { JobSwiper } from "@/components/JobSwiper";
import { SectionCard } from "@/components/SectionCard";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useHrxState } from "@/context/hrx-state";
import { useAuth } from "@/context/auth-context";
import { buildAtsKeywordReport, buildResumeText } from "@/data/mockResumeHelpers";
import { searchAllVacancies } from "@/services/jobApi";
import { downloadPdf, downloadDocx, downloadTxt, exportJobsCsv } from "@/services/exportResume";
import { ResultsArchive } from "@/components/ResultsArchive";
import { Paywall, PaywallBlock } from "@/components/Paywall";
import { JobCard } from "@/components/JobCard";
import { Loader2, RefreshCw, AlertCircle, FileText, FileDown, FileSpreadsheet, Info, ShieldCheck, ArrowLeft, Lock } from "lucide-react";

const FREE_PREVIEW_JOBS = 3;

const Results = () => {
  const navigate = useNavigate();
  const { state, dispatch } = useHrxState();
  const { hasPaid } = useAuth();
  const atsReport = buildAtsKeywordReport(state.quizState);
  const resumeText = buildResumeText(state.quizState, state.resumeState.resumeMode);

  const loadJobs = useCallback(async () => {
    if (state.quizState.targetRoles.length === 0) {
      dispatch({ type: "SET_JOBS_ERROR", payload: "Для поиска вакансий выберите целевые должности в квизе." });
      return;
    }
    dispatch({ type: "SET_JOBS_LOADING", payload: true });
    try {
      const jobs = await searchAllVacancies(state.quizState);
      dispatch({ type: "SET_JOBS", payload: jobs });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Не удалось загрузить вакансии. Попробуйте ещё раз.";
      dispatch({ type: "SET_JOBS_ERROR", payload: msg });
    }
  }, [state.quizState, dispatch]);

  useEffect(() => {
    if (!state.jobsState.searchCompleted && !state.jobsState.isLoading) {
      loadJobs();
    }
  }, []);

  const handleExportPdf = () => downloadPdf(resumeText, "resume.pdf");
  const handleExportDocx = () => downloadDocx(resumeText, "resume.docx");
  const handleExportTxt = () => downloadTxt(resumeText, "resume.txt");

  const handleExportProfile = () => {
    const { quizState } = state;
    const lines = [
      "ПРОФЕССИОНАЛЬНЫЙ ПРОФИЛЬ",
      "",
      `Регион: ${quizState.region?.name ?? "не указан"}`,
      `Рабочие часы (МСК): ${quizState.moscowHours.from}–${quizState.moscowHours.to}`,
      `Целевые роли: ${quizState.targetRoles.join(", ") || "не выбраны"}`,
      `Опыт: ${quizState.totalExperience || "не указан"}`,
      `Навыки: ${quizState.professionalSkills.join(", ") || "не указаны"}`,
      `График: ${quizState.schedules.join(", ") || "не указан"}`,
      `Зарплата: ${quizState.salaryMin || "не указана"}`,
      `Ограничения: ${quizState.restrictions.join(", ") || "нет"}`,
    ];
    downloadTxt(lines.join("\n"), "profile.txt");
  };

  const savedJobs = state.jobsState.jobs.filter((j) => state.jobsState.decisions[j.id] === "saved");
  const hasJobs = state.jobsState.jobs.length > 0;

  const handleExportVacancies = () => {
    const jobsToExport = savedJobs.length > 0 ? savedJobs : state.jobsState.jobs;
    if (jobsToExport.length === 0) return;
    exportJobsCsv(
      jobsToExport.map(j => ({
        ...j,
        scoringTotal: j.companyScore?.total,
        scoringLevel: j.companyScore?.level,
      })),
      "vacancies.csv"
    );
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-4xl space-y-6 md:space-y-8">
        <button type="button" onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm font-semibold text-primary" data-testid="button-back">
          <ArrowLeft className="h-4 w-4" />
          Назад
        </button>
        <h1 className="text-[28px] font-bold md:text-[32px]" data-testid="text-results-title">Результаты</h1>

        <Tabs defaultValue="resume" className="space-y-4">
          <TabsList className="grid h-auto w-full grid-cols-3 gap-2 rounded-card bg-secondary p-2">
            <TabsTrigger value="resume" className="min-h-[56px] rounded-button text-base" data-testid="tab-resume">Резюме</TabsTrigger>
            <TabsTrigger value="jobs" className="min-h-[56px] rounded-button text-base" data-testid="tab-jobs">Вакансии</TabsTrigger>
            <TabsTrigger value="more" className="min-h-[56px] rounded-button text-base" data-testid="tab-more">Экспорт</TabsTrigger>
          </TabsList>

          <TabsContent value="resume" className="space-y-4">
            <div className="rounded-card border border-border bg-card p-4 space-y-3">
              <p className="text-sm font-semibold">Выберите формат резюме:</p>
              <div className="grid gap-2 md:grid-cols-2">
                <Button
                  variant={state.resumeState.resumeMode === "regular" ? "hero" : "outline"}
                  onClick={() => dispatch({ type: "SET_RESUME_MODE", payload: "regular" })}
                  className="h-auto min-h-[56px] flex-col items-start gap-1 whitespace-normal px-4 py-3 text-left"
                  data-testid="button-resume-regular"
                >
                  <span className="text-base font-bold">Обычное</span>
                  <span className="text-xs font-normal opacity-80">Готовый текст для отправки работодателю по электронной почте или через сайт</span>
                </Button>
                <Button
                  variant={state.resumeState.resumeMode === "ats" ? "hero" : "outline"}
                  onClick={() => dispatch({ type: "SET_RESUME_MODE", payload: "ats" })}
                  className="h-auto min-h-[56px] flex-col items-start gap-1 whitespace-normal px-4 py-3 text-left"
                  data-testid="button-resume-ats"
                >
                  <span className="text-base font-bold">ATS-версия</span>
                  <span className="text-xs font-normal opacity-80">Для размещения на hh.ru и других сайтах — содержит ключевые слова для автоматического подбора</span>
                </Button>
              </div>

              <div className="flex items-start gap-2 rounded-lg bg-secondary p-3">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                {state.resumeState.resumeMode === "regular" ? (
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">Обычное резюме</span> — это готовый текст, который можно скопировать и отправить работодателю. Подходит для электронной почты, мессенджеров и прямых откликов.
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">ATS-версия</span> — специальный формат для сайтов поиска работы (hh.ru, SuperJob). Содержит ключевые слова, которые помогают системе автоматически подобрать ваше резюме для подходящих вакансий. Чем больше ключевых слов совпадёт — тем выше шанс, что работодатель увидит ваше резюме.
                  </p>
                )}
              </div>
            </div>

            <Paywall feature="Полное резюме">
              <SectionCard title="Текст резюме">
                <div className="whitespace-pre-wrap text-sm" data-testid="text-resume-content">{resumeText}</div>
              </SectionCard>
            </Paywall>

            {hasPaid && state.resumeState.resumeMode === "ats" && (
              <SectionCard title="Ключевые слова ATS">
                <div className="space-y-2">
                  <div className="flex items-start gap-2 rounded-lg bg-emerald-50 p-3 dark:bg-emerald-950">
                    <span className="mt-0.5 text-emerald-600">✓</span>
                    <div>
                      <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">Включены в резюме:</p>
                      <p className="text-sm text-emerald-600 dark:text-emerald-400">{atsReport.included.join(", ")}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 rounded-lg bg-amber-50 p-3 dark:bg-amber-950">
                    <span className="mt-0.5 text-amber-600">!</span>
                    <div>
                      <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">Рекомендуем добавить:</p>
                      <p className="text-sm text-amber-600 dark:text-amber-400">{atsReport.missing.join(", ")}</p>
                    </div>
                  </div>
                </div>
              </SectionCard>
            )}

            {hasPaid ? (
              <div className="space-y-2">
                <p className="text-sm font-semibold">Скачать резюме:</p>
                <p className="text-xs text-muted-foreground">Выберите удобный формат. Файл сохранится на ваше устройство.</p>
                <div className="grid gap-2 md:grid-cols-3">
                  <Button variant="soft" onClick={handleExportPdf} className="gap-2" data-testid="button-export-pdf">
                    <FileText className="h-4 w-4" />
                    Скачать PDF
                  </Button>
                  <Button variant="soft" onClick={handleExportDocx} className="gap-2" data-testid="button-export-docx">
                    <FileDown className="h-4 w-4" />
                    Скачать DOCX
                  </Button>
                  <Button variant="soft" onClick={handleExportTxt} className="gap-2" data-testid="button-export-txt">
                    <FileDown className="h-4 w-4" />
                    Скачать TXT
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 rounded-card border border-border bg-card p-4 text-sm text-muted-foreground">
                <Lock className="h-4 w-4 shrink-0" />
                Скачивание резюме доступно после оплаты
              </div>
            )}
          </TabsContent>

          <TabsContent value="jobs" className="space-y-4">
            {hasPaid && (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <label className="flex min-h-[56px] flex-1 items-center justify-between rounded-card border border-border bg-card px-4">
                    <span className="font-semibold">Скрыть не рекомендованные</span>
                    <Switch
                      checked={state.jobsState.hideNotRecommended}
                      onCheckedChange={() => dispatch({ type: "TOGGLE_HIDE_NOT_RECOMMENDED" })}
                      data-testid="switch-hide-not-recommended"
                    />
                  </label>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-[56px] w-[56px] shrink-0"
                    onClick={loadJobs}
                    disabled={state.jobsState.isLoading}
                    data-testid="button-refresh-jobs"
                  >
                    <RefreshCw className={`h-5 w-5 ${state.jobsState.isLoading ? "animate-spin" : ""}`} />
                  </Button>
                </div>

                <label className="flex min-h-[56px] items-center justify-between rounded-card border border-border bg-card px-4">
                  <span className="font-semibold">Дата публикации</span>
                  <select
                    value={state.jobsState.dateFilter}
                    onChange={(e) => dispatch({ type: "SET_DATE_FILTER", payload: e.target.value as "all" | "3" | "7" | "30" })}
                    className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    data-testid="select-date-filter"
                  >
                    <option value="all">Все</option>
                    <option value="3">Последние 3 дня</option>
                    <option value="7">Последние 7 дней</option>
                    <option value="30">Последние 30 дней</option>
                  </select>
                </label>

                <div className="rounded-card border border-border bg-card p-4 space-y-3">
                  <label className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-5 w-5 text-primary" />
                      <span className="font-semibold">Проверка надёжности компаний</span>
                    </div>
                    <Switch
                      checked={state.jobsState.showScoring}
                      onCheckedChange={() => dispatch({ type: "TOGGLE_SHOW_SCORING" })}
                      data-testid="switch-show-scoring"
                    />
                  </label>

                  {state.jobsState.showScoring ? (
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p>Каждая компания получает оценку от 0 до 100 баллов. Мы проверяем:</p>
                      <ul className="space-y-1 pl-1">
                        <li className="flex items-start gap-2"><span className="text-emerald-600 shrink-0">+</span> Верификация на hh.ru (компания подтверждена площадкой)</li>
                        <li className="flex items-start gap-2"><span className="text-emerald-600 shrink-0">+</span> Наличие логотипа и полного профиля</li>
                        <li className="flex items-start gap-2"><span className="text-emerald-600 shrink-0">+</span> Адекватный уровень зарплаты для должности</li>
                        <li className="flex items-start gap-2"><span className="text-amber-600 shrink-0">!</span> Подозрительно высокие зарплаты без требований</li>
                        <li className="flex items-start gap-2"><span className="text-amber-600 shrink-0">!</span> Признаки сетевого маркетинга или финансовых пирамид</li>
                        <li className="flex items-start gap-2"><span className="text-amber-600 shrink-0">!</span> Расплывчатые описания без конкретных задач</li>
                      </ul>
                      <p className="rounded-lg bg-amber-50 p-3 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                        Проверка автоматическая и не гарантирует 100% точности. Всегда изучайте вакансию самостоятельно перед откликом: проверьте сайт компании, почитайте отзывы, не переводите деньги работодателю.
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Включите, чтобы видеть оценку надёжности каждой компании и предупреждения о возможных рисках.
                    </p>
                  )}
                </div>
              </div>
            )}

            {state.jobsState.isLoading ? (
              <div className="flex flex-col items-center justify-center gap-3 py-12" data-testid="status-jobs-loading">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <p className="text-muted-foreground">Ищем вакансии на hh.ru и trudvsem.ru...</p>
                <p className="text-sm text-muted-foreground">Это может занять 10–15 секунд</p>
              </div>
            ) : state.jobsState.error ? (
              <div className="flex flex-col items-center justify-center gap-3 py-12" data-testid="status-jobs-error">
                <AlertCircle className="h-8 w-8 text-destructive" />
                <p className="text-center text-muted-foreground">{state.jobsState.error}</p>
                <Button variant="outline" onClick={loadJobs} data-testid="button-retry-jobs">Попробовать снова</Button>
              </div>
            ) : state.jobsState.jobs.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-4 rounded-card border border-border bg-card p-6" data-testid="status-jobs-empty">
                <AlertCircle className="h-8 w-8 text-muted-foreground" />
                <div className="space-y-2 text-center">
                  {state.quizState.targetRoles.length === 0 ? (
                    <>
                      <p className="font-semibold">Для поиска вакансий нужно пройти квиз</p>
                      <p className="text-sm text-muted-foreground">Вернитесь в квиз и выберите целевые должности на шаге 2. После этого вакансии загрузятся автоматически.</p>
                      <Button variant="hero" onClick={() => window.location.href = "/quiz"} className="mt-2" data-testid="button-go-quiz">
                        Перейти к квизу
                      </Button>
                    </>
                  ) : (
                    <>
                      <p className="font-semibold">Вакансий не найдено</p>
                      <p className="text-sm text-muted-foreground">Попробуйте нажать кнопку обновления или измените параметры поиска в квизе.</p>
                      <Button variant="outline" onClick={loadJobs} data-testid="button-search-again">Искать снова</Button>
                    </>
                  )}
                </div>
              </div>
            ) : hasPaid ? (
              <JobSwiper />
            ) : (
              <div className="space-y-3">
                <div className="rounded-card border border-primary/20 bg-primary/5 p-3 text-center">
                  <p className="text-sm font-semibold">
                    Найдено вакансий: <span className="text-primary text-lg">{state.jobsState.jobs.length}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">Показаны {FREE_PREVIEW_JOBS} из {state.jobsState.jobs.length}. Оплатите доступ, чтобы увидеть все.</p>
                </div>
                {state.jobsState.jobs.slice(0, FREE_PREVIEW_JOBS).map((job) => (
                  <JobCard key={job.id} job={job} showScoring={state.jobsState.showScoring} />
                ))}
                <PaywallBlock feature="Все вакансии" />
              </div>
            )}
          </TabsContent>

          <TabsContent value="more" className="space-y-4">
            {hasPaid && <ResultsArchive />}

            {hasPaid ? (
              <SectionCard title="Экспорт данных">
                <p className="text-sm text-muted-foreground mb-3">Скачайте ваш профиль или список вакансий на устройство.</p>
                <div className="grid gap-2 md:grid-cols-2">
                  <Button variant="soft" onClick={handleExportProfile} className="gap-2" data-testid="button-export-profile">
                    <FileText className="h-4 w-4" />
                    Скачать профиль
                  </Button>
                  <Button
                    variant="soft"
                    onClick={handleExportVacancies}
                    disabled={!hasJobs}
                    className="gap-2"
                    data-testid="button-export-vacancies"
                  >
                    <FileSpreadsheet className="h-4 w-4" />
                    {hasJobs
                      ? savedJobs.length > 0
                        ? `Скачать сохранённые (${savedJobs.length})`
                        : `Скачать все вакансии (${state.jobsState.jobs.length})`
                      : "Сначала найдите вакансии"}
                  </Button>
                </div>
              </SectionCard>
            ) : (
              <PaywallBlock feature="Экспорт и архив" />
            )}

            <SectionCard title="Как пользоваться приложением">
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">1</span>
                  <p><span className="font-semibold text-foreground">Квиз</span> — ответьте на вопросы о вашем опыте и пожеланиях. Это занимает 3–5 минут.</p>
                </div>
                <div className="flex gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">2</span>
                  <p><span className="font-semibold text-foreground">Резюме</span> — на основе ваших ответов мы составим готовое резюме. Скачайте его в PDF или DOCX.</p>
                </div>
                <div className="flex gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">3</span>
                  <p><span className="font-semibold text-foreground">Вакансии</span> — мы автоматически найдём удалённые вакансии с hh.ru и Работа России. Листайте карточки: вправо — сохранить, влево — пропустить.</p>
                </div>
                <div className="flex gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">4</span>
                  <p><span className="font-semibold text-foreground">Экспорт</span> — скачайте резюме и список вакансий на ваш компьютер или телефон.</p>
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Источники вакансий">
              <p className="text-sm text-muted-foreground">
                Вакансии загружаются в реальном времени из двух проверенных источников: <span className="font-semibold text-foreground">hh.ru</span> (HeadHunter) и <span className="font-semibold text-foreground">trudvsem.ru</span> (Работа России — государственный портал). Мы показываем только удалённые вакансии и проверяем надёжность каждой компании.
              </p>
            </SectionCard>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Results;
