export type OpportunityType = "Competition" | "Hackathon" | "Internship";
export type OpportunityStatus = "open" | "closing-soon" | "closed" | "check-site";

export interface Opportunity {
  id: string;
  title: string;
  organiser: string;
  type: OpportunityType;
  prize: string;
  dateLabel: string;
  closesAt: string | null; // ISO date with Lagos offset, null = unknown
  eligibility?: string;
  blurb: string;
  applyUrl: string | null;
  applyNote?: string;
}

export const opportunities: Opportunity[] = [
  {
    id: "talent-nation-ai-rebuild",
    title: "Talent Nation AI Rebuild Challenge",
    organiser: "Talent Nation",
    type: "Competition",
    prize: "₦300k, ₦200k, ₦100k",
    dateLabel: "21 Oct",
    closesAt: "2026-10-21T23:59:00+01:00",
    blurb: "AI rebuild challenge. The top three win ₦300k, ₦200k and ₦100k.",
    applyUrl: "https://bit.ly/TalentNation-AI-Rebuild",
  },
  {
    id: "access-youth-techforge",
    title: "Access Youth TechForge",
    organiser: "Access",
    type: "Competition",
    prize: "₦10m prize pool",
    dateLabel: "Deadline 30 Oct",
    closesAt: "2026-10-30T23:59:00+01:00",
    blurb: "A tech challenge with a ₦10m prize pool.",
    applyUrl: "https://africafintechfoundry.ng/access-forge",
  },
  {
    id: "isa-next-gen-automation",
    title: "ISA Next-Gen Automation Challenge",
    organiser: "ISA",
    type: "Competition",
    prize: "₦2m + internship; ₦1m + internship",
    dateLabel: "See official announcement",
    closesAt: null,
    eligibility: "Nigerian university undergraduates",
    blurb: "Automation challenge for undergraduates. Winners get cash plus an internship.",
    applyUrl: null,
    applyNote: "Check ISA's official announcement for registration details.",
  },
  {
    id: "smedan-msme-pitch",
    title: "SMEDAN MSME Pitch Competition",
    organiser: "SMEDAN",
    type: "Competition",
    prize: "₦15m, ₦10m, ₦5m",
    dateLabel: "Deadline 22 Oct, 5 PM",
    closesAt: "2026-10-22T17:00:00+01:00",
    blurb: "Pitch competition for MSMEs. The top three win ₦15m, ₦10m and ₦5m.",
    applyUrl: "https://conference.smedan.gov.ng/pitch",
  },
  {
    id: "wale-lab-nextgen-ai",
    title: "Wale Lab NextGen AI Hackathon",
    organiser: "Wale Lab",
    type: "Hackathon",
    prize: "₦300k prize pool",
    dateLabel: "7 to 12 Nov",
    closesAt: "2026-11-12T23:59:00+01:00",
    blurb: "A five-day AI hackathon with a ₦300k prize pool.",
    applyUrl: "https://lnkd.in/edtXWmeu",
  },
  {
    id: "build-nigeria-hardware",
    title: "Build Nigeria Hardware Challenge",
    organiser: "Build Nigeria",
    type: "Competition",
    prize: "3D printer worth ₦950k (1st place)",
    dateLabel: "Deadline 18 Oct",
    closesAt: "2026-10-18T23:59:00+01:00",
    blurb: "Hardware challenge. First place wins a 3D printer worth ₦950k.",
    applyUrl: "https://forge.microscale.net/build-nigeria",
  },
];

export function getStatus(o: Opportunity, now: Date = new Date()): OpportunityStatus {
  if (!o.closesAt) return "check-site";
  const msLeft = new Date(o.closesAt).getTime() - now.getTime();
  if (msLeft < 0) return "closed";
  if (msLeft <= 3 * 24 * 60 * 60 * 1000) return "closing-soon";
  return "open";
}

const rank: Record<OpportunityStatus, number> = {
  "closing-soon": 0,
  open: 1,
  "check-site": 2,
  closed: 3,
};

export function sortOpportunities(list: Opportunity[], now: Date = new Date()): Opportunity[] {
  return [...list].sort((a, b) => {
    const r = rank[getStatus(a, now)] - rank[getStatus(b, now)];
    return r !== 0 ? r : (a.closesAt ?? "").localeCompare(b.closesAt ?? "");
  });
}