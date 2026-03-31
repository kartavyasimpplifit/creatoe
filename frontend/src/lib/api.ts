const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface CreatorMatch {
  rank: number;
  match_score: number;
  disqualified: boolean;
  dimensions: {
    brand_price_fit: { score: number; reasons: string[]; weight: string };
    feature_relevance: { score: number; reasons: string[]; weight: string };
    creator_quality: { score: number; reasons: string[]; weight: string };
  };
  match_reasons: string[];
  concerns: string[];
  fraud_flags: string[];
  brand_evidence: {
    video_id: string;
    title: string;
    views: number;
    engagement: number;
    published_at: string;
    thumbnail: string;
    brand: string;
    model: string;
  }[];
  predicted_views: number;
  predicted_cpv: number;
  cost_estimate: { min: number; max: number };
  format_mix: string;
  phone_video_count: number;
  last_phone_date: string;
  creator: {
    id: number;
    channel_id: string;
    name: string;
    thumbnail_url: string;
    subscriber_count: number;
    tier: string;
    primary_language: string;
    engagement_rate: number;
    custom_url: string;
    country: string;
  };
}

export interface ProductData {
  url: string;
  platform: string;
  product_name: string;
  brand: string;
  model: string;
  price: number;
  price_band: string;
  category: string;
  key_features: string[];
  hero_feature: string;
  image_url: string;
  rating: number;
}

export interface DemandIntelligence {
  current_brand_videos: number;
  top_competitor: { brand: string; videos: number };
  brand_video_counts: Record<string, number>;
  flipkart_associated: number;
  amazon_associated: number;
  language_coverage: Record<string, number>;
  language_gaps: {
    language: string;
    creator_count: number;
    states: string;
    market_population: number;
    opportunity: string;
  }[];
  activation_scenario: {
    creators_to_activate: number;
    estimated_budget_min: number;
    estimated_budget_max: number;
    estimated_reach: number;
    estimated_cpv: number;
  };
  competitive_gap?: {
    message: string;
    creators_needed: number;
    estimated_cost_to_close: number;
  };
}

export interface AnalyzeResponse {
  product: ProductData;
  total_matched: number;
  total_disqualified: number;
  creators: CreatorMatch[];
  demand_intelligence: DemandIntelligence;
}

export interface StatsResponse {
  total_creators: number;
  phone_creators: number;
  total_videos: number;
  analyzed_videos: number;
  tiers: Record<string, number>;
  languages: Record<string, number>;
}

export interface CampaignData {
  creators: {
    id: number;
    name: string;
    thumbnail_url: string;
    subscriber_count: number;
    tier: string;
    primary_language: string;
    cost_min: number;
    cost_max: number;
    predicted_views: number;
    cpv: number;
    youtube_url: string;
    match_score: number;
  }[];
  summary: {
    creator_count: number;
    budget_min: number;
    budget_max: number;
    estimated_reach: number;
    avg_cpv: number;
    language_mix: Record<string, number>;
  };
  product: ProductData | null;
}

export async function fetchStats(): Promise<StatsResponse> {
  const res = await fetch(`${API_BASE}/api/stats`);
  return res.json();
}

export async function analyzeProduct(url: string): Promise<AnalyzeResponse> {
  const res = await fetch(`${API_BASE}/api/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });
  if (!res.ok) throw new Error("Analysis failed");
  return res.json();
}

export async function fetchCreatorDetail(id: number, productUrl?: string) {
  const params = productUrl ? `?product_url=${encodeURIComponent(productUrl)}` : "";
  const res = await fetch(`${API_BASE}/api/creator/${id}${params}`);
  return res.json();
}

export async function buildCampaign(creatorIds: number[], productUrl?: string): Promise<CampaignData> {
  const res = await fetch(`${API_BASE}/api/campaign/build`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ creator_ids: creatorIds, product_url: productUrl || "" }),
  });
  return res.json();
}

export async function exportCampaignCSV(creatorIds: number[], productUrl?: string) {
  const res = await fetch(`${API_BASE}/api/campaign/export`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ creator_ids: creatorIds, product_url: productUrl || "" }),
  });
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "campaign_plan.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export async function compareCreators(ids: number[], productUrl?: string) {
  const res = await fetch(`${API_BASE}/api/compare`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ creator_ids: ids, product_url: productUrl || "" }),
  });
  return res.json();
}

export async function draftOutreachEmail(creatorId: number, productUrl?: string) {
  const params = productUrl ? `?product_url=${encodeURIComponent(productUrl)}` : "";
  const res = await fetch(`${API_BASE}/api/creator/${creatorId}/outreach${params}`);
  return res.json();
}

export function formatINR(n: number): string {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(0)}K`;
  return `₹${n}`;
}

export function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
  return n.toString();
}
