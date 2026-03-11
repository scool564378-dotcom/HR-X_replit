import type { CompanyScore } from "@/types/hrx";

export interface HhScoringData {
  employer: {
    trusted?: boolean;
    name: string;
    logo_urls?: Record<string, string> | null;
    accredited_it_employer?: boolean;
  };
  salary: { from: number | null; to: number | null } | null;
  has_test?: boolean;
  contacts?: unknown | null;
  description?: string;
  snippet: { requirement: string | null; responsibility: string | null };
}

export interface TrudvsemScoringData {
  company?: {
    name: string;
    inn?: string;
    ogrn?: string;
    site?: string;
  };
  salary_min?: number;
  salary_max?: number;
  duty?: string;
  requirements?: string;
  contact_list?: { contact_type: string; contact_value: string }[];
}

const SPAM_PATTERNS = [
  /заработ(ок|ай)\s*(от|до)?\s*\d+\s*(тыс|000)/i,
  /без\s*опыт.*сразу/i,
  /доход\s*от\s*\d{3}\s*000/i,
  /лёгк(ий|ая)\s*работ/i,
  /работа\s*на\s*дому.*доход/i,
  /сетевой\s*маркетинг/i,
  /млм|mlm/i,
  /криптовалют/i,
  /ставк(и|а)\s*на\s*спорт/i,
  /казино|betting|gambling/i,
  /финансов(ая|ый)\s*пирамид/i,
  /микрозайм/i,
];

const SUSPICIOUS_COMPANY_NAMES = [
  /ип\s+[а-яё]+\s*$/i,
  /^ооо\s*"?[а-яё]{2,4}"?$/i,
];

function checkTextForSpam(text: string): string[] {
  const flags: string[] = [];
  for (const pattern of SPAM_PATTERNS) {
    if (pattern.test(text)) {
      flags.push("Текст вакансии содержит признаки спама");
      break;
    }
  }
  return flags;
}

function checkCompanyName(name: string): string[] {
  const flags: string[] = [];
  for (const pattern of SUSPICIOUS_COMPANY_NAMES) {
    if (pattern.test(name.trim())) {
      flags.push("Короткое/подозрительное название компании");
      break;
    }
  }
  return flags;
}

export function scoreHhVacancy(data: HhScoringData): CompanyScore {
  let score = 50;
  const flags: string[] = [];
  const positives: string[] = [];

  if (data.employer.trusted) {
    score += 20;
    positives.push("Верифицированный работодатель на hh.ru");
  } else {
    score -= 10;
    flags.push("Работодатель не прошёл верификацию hh.ru");
  }

  if (data.employer.accredited_it_employer) {
    score += 10;
    positives.push("Аккредитованная IT-компания");
  }

  if (data.employer.logo_urls && Object.keys(data.employer.logo_urls).length > 0) {
    score += 5;
    positives.push("Логотип компании загружен");
  } else {
    score -= 5;
    flags.push("Нет логотипа компании");
  }

  if (data.salary != null && (data.salary.from != null || data.salary.to != null)) {
    score += 10;
    positives.push("Зарплата указана");
  } else {
    score -= 5;
    flags.push("Зарплата не указана");
  }

  if (data.has_test) {
    score += 5;
    positives.push("Есть тестовое задание (структурированный найм)");
  }

  if (data.contacts != null) {
    score += 5;
    positives.push("Контактные данные доступны");
  }

  const reqLen = (data.snippet.requirement || "").length;
  const respLen = (data.snippet.responsibility || "").length;
  if (reqLen > 50 && respLen > 50) {
    score += 10;
    positives.push("Подробное описание требований и обязанностей");
  } else if (reqLen < 20 && respLen < 20) {
    score -= 10;
    flags.push("Очень краткое описание вакансии");
  }

  flags.push(...checkCompanyName(data.employer.name));
  if (flags.length > positives.length) score -= 5;

  const allText = `${data.snippet.requirement || ""} ${data.snippet.responsibility || ""} ${data.description || ""}`;
  const spamFlags = checkTextForSpam(allText);
  if (spamFlags.length > 0) {
    score -= 30;
    flags.push(...spamFlags);
  }

  const highSalaryThreshold = 300000;
  if (
    (data.salary?.from != null && data.salary.from > highSalaryThreshold) ||
    (data.salary?.to != null && data.salary.to > highSalaryThreshold * 2)
  ) {
    flags.push("Подозрительно высокая зарплата");
    score -= 15;
  }

  score = Math.max(0, Math.min(100, score));

  return {
    total: score,
    level: scoreToLevel(score),
    flags,
    positives,
  };
}

export function scoreTrudvsemVacancy(data: TrudvsemScoringData): CompanyScore {
  let score = 50;
  const flags: string[] = [];
  const positives: string[] = [];

  positives.push("Размещено на государственном портале «Работа России»");
  score += 10;

  if (data.company?.inn) {
    score += 10;
    positives.push("ИНН компании указан");
  } else {
    score -= 5;
    flags.push("ИНН компании не указан");
  }

  if (data.company?.ogrn) {
    score += 5;
    positives.push("ОГРН компании указан");
  }

  if (data.company?.site) {
    score += 5;
    positives.push("Сайт компании указан");
  } else {
    flags.push("Нет сайта компании");
  }

  if (data.salary_min != null || data.salary_max != null) {
    score += 5;
    positives.push("Зарплата указана");
  } else {
    score -= 5;
    flags.push("Зарплата не указана");
  }

  if (data.duty && data.duty.length > 50) {
    score += 5;
    positives.push("Подробное описание обязанностей");
  } else {
    score -= 5;
    flags.push("Краткое описание обязанностей");
  }

  if (data.requirements && data.requirements.length > 30) {
    score += 5;
    positives.push("Требования к кандидату указаны");
  }

  if (data.contact_list && data.contact_list.length > 0) {
    score += 5;
    positives.push("Контактные данные указаны");
  }

  if (data.company?.name) {
    flags.push(...checkCompanyName(data.company.name));
  }

  const allText = `${data.duty || ""} ${data.requirements || ""}`;
  const spamFlags = checkTextForSpam(allText);
  if (spamFlags.length > 0) {
    score -= 30;
    flags.push(...spamFlags);
  }

  if (data.salary_max != null && data.salary_max > 500000) {
    flags.push("Подозрительно высокая зарплата для данной площадки");
    score -= 15;
  }

  score = Math.max(0, Math.min(100, score));

  return {
    total: score,
    level: scoreToLevel(score),
    flags,
    positives,
  };
}

function scoreToLevel(score: number): CompanyScore["level"] {
  if (score >= 75) return "trusted";
  if (score >= 50) return "normal";
  if (score >= 30) return "suspicious";
  return "risky";
}
