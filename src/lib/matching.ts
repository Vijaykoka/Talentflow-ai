export function parseSkills(skills: string | string[]): string[] {
  if (Array.isArray(skills)) return skills;
  try {
    return JSON.parse(skills);
  } catch {
    return [];
  }
}

export function calculateMatchScore(
  candidateSkills: string | string[],
  requiredSkills: string | string[],
  experienceYears: number,
  requiredExp: number,
  expectedCtc: number,
  rateMin: number,
  rateMax: number
): { score: number; reasoning: string } {
  const cSkills = parseSkills(candidateSkills);
  const rSkills = parseSkills(requiredSkills);
  const candidateSkillSet = new Set(cSkills.map((s) => s.toLowerCase()));
  const requiredSkillSet = new Set(rSkills.map((s) => s.toLowerCase()));

  const skillOverlap = [...candidateSkillSet].filter((s) => requiredSkillSet.has(s));
  const skillMatch = requiredSkillSet.size > 0
    ? skillOverlap.length / requiredSkillSet.size
    : 0;

  const expFit = Math.max(0, Math.min(1, 1 - Math.abs(experienceYears - requiredExp) / Math.max(requiredExp, 1)));

  let rateFit = 1.0;
  if (expectedCtc < rateMin || expectedCtc > rateMax) {
    const deviation = Math.min(
      Math.abs(expectedCtc - rateMin),
      Math.abs(expectedCtc - rateMax)
    );
    rateFit = Math.max(0, 1 - (deviation / rateMin));
  }

  const score = (skillMatch * 0.5 + expFit * 0.3 + rateFit * 0.2) * 100;

  let reasoning = "";
  if (score >= 90) {
    reasoning = `Excellent fit with ${skillOverlap.length}/${rSkills.length} skills matched and ${experienceYears} years of experience.`;
  } else if (score >= 75) {
    reasoning = `Strong fit with good skill overlap (${skillOverlap.length}/${rSkills.length}) and relevant experience.`;
  } else if (score >= 60) {
    reasoning = `Moderate fit - candidate may need upskilling in ${[...requiredSkillSet].filter(s => !candidateSkillSet.has(s)).join(", ") || "some areas"}.`;
  } else {
    reasoning = "Weak fit - significant gaps in required skills or experience.";
  }

  return { score: Math.round(score * 100) / 100, reasoning };
}

export function calculateMarginForecast(
  billRate: number,
  payRate: number,
  hiringCost: number,
  isHourly: boolean = false,
  workingHours: number = 160
): { monthlyMargin: number; projectedMargin12m: number; breakEvenMonths: number } {
  const monthlyBill = isHourly ? billRate * workingHours : billRate;
  const monthlyPay = isHourly ? payRate * workingHours : payRate;
  const monthlyHiringCostAmortized = hiringCost / 12;
  
  const monthlyMargin = monthlyBill - (monthlyPay + monthlyHiringCostAmortized);
  const projectedMargin12m = monthlyMargin * 12;
  const breakEvenMonths = monthlyMargin > 0 ? hiringCost / monthlyMargin : Infinity;

  return {
    monthlyMargin: Math.round(monthlyMargin * 100) / 100,
    projectedMargin12m: Math.round(projectedMargin12m * 100) / 100,
    breakEvenMonths: Math.round(breakEvenMonths * 100) / 100,
  };
}