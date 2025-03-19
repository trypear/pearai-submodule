export interface UsageDetails {
  percent_credit_used: number;
  remaining_topup_credits: number | null;
  pay_as_you_go_credits: number;
  ttl: number;
}

export interface AccountDetails {
  email: string;
  first_name: string;
  last_name: string;
  profile_picture_url: string;
  plan_type: string;
  plan_period_start: number;
  plan_period_end: number;
  is_subscription_active: boolean;
  requests_used: number;
}

export interface Auth {
  accessToken?: string;
  refreshToken?: string;
} 