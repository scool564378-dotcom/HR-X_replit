import { useState } from "react";
import { ChevronDown, ExternalLink, MapPin, ShieldCheck, ShieldAlert, CheckCircle, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import type { JobItem } from "@/types/hrx";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { CompanyScoreBadge } from "@/components/CompanyScoreBadge";

interface JobCardProps {
  job: JobItem;
  showScoring?: boolean;
}

export const JobCard = ({ job, showScoring = false }: JobCardProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Card data-testid={`card-job-${job.id}`}>
      <CardContent className="space-y-4 p-4 md:p-5">
        <div className="flex flex-col gap-2">
          <h3 className="text-xl font-bold" data-testid={`text-job-title-${job.id}`}>{job.title}</h3>
          <p className="text-muted-foreground" data-testid={`text-job-company-${job.id}`}>{job.company}</p>
          <div className="flex flex-wrap items-center gap-2">
            {job.location && (
              <span className="flex items-center gap-1 rounded-full border border-border bg-secondary px-3 py-1 text-sm">
                <MapPin className="h-3.5 w-3.5" />
                {job.location}
              </span>
            )}
            {job.schedule && (
              <span className="rounded-full border border-border bg-secondary px-3 py-1 text-sm">{job.schedule}</span>
            )}
            <span className="rounded-full border border-border bg-secondary px-3 py-1 text-sm" data-testid={`text-job-salary-${job.id}`}>{job.salary}</span>
            <StatusBadge status={job.status} />
            {showScoring && job.companyScore && <CompanyScoreBadge score={job.companyScore} />}
          </div>
        </div>

        <Button variant="outline" onClick={() => setOpen((prev) => !prev)} className="w-full justify-between" data-testid={`button-details-${job.id}`}>
          Подробности
          <ChevronDown className={`h-5 w-5 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
        </Button>

        {open ? (
          <div className="space-y-3 rounded-card border border-border bg-secondary p-4 text-sm">
            <p data-testid={`text-job-description-${job.id}`}>{job.description}</p>

            {job.reason && (
              <p><span className="font-semibold">Почему так:</span> {job.reason}</p>
            )}

            {showScoring && job.companyScore && (
              <div className="space-y-2 rounded-lg border border-border bg-card p-3" data-testid={`section-scoring-${job.id}`}>
                <p className="font-semibold flex items-center gap-1.5">
                  {job.companyScore.level === "trusted" || job.companyScore.level === "normal"
                    ? <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    : <ShieldAlert className="h-4 w-4 text-amber-600" />}
                  Проверка компании — {job.companyScore.total}/100
                </p>

                {job.companyScore.positives.length > 0 && (
                  <ul className="space-y-0.5">
                    {job.companyScore.positives.map((p, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-emerald-700 dark:text-emerald-400">
                        <CheckCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {job.companyScore.flags.length > 0 && (
                  <ul className="space-y-0.5">
                    {job.companyScore.flags.map((f, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-amber-700 dark:text-amber-400">
                        <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {job.redFlags.length > 0 && !job.companyScore && (
              <div>
                <p className="font-semibold">Красные флаги:</p>
                <ul className="list-disc space-y-1 pl-6">
                  {job.redFlags.map((flag) => (
                    <li key={flag}>{flag}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="grid gap-2 md:grid-cols-2">
              {job.url ? (
                <Button variant="soft" asChild data-testid={`link-vacancy-${job.id}`}>
                  <a href={job.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                    Открыть на {job.source}
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              ) : (
                <Button variant="soft" data-testid={`button-vacancy-${job.id}`}>Открыть вакансию</Button>
              )}
              <Button variant="hero" asChild>
                <Link to={`/results/adapt/${job.id}`} data-testid={`link-adapt-${job.id}`}>Адаптировать резюме — 100 руб.</Link>
              </Button>
            </div>
            <p className="text-muted-foreground" data-testid={`text-job-source-${job.id}`}>Источник: {job.source}</p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
};
