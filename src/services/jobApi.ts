import type { JobItem, QuizState } from "@/types/hrx";
import { hhAreaMap, trudvsemRegionCodeMap } from "./regionMapping";
import { scoreHhVacancy, scoreTrudvsemVacancy } from "./companyScoring";
import {
  findRoleOption,
  restrictionOptions as restrictionData,
  quickExclusionNotKeywords,
  scheduleOptions as scheduleData,
  employmentOptions as employmentData,
  salaryOptions as salaryData,
} from "@/data/quizData";

interface HhVacancy {
  id: string;
  name: string;
  area: { name: string };
  salary: { from: number | null; to: number | null; currency: string; gross: boolean } | null;
  employer: {
    name: string;
    trusted?: boolean;
    logo_urls?: Record<string, string> | null;
    accredited_it_employer?: boolean;
  };
  snippet: { requirement: string | null; responsibility: string | null };
  alternate_url: string;
  schedule: { id: string; name: string } | null;
  work_format?: { id: string; name: string }[];
  has_test?: boolean;
  contacts?: unknown | null;
  description?: string;
  published_at?: string;
  created_at?: string;
}

interface HhResponse {
  found: number;
  items: HhVacancy[];
  pages: number;
  per_page: number;
  page: number;
}

interface TrudvsemVacancy {
  vacancy: {
    id: string;
    "job-name": string;
    duty?: string;
    requirements?: string;
    region?: { name: string; region_code?: string };
    salary_min?: number;
    salary_max?: number;
    salary?: string;
    company?: { name: string; companycode?: string; inn?: string; ogrn?: string; site?: string };
    vac_url?: string;
    schedule?: string;
    employment?: string;
    contact_list?: { contact_type: string; contact_value: string }[];
    creation_date?: string;
    modify_date?: string;
  };
}

interface TrudvsemResponse {
  status: string;
  meta?: { total: number; limit: number };
  results?: {
    vacancies: TrudvsemVacancy[];
  };
}

function buildSearchText(quiz: QuizState): string {
  const keywords: string[] = [];
  for (const roleTitle of quiz.targetRoles.slice(0, 5)) {
    const role = findRoleOption(roleTitle);
    if (role) {
      keywords.push(...role.searchKeywords.slice(0, 2));
    } else {
      keywords.push(roleTitle);
    }
  }
  const unique = [...new Set(keywords)].slice(0, 8);
  return unique.join(" OR ");
}

function buildNotKeywords(quiz: QuizState): string {
  const notParts: string[] = [];

  for (const restriction of quiz.restrictions) {
    const opt = restrictionData.find(r => r.label === restriction);
    if (opt && opt.notKeywords.length > 0) {
      notParts.push(...opt.notKeywords);
    }
  }

  for (const excl of quiz.excludedRoleQuick) {
    const kws = quickExclusionNotKeywords[excl];
    if (kws) {
      notParts.push(...kws);
    }
  }

  if (quiz.excludedRoles.trim()) {
    const phrases = quiz.excludedRoles
      .split(/[,;،\n]+/)
      .map(s => s.trim())
      .filter(s => s.length > 2);
    notParts.push(...phrases);
  }

  const unique = [...new Set(notParts)];
  return unique.map(k => `NOT "${k}"`).join(" ");
}

function matchesExclusions(text: string, quiz: QuizState): boolean {
  const lower = text.toLowerCase();

  for (const restriction of quiz.restrictions) {
    const opt = restrictionData.find(r => r.label === restriction);
    if (opt) {
      for (const kw of opt.notKeywords) {
        if (lower.includes(kw.toLowerCase())) return true;
      }
    }
  }

  for (const excl of quiz.excludedRoleQuick) {
    const kws = quickExclusionNotKeywords[excl];
    if (kws) {
      for (const kw of kws) {
        if (lower.includes(kw.toLowerCase())) return true;
      }
    }
  }

  if (quiz.excludedRoles.trim()) {
    const phrases = quiz.excludedRoles.split(/[,;،\n]+/).map(s => s.trim().toLowerCase()).filter(s => s.length > 2);
    for (const phrase of phrases) {
      if (lower.includes(phrase)) return true;
    }
  }

  return false;
}

function collectHhRoleIds(quiz: QuizState): number[] {
  const ids = new Set<number>();
  for (const roleTitle of quiz.targetRoles) {
    const role = findRoleOption(roleTitle);
    if (role) {
      role.hhRoleIds.forEach(id => ids.add(id));
    }
  }
  return [...ids];
}

function mapExperienceToHh(exp: string): string | null {
  if (exp === "Нет опыта") return "noExperience";
  if (exp === "От 1 до 3 лет") return "between1And3";
  if (exp === "От 3 до 6 лет") return "between3And6";
  if (exp === "Более 6 лет") return "moreThan6";
  return null;
}

function parseSalaryMin(salaryMin: string): number | null {
  const opt = salaryData.find(s => s.label === salaryMin);
  if (opt && opt.value > 0) return opt.value;
  return null;
}

function formatSalary(from: number | null, to: number | null, currency: string): string {
  const cur = currency === "RUR" || currency === "RUB" ? "₽" : currency;
  if (from && to) return `${from.toLocaleString("ru-RU")}–${to.toLocaleString("ru-RU")} ${cur}`;
  if (from) return `от ${from.toLocaleString("ru-RU")} ${cur}`;
  if (to) return `до ${to.toLocaleString("ru-RU")} ${cur}`;
  return "Не указана";
}

function stripHtml(str: string | null): string {
  if (!str) return "";
  return str.replace(/<[^>]*>/g, "").trim();
}

const NON_RUSSIA_LOCATIONS = [
  "беларусь", "белоруссия", "минск", "казахстан", "астана", "алматы",
  "узбекистан", "ташкент", "кыргызстан", "бишкек", "таджикистан",
  "туркменистан", "армения", "ереван", "грузия", "тбилиси",
  "азербайджан", "баку", "молдова", "кишинёв", "кишинев",
  "украина", "киев", "другие регионы",
];

function isRussianLocation(location?: string): boolean {
  if (!location) return true;
  const lower = location.toLowerCase();
  return !NON_RUSSIA_LOCATIONS.some(loc => lower.includes(loc));
}

function isStrictlyRemoteHh(v: HhVacancy): boolean {
  if (v.schedule?.id === "remote") return true;
  if (v.work_format?.some(wf => wf.id === "REMOTE")) return true;
  return false;
}

const REMOTE_SCHEDULE_VALUES = [
  "удаленная работа",
  "удалённая работа",
  "дистанционная работа",
];

function isRemoteTrudvsem(v: TrudvsemVacancy): boolean {
  const schedule = (v.vacancy.schedule || "").toLowerCase().trim();
  if (REMOTE_SCHEDULE_VALUES.some(rs => schedule.includes(rs))) return true;

  const name = (v.vacancy["job-name"] || "").toLowerCase();
  const duty = (v.vacancy.duty || "").toLowerCase();
  const hasRemoteInName = /\b(удал[её]нн|дистанционн|remote)\b/.test(name);
  const hasRemoteInDuty = /\b(удал[её]нн|дистанционн|remote)\b/.test(duty);
  return hasRemoteInName || hasRemoteInDuty;
}

function normalizeHhVacancy(v: HhVacancy): JobItem {
  const salary = v.salary
    ? formatSalary(v.salary.from, v.salary.to, v.salary.currency)
    : "Не указана";

  const description = [
    stripHtml(v.snippet.responsibility),
    stripHtml(v.snippet.requirement),
  ]
    .filter(Boolean)
    .join(". ");

  const companyScore = scoreHhVacancy({
    employer: v.employer,
    salary: v.salary,
    has_test: v.has_test,
    contacts: v.contacts,
    description: v.description,
    snippet: v.snippet,
  });

  let status: JobItem["status"] = "review";
  if (companyScore.level === "risky") status = "not_recommended";
  else if (companyScore.level === "trusted") status = "fit";

  return {
    id: `hh-${v.id}`,
    title: v.name,
    company: v.employer.name,
    salary,
    status,
    description: description || "Описание не указано",
    reason: companyScore.positives.slice(0, 2).join(". "),
    redFlags: companyScore.flags,
    source: "hh.ru",
    url: v.alternate_url,
    schedule: v.schedule?.name || "",
    location: v.area.name,
    companyScore,
    publishedAt: v.published_at || v.created_at || undefined,
  };
}

function normalizeTrudvsemVacancy(item: TrudvsemVacancy): JobItem {
  const v = item.vacancy;
  const salary =
    v.salary_min || v.salary_max
      ? formatSalary(v.salary_min || null, v.salary_max || null, "RUR")
      : v.salary || "Не указана";

  const descParts = [v.duty, v.requirements].filter(Boolean).map(s => stripHtml(s!));

  const companyScore = scoreTrudvsemVacancy({
    company: v.company,
    salary_min: v.salary_min,
    salary_max: v.salary_max,
    duty: v.duty,
    requirements: v.requirements,
    contact_list: v.contact_list,
  });

  let status: JobItem["status"] = "review";
  if (companyScore.level === "risky") status = "not_recommended";
  else if (companyScore.level === "trusted") status = "fit";

  return {
    id: `tv-${v.id}`,
    title: v["job-name"],
    company: v.company?.name || "Не указан",
    salary,
    status,
    description: descParts.join(". ") || "Описание не указано",
    reason: companyScore.positives.slice(0, 2).join(". "),
    redFlags: companyScore.flags,
    source: "trudvsem.ru",
    url: v.vac_url || `https://trudvsem.ru/vacancy/card/${v.company?.companycode || ""}/${v.id}`,
    schedule: [v.schedule, v.employment].filter(Boolean).join(", "),
    location: v.region?.name || "",
    companyScore,
    publishedAt: v.modify_date || v.creation_date || undefined,
  };
}

async function fetchWithRetry(url: string, retries = 2, delay = 1500): Promise<Response> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url);
      const ct = res.headers.get("content-type") || "";
      if (res.ok && ct.includes("json")) return res;
      if (res.ok && !ct.includes("json")) {
        console.warn(`[fetch] attempt ${attempt + 1}: unexpected content-type "${ct}", retrying...`);
        if (attempt < retries) {
          await new Promise(r => setTimeout(r, delay));
          continue;
        }
        throw new Error(`Сервер вернул неожиданный формат ответа (${ct || "пустой"})`);
      }
      if (!res.ok) {
        console.warn(`[fetch] attempt ${attempt + 1}: status ${res.status}, retrying...`);
        if (attempt < retries) {
          await new Promise(r => setTimeout(r, delay));
          continue;
        }
        throw new Error(`API error: ${res.status}`);
      }
      return res;
    } catch (err) {
      if (attempt < retries && err instanceof TypeError) {
        console.warn(`[fetch] attempt ${attempt + 1}: network error, retrying...`);
        await new Promise(r => setTimeout(r, delay));
        continue;
      }
      throw err;
    }
  }
  throw new Error("Не удалось получить ответ после нескольких попыток");
}

async function doHhSearch(params: URLSearchParams): Promise<{ data: HhResponse; url: string }> {
  const url = `/api/hh/vacancies?${params.toString()}`;
  console.log("[HH] request:", url);
  const res = await fetchWithRetry(url);
  const data: HhResponse = await res.json();
  console.log("[HH] found:", data.found, "items:", data.items?.length);
  return { data, url };
}

export async function searchHhVacancies(quiz: QuizState): Promise<JobItem[]> {
  const searchText = buildSearchText(quiz);
  if (!searchText) return [];

  const notText = buildNotKeywords(quiz);
  const fullText = notText ? `${searchText} ${notText}` : searchText;

  const baseParams = new URLSearchParams({
    text: fullText,
    per_page: "100",
    page: "0",
    schedule: "remote",
  });

  const roleIds = collectHhRoleIds(quiz);
  roleIds.forEach(id => baseParams.append("professional_role", String(id)));

  if (quiz.region) {
    const areaId = hhAreaMap[quiz.region.id];
    if (areaId) baseParams.set("area", String(areaId));
  } else {
    baseParams.set("area", "113");
  }

  const hhExp = mapExperienceToHh(quiz.totalExperience);
  if (hhExp) baseParams.set("experience", hhExp);

  const salaryMin = parseSalaryMin(quiz.salaryMin);
  if (salaryMin) {
    baseParams.set("salary", String(salaryMin));
    baseParams.set("currency", "RUR");
    baseParams.set("only_with_salary", "true");
  }

  for (const emp of quiz.employmentTypes) {
    const opt = employmentData.find(e => e.label === emp);
    if (opt) baseParams.append("employment", opt.hhValue);
  }

  for (const sch of quiz.schedules) {
    const opt = scheduleData.find(s => s.label === sch);
    if (opt) baseParams.append("work_schedule_by_days", opt.hhValue);
  }

  if (quiz.acceptHandicapped) {
    baseParams.append("label", "accept_handicapped");
  }

  let { data } = await doHhSearch(baseParams);
  let items = (data.items || []).filter(isStrictlyRemoteHh);
  let successParams = baseParams;
  let successPages = data.pages;

  if (items.length === 0 && (baseParams.has("experience") || baseParams.has("salary"))) {
    console.log("[HH] strict search returned 0, trying without experience/salary...");
    const relaxedParams = new URLSearchParams({ text: fullText, per_page: "100", page: "0", schedule: "remote", area: "113" });
    roleIds.forEach(id => relaxedParams.append("professional_role", String(id)));
    for (const emp of quiz.employmentTypes) {
      const opt = employmentData.find(e => e.label === emp);
      if (opt) relaxedParams.append("employment", opt.hhValue);
    }
    for (const sch of quiz.schedules) {
      const opt = scheduleData.find(s => s.label === sch);
      if (opt) relaxedParams.append("work_schedule_by_days", opt.hhValue);
    }
    if (quiz.acceptHandicapped) {
      relaxedParams.append("label", "accept_handicapped");
    }
    const relaxed = await doHhSearch(relaxedParams);
    items = (relaxed.data.items || []).filter(isStrictlyRemoteHh);
    successParams = relaxedParams;
    successPages = relaxed.data.pages;
    console.log("[HH] relaxed search after remote filter:", items.length);
  } else {
    console.log("[HH] after remote filter:", items.length);
  }

  let allItems = [...items];
  const maxPages = Math.min(successPages, 20);
  for (let page = 1; page < maxPages; page++) {
    const nextParams = new URLSearchParams(successParams);
    nextParams.set("page", String(page));
    try {
      const nextPage = await doHhSearch(nextParams);
      const nextItems = (nextPage.data.items || []).filter(isStrictlyRemoteHh);
      if (nextItems.length === 0) break;
      allItems.push(...nextItems);
      console.log(`[HH] page ${page + 1} added: ${nextItems.length}, total: ${allItems.length}`);
    } catch (e) {
      console.warn(`[HH] page ${page + 1} failed, stopping pagination`);
      break;
    }
  }

  const normalized = allItems.map(normalizeHhVacancy).filter(j => isRussianLocation(j.location));
  return normalized.filter(j => !matchesExclusions(`${j.title} ${j.description}`, quiz));
}

async function doTvSearch(url: string, params: URLSearchParams): Promise<{ data: TrudvsemResponse; fullUrl: string }> {
  const fullUrl = `${url}?${params.toString()}`;
  console.log("[TV] request:", fullUrl);
  const res = await fetchWithRetry(fullUrl, 1, 1000);
  const data: TrudvsemResponse = await res.json();
  console.log("[TV] total:", data.meta?.total, "vacancies:", data.results?.vacancies?.length);
  return { data, fullUrl };
}

export async function searchTrudvsemVacancies(quiz: QuizState): Promise<JobItem[]> {
  const searchText = buildSearchText(quiz);
  if (!searchText) return [];

  const fullSearchText = `${searchText} удалённая`;
  const params = new URLSearchParams({ text: fullSearchText, offset: "0", limit: "100" });

  let url = "/api/trudvsem/vacancies";
  const hasRegion = !!quiz.region;
  if (hasRegion) {
    const code = trudvsemRegionCodeMap[quiz.region!.id];
    if (code) url = `/api/trudvsem/vacancies/region/${code}`;
  }

  let successUrl = url;
  let { data } = await doTvSearch(url, params);
  let filtered = (data.results?.vacancies || []).filter(isRemoteTrudvsem);

  if (filtered.length === 0 && hasRegion) {
    console.log("[TV] regional search returned 0, trying without region...");
    successUrl = "/api/trudvsem/vacancies";
    const relaxed = await doTvSearch(successUrl, params);
    data = relaxed.data;
    filtered = (data.results?.vacancies || []).filter(isRemoteTrudvsem);
    console.log("[TV] relaxed search after remote filter:", filtered.length);
  } else {
    console.log("[TV] after remote filter:", filtered.length);
  }

  const totalAvailable = data.meta?.total || 0;
  if (totalAvailable > 100 && filtered.length >= 50) {
    const maxOffset = Math.min(totalAvailable, 1000);
    for (let offset = 100; offset < maxOffset; offset += 100) {
      const nextParams = new URLSearchParams({ text: fullSearchText, offset: String(offset), limit: "100" });
      try {
        const nextPage = await doTvSearch(successUrl, nextParams);
        const nextFiltered = (nextPage.data.results?.vacancies || []).filter(isRemoteTrudvsem);
        if (nextFiltered.length === 0) break;
        filtered.push(...nextFiltered);
        console.log(`[TV] offset ${offset} added: ${nextFiltered.length}, total: ${filtered.length}`);
      } catch (e) {
        console.warn(`[TV] offset ${offset} failed, stopping pagination`);
        break;
      }
    }
  }

  const normalized = filtered.map(normalizeTrudvsemVacancy).filter(j => isRussianLocation(j.location));
  return normalized.filter(j => !matchesExclusions(`${j.title} ${j.description}`, quiz));
}

interface SearchResult {
  jobs: JobItem[];
  errors: string[];
}

export async function searchAllVacancies(quiz: QuizState): Promise<JobItem[]> {
  const results: SearchResult = { jobs: [], errors: [] };

  const [hhResult, tvResult] = await Promise.allSettled([
    searchHhVacancies(quiz),
    searchTrudvsemVacancies(quiz),
  ]);

  if (hhResult.status === "fulfilled") {
    results.jobs.push(...hhResult.value);
  } else {
    console.error("[Search] hh.ru failed:", hhResult.reason);
    results.errors.push("hh.ru");
  }

  if (tvResult.status === "fulfilled") {
    results.jobs.push(...tvResult.value);
  } else {
    console.error("[Search] trudvsem.ru failed:", tvResult.reason);
    results.errors.push("trudvsem.ru");
  }

  if (results.errors.length > 0) {
    console.warn("[Search] errors from:", results.errors.join(", "), "| jobs found:", results.jobs.length);
  }

  if (results.jobs.length === 0 && results.errors.length > 0) {
    throw new Error(`Не удалось загрузить вакансии с ${results.errors.join(" и ")}. Возможно, сервисы временно недоступны — попробуйте через минуту.`);
  }

  results.jobs.sort((a, b) => {
    const aRisky = a.companyScore?.level === "risky" ? 1 : 0;
    const bRisky = b.companyScore?.level === "risky" ? 1 : 0;
    if (aRisky !== bRisky) return aRisky - bRisky;
    return 0;
  });

  return results.jobs;
}
