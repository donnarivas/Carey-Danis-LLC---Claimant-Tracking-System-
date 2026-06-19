export type CategoryType =
  | "School Counselor"
  | "Therapist"
  | "Parent Organization"
  | "Church"
  | "Youth Nonprofit"
  | "Community Center";

export type StatusType =
  | "New"
  | "Attempted Contact"
  | "In Discussion"
  | "Connected"
  | "Follow-up Needed"
  | "Not Interested";

export interface Contact {
  id: string;
  organization: string;
  contactName: string;
  title: string;
  email: string;
  phoneNumber: string;
  category: CategoryType;
  status: StatusType;
  lastContactDate: string; // YYYY-MM-DD or empty
  followUp: string; // Follow-up action notes or date details
}

export interface CRMStats {
  total: number;
  byCategory: Record<CategoryType, number>;
  byStatus: Record<StatusType, number>;
  followUpsCount: number;
}
