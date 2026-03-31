"use client";

import { useState, useEffect, useCallback } from "react";
import {
  analyzeProduct, fetchStats, buildCampaign, exportCampaignCSV, aiSearch,
  type AnalyzeResponse, type StatsResponse, type CampaignData, type SearchResult,
} from "@/lib/api";
import { SearchHero } from "@/components/search-hero";
import { LoadingSequence } from "@/components/loading-sequence";
import { ProductCard } from "@/components/product-card";
import { DemandIntelCard } from "@/components/demand-intel-card";
import { CreatorGrid } from "@/components/creator-grid";
import { CreatorPanel } from "@/components/creator-panel";
import { CampaignBar } from "@/components/campaign-bar";
import { CampaignModal } from "@/components/campaign-modal";
import { VideoGrid } from "@/components/video-grid";
import { TopBar } from "@/components/top-bar";

type AppState = "idle" | "loading" | "product-results" | "search-results";

export default function Home() {
  const [state, setState] = useState<AppState>("idle");
  const [productUrl, setProductUrl] = useState("");
  const [data, setData] = useState<AnalyzeResponse | null>(null);
  const [searchData, setSearchData] = useState<SearchResult | null>(null);
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [selectedCreator, setSelectedCreator] = useState<number | null>(null);
  const [campaignIds, setCampaignIds] = useState<number[]>([]);
  const [showCampaign, setShowCampaign] = useState(false);
  const [campaignData, setCampaignData] = useState<CampaignData | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);
  const [filters, setFilters] = useState({ tier: "", language: "", sort: "match_score" });

  useEffect(() => { fetchStats().then(setStats).catch(() => {}); }, []);

  const handleProductSearch = useCallback(async (url: string) => {
    setProductUrl(url);
    setState("loading");
    setLoadingStep(0);
    setCampaignIds([]);
    setSearchData(null);

    const timers = [300, 1200, 2400, 3200, 4000];
    timers.forEach((ms, i) => setTimeout(() => setLoadingStep(i + 1), ms));

    try {
      const result = await analyzeProduct(url);
      setData(result);
      setLoadingStep(6);
      setTimeout(() => setState("product-results"), 600);
    } catch {
      setLoadingStep(-1);
    }
  }, []);

  const handleAISearch = useCallback(async (query: string) => {
    setState("loading");
    setLoadingStep(3);
    setData(null);

    try {
      const result = await aiSearch(query);
      setSearchData(result);
      setTimeout(() => setState("search-results"), 300);
    } catch {
      setLoadingStep(-1);
    }
  }, []);

  const toggleCampaign = useCallback((id: number) => {
    setCampaignIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }, []);

  const handleViewCampaign = useCallback(async () => {
    if (campaignIds.length < 1) return;
    const campaign = await buildCampaign(campaignIds, productUrl);
    setCampaignData(campaign);
    setShowCampaign(true);
  }, [campaignIds, productUrl]);

  const handleReset = () => {
    setState("idle");
    setData(null);
    setSearchData(null);
    setProductUrl("");
    setCampaignIds([]);
    setSelectedCreator(null);
  };

  const filteredCreators = data?.creators.filter(c => {
    if (filters.tier && c.creator.tier !== filters.tier) return false;
    if (filters.language && c.creator.primary_language !== filters.language) return false;
    return true;
  }).sort((a, b) => {
    if (filters.sort === "match_score") return b.match_score - a.match_score;
    if (filters.sort === "subscribers") return b.creator.subscriber_count - a.creator.subscriber_count;
    if (filters.sort === "engagement") return b.creator.engagement_rate - a.creator.engagement_rate;
    if (filters.sort === "cpv") return a.predicted_cpv - b.predicted_cpv;
    return b.match_score - a.match_score;
  }) || [];

  return (
    <div className="min-h-screen">
      <TopBar state={state} stats={stats} onReset={handleReset} />

      {state === "idle" && (
        <SearchHero onProductSearch={handleProductSearch} onAISearch={handleAISearch} stats={stats} />
      )}

      {state === "loading" && (
        <LoadingSequence step={loadingStep} url={productUrl} product={data?.product} />
      )}

      {state === "product-results" && data && (
        <div className="max-w-[1440px] mx-auto px-5 sm:px-8 pt-6 pb-32">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
            <ProductCard product={data.product} totalMatched={data.total_matched} totalDisqualified={data.total_disqualified} />
            <div className="lg:col-span-2">
              <DemandIntelCard intel={data.demand_intelligence} product={data.product} />
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2.5 mb-6">
            <span className="text-[10px] text-[var(--text-dim)] uppercase tracking-[0.15em] mr-1 font-medium">Tier</span>
            {["", "mega", "macro", "mid", "micro"].map(t => (
              <button key={t} onClick={() => setFilters(f => ({ ...f, tier: t }))}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  filters.tier === t
                    ? "bg-[var(--accent)] text-white shadow-[0_0_12px_rgba(129,140,248,0.3)]"
                    : "bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text)] border border-[var(--border)]"
                }`}>
                {t || "All"}
              </button>
            ))}
            <div className="w-px h-5 bg-[var(--border)] mx-1" />
            <span className="text-[10px] text-[var(--text-dim)] uppercase tracking-[0.15em] mr-1 font-medium">Lang</span>
            {data.demand_intelligence.language_coverage &&
              Object.entries(data.demand_intelligence.language_coverage)
                .sort(([, a], [, b]) => b - a).slice(0, 6)
                .map(([lang, count]) => (
                  <button key={lang} onClick={() => setFilters(f => ({ ...f, language: f.language === lang ? "" : lang }))}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      filters.language === lang
                        ? "bg-[var(--accent)] text-white"
                        : "bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text)] border border-[var(--border)]"
                    }`}>
                    {lang.charAt(0).toUpperCase() + lang.slice(1)}
                    <span className="ml-1 opacity-50">{count}</span>
                  </button>
                ))}
            <div className="flex-1" />
            <select value={filters.sort} onChange={e => setFilters(f => ({ ...f, sort: e.target.value }))}
              className="bg-[var(--bg-card)] border border-[var(--border)] rounded-full px-4 py-1.5 text-xs text-[var(--text)] outline-none">
              <option value="match_score">Best Match</option>
              <option value="subscribers">Subscribers</option>
              <option value="engagement">Engagement</option>
              <option value="cpv">Best CPV</option>
            </select>
            <span className="text-xs text-[var(--text-dim)]">{filteredCreators.length} creators</span>
          </div>

          <CreatorGrid creators={filteredCreators} onSelect={setSelectedCreator}
            campaignIds={campaignIds} onToggleCampaign={toggleCampaign} productBrand={data.product.brand} />
        </div>
      )}

      {state === "search-results" && searchData && (
        <div className="max-w-[1440px] mx-auto px-5 sm:px-8 pt-6 pb-32">
          <div className="mb-6">
            <div className="text-sm text-[var(--text-muted)] mb-1">Search results for</div>
            <div className="text-lg font-semibold text-[var(--text)]">&ldquo;{searchData.query.raw_query as string}&rdquo;</div>
            <div className="text-xs text-[var(--text-dim)] mt-1">
              {searchData.total_results.toLocaleString()} results found · Showing {searchData.free_results.length} free
            </div>
          </div>

          {searchData.mode === "videos" ? (
            <VideoGrid freeVideos={searchData.free_results} lockedVideos={searchData.locked_results}
              totalResults={searchData.total_results} upgradeMessage={searchData.upgrade_message} />
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {searchData.free_results.map((c, i) => (
                  <div key={(c.id as number) || i}
                    className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-5 card-hover cursor-pointer animate-fade-in"
                    style={{ animationDelay: `${i * 60}ms` }}
                    onClick={() => setSelectedCreator(c.id as number)}>
                    <div className="flex items-center gap-3 mb-4">
                      <img src={(c.thumbnail_url as string) || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.name as string)}&background=6366f1&color=fff&size=44`}
                        className="w-11 h-11 rounded-full object-cover bg-[var(--bg-elevated)]" alt="" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-[var(--text)] truncate">{c.name as string}</div>
                        <div className="text-xs text-[var(--text-muted)]">
                          {(c.subscriber_count as number).toLocaleString()} subs · {c.tier as string} · {c.primary_language as string}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[var(--text-dim)]">
                      <span>{c.phone_video_count as number} phone videos</span>
                      <span>·</span>
                      <span>{(c.engagement_rate as number).toFixed(1)}% eng</span>
                    </div>
                  </div>
                ))}
                {searchData.locked_results.map((c, i) => (
                  <div key={`locked-${i}`}
                    className="relative bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-5 overflow-hidden animate-fade-in"
                    style={{ animationDelay: `${(searchData.free_results.length + i) * 60}ms` }}>
                    <div className="blur-[6px] pointer-events-none">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-11 h-11 rounded-full bg-[var(--bg-elevated)]" />
                        <div className="flex-1">
                          <div className="text-sm font-semibold text-[var(--text)]">{c.name as string}</div>
                          <div className="text-xs text-[var(--text-muted)]">{(c.subscriber_count as number).toLocaleString()} subs</div>
                        </div>
                      </div>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center bg-[var(--bg)]/40">
                      <div className="text-center">
                        <div className="w-8 h-8 rounded-full bg-[var(--bg-elevated)] border border-[var(--border)] flex items-center justify-center mx-auto mb-2">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--text-dim)]">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                          </svg>
                        </div>
                        <div className="text-[10px] text-[var(--text-dim)]">Upgrade to unlock</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {searchData.upgrade_message && (
                <div className="mt-8 text-center">
                  <div className="inline-flex items-center gap-2 bg-[var(--accent-dim)] border border-[var(--accent)]/20 rounded-full px-5 py-2.5">
                    <span className="text-xs text-[var(--accent)]">{searchData.upgrade_message}</span>
                    <button className="text-xs font-semibold text-[var(--accent-hover)] hover:underline">Upgrade →</button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {selectedCreator !== null && (
        <CreatorPanel creatorId={selectedCreator} productUrl={productUrl}
          onClose={() => setSelectedCreator(null)} onAddToCampaign={toggleCampaign}
          isInCampaign={campaignIds.includes(selectedCreator)} />
      )}

      {campaignIds.length > 0 && (state === "product-results" || state === "search-results") && (
        <CampaignBar count={campaignIds.length} onView={handleViewCampaign}
          onExport={() => exportCampaignCSV(campaignIds, productUrl)} />
      )}

      {showCampaign && campaignData && (
        <CampaignModal data={campaignData} onClose={() => setShowCampaign(false)} productUrl={productUrl} />
      )}
    </div>
  );
}
