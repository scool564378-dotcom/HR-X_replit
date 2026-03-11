import { useState, useCallback, useMemo } from "react";
import { X, Heart, Undo2, List, Layers, Bookmark, Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SwipeJobCard } from "@/components/SwipeJobCard";
import { JobCard } from "@/components/JobCard";
import { useHrxState } from "@/context/hrx-state";

export const JobSwiper = () => {
  const { state, dispatch } = useHrxState();
  const { jobs, decisions, decisionHistory, sortMode, showScoring } = state.jobsState;
  const [animating, setAnimating] = useState(false);
  const [animDir, setAnimDir] = useState<"left" | "right" | null>(null);
  const [tab, setTab] = useState<"pending" | "saved" | "archived">("pending");

  const visibleJobs = useMemo(() => {
    let filtered = state.jobsState.hideNotRecommended
      ? jobs.filter((j) => j.status !== "not_recommended")
      : jobs;

    const { dateFilter } = state.jobsState;
    if (dateFilter !== "all") {
      const days = parseInt(dateFilter, 10);
      const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
      filtered = filtered.filter((j) => {
        if (!j.publishedAt) return true;
        return new Date(j.publishedAt).getTime() >= cutoff;
      });
    }

    return filtered;
  }, [jobs, state.jobsState.hideNotRecommended, state.jobsState.dateFilter]);

  const pendingJobs = useMemo(() => visibleJobs.filter((j) => !decisions[j.id]), [visibleJobs, decisions]);
  const savedJobs = useMemo(() => visibleJobs.filter((j) => decisions[j.id] === "saved"), [visibleJobs, decisions]);
  const archivedJobs = useMemo(() => visibleJobs.filter((j) => decisions[j.id] === "archived"), [visibleJobs, decisions]);

  const currentJob = pendingJobs[0] ?? null;

  const animateAndAct = useCallback(
    (direction: "left" | "right", action: () => void) => {
      if (animating) return;
      setAnimDir(direction);
      setAnimating(true);
      setTimeout(() => {
        action();
        setAnimating(false);
        setAnimDir(null);
      }, 280);
    },
    [animating]
  );

  const handleSave = useCallback(() => {
    if (!currentJob) return;
    animateAndAct("right", () => dispatch({ type: "DECIDE_JOB", payload: { id: currentJob.id, decision: "saved" } }));
  }, [currentJob, dispatch, animateAndAct]);

  const handleArchive = useCallback(() => {
    if (!currentJob) return;
    animateAndAct("left", () => dispatch({ type: "DECIDE_JOB", payload: { id: currentJob.id, decision: "archived" } }));
  }, [currentJob, dispatch, animateAndAct]);

  const handleUndo = useCallback(() => {
    dispatch({ type: "UNDO_LAST_SWIPE" });
  }, [dispatch]);

  if (sortMode === "list") {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground" data-testid="text-jobs-count">
            Найдено: {visibleJobs.length}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => dispatch({ type: "SET_SORT_MODE", payload: "swipe" })}
            className="gap-1.5"
            data-testid="button-switch-swipe"
          >
            <Layers className="h-4 w-4" />
            Быстрый отбор
          </Button>
        </div>
        {visibleJobs.map((job) => (
          <JobCard key={job.id} job={job} showScoring={showScoring} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          <Button
            variant={tab === "pending" ? "hero" : "outline"}
            size="sm"
            onClick={() => setTab("pending")}
            className="gap-1.5"
            data-testid="button-tab-pending"
          >
            <Layers className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Отбор</span>
            <span className="tabular-nums">({pendingJobs.length})</span>
          </Button>
          <Button
            variant={tab === "saved" ? "hero" : "outline"}
            size="sm"
            onClick={() => setTab("saved")}
            className="gap-1.5"
            data-testid="button-tab-saved"
          >
            <Bookmark className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Сохранённые</span>
            <span className="tabular-nums">({savedJobs.length})</span>
          </Button>
          <Button
            variant={tab === "archived" ? "hero" : "outline"}
            size="sm"
            onClick={() => setTab("archived")}
            className="gap-1.5"
            data-testid="button-tab-archived"
          >
            <Archive className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Архив</span>
            <span className="tabular-nums">({archivedJobs.length})</span>
          </Button>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => dispatch({ type: "SET_SORT_MODE", payload: "list" })}
          className="gap-1.5"
          data-testid="button-switch-list"
        >
          <List className="h-4 w-4" />
          <span className="hidden sm:inline">Список</span>
        </Button>
      </div>

      {tab === "pending" && (
        <>
          {pendingJobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-border bg-card p-8 text-center" data-testid="status-all-sorted">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Heart className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Все вакансии просмотрены!</h3>
              <p className="text-muted-foreground">
                Сохранено: {savedJobs.length} · В архиве: {archivedJobs.length}
              </p>
              {decisionHistory.length > 0 && (
                <Button variant="outline" onClick={handleUndo} className="gap-1.5" data-testid="button-undo-final">
                  <Undo2 className="h-4 w-4" />
                  Вернуть последнюю
                </Button>
              )}
            </div>
          ) : currentJob ? (
            <div className="flex flex-col items-center gap-4">
              <p className="text-sm text-muted-foreground" data-testid="text-swipe-counter">
                Осталось: {pendingJobs.length} из {visibleJobs.length}
              </p>
              <p className="flex w-full max-w-md justify-between text-xs text-muted-foreground/60">
                <span>← В архив</span>
                <span>Оставить →</span>
              </p>

              <div className="relative w-full max-w-md">
                <SwipeJobCard
                  key={currentJob.id}
                  job={currentJob}
                  onSave={handleSave}
                  onArchive={handleArchive}
                  showScoring={showScoring}
                  isAnimating={animating}
                  animationDirection={animDir}
                />
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleArchive}
                  disabled={animating}
                  className="h-14 w-14 rounded-full border-2 border-red-300 text-red-500 hover:bg-red-50 hover:text-red-600 dark:border-red-800 dark:hover:bg-red-950"
                  data-testid="button-archive"
                >
                  <X className="h-6 w-6" />
                </Button>

                {decisionHistory.length > 0 && (
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleUndo}
                    disabled={animating}
                    className="h-10 w-10 rounded-full"
                    data-testid="button-undo"
                  >
                    <Undo2 className="h-4 w-4" />
                  </Button>
                )}

                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleSave}
                  disabled={animating}
                  className="h-14 w-14 rounded-full border-2 border-emerald-300 text-emerald-500 hover:bg-emerald-50 hover:text-emerald-600 dark:border-emerald-800 dark:hover:bg-emerald-950"
                  data-testid="button-save"
                >
                  <Heart className="h-6 w-6" />
                </Button>
              </div>
            </div>
          ) : null}
        </>
      )}

      {tab === "saved" && (
        <div className="space-y-3">
          {savedJobs.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground" data-testid="status-no-saved">
              Пока нет сохранённых вакансий. Смахните вправо или нажмите ♥ чтобы сохранить.
            </p>
          ) : (
            savedJobs.map((job) => <JobCard key={job.id} job={job} showScoring={showScoring} />)
          )}
        </div>
      )}

      {tab === "archived" && (
        <div className="space-y-3">
          {archivedJobs.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground" data-testid="status-no-archived">
              Архив пуст. Смахните влево или нажмите ✗ чтобы отправить в архив.
            </p>
          ) : (
            archivedJobs.map((job) => <JobCard key={job.id} job={job} showScoring={showScoring} />)
          )}
        </div>
      )}
    </div>
  );
};
