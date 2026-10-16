/** Types for Scholarship Finder Module. */

export type EducationLevel =
  | "all"
  | "class_9_10"
  | "class_11_12"
  | "ug_engineering"
  | "ug_medical"
  | "general_ug";

export interface Scholarship {
  id: string;
  name: string;
  shortName: string;
  offeredBy: string;
  portalName: string;
  educationLevel: EducationLevel;
  stateScope: string;
  targetBeneficiary: string;
  maxFamilyIncomePerAnnum?: number;
  incomeLimitText?: string;
  benefitAmount: string;
  eligibilityCriteria: string[];
  documentsRequired: string[];
  applicationDeadline: string;
  status: "open" | "upcoming" | "closed";
  officialUrl: string;
  isVerified: boolean;
  verifiedAt: string;
  tags: string[];
}
