"use client";

import { useState, useEffect, useCallback } from "react";
import {
  analyzeProduct, fetchStats, buildCampaign, exportCampaignCSV, aiSearch,
  type AnalyzeResponse, type StatsResponse, type CampaignData, type SearchResult,
} from "@/lib/api";
import { Sidebar } from "@/components/sidebar";
import { SearchHero } from "@/components/search-hero";
import { LoadingSequence } from "@/components/loading-sequence";
import { ProductCard } from "@/components/product-card";
import { DemandIntelCard } from "@/components/demand-intel-card";
import { CreatorGrid } from "@/components/creator-grid";
import { CreatorPanel } from "@/components/creator-panel";
import { CampaignBar } from "@/components/campaign-bar";
import { CampaignModal } from "@/components/campaign-modal";
import { VideoGrid } from "@/components/video-grid";
import { Lock } from "lucide-react";

type AppState = "idle" | "loading" | "product-results" | "search-results";
type NavPage = "search" | "match" | "intel" | "integrations" | "pricing";

export default function Home() {
  const [state, setState] = useState<AppState>("idle");
  const [navPage, setNavPage] = useState<NavPage>("search");
  const [productUrl, setProductUrl] = useState("");
  const [data, setData] = useState<AnalyzeResponse | null>(null);
  const [searchData, setSearchData] = useState<SearchResult | null>(null);
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [selectedCreator, setSelectedCreator] = useState<number | null>(null);
  const [campaignIds, setCampaignIds] = useState<number[]>([]);
  const [showCampaign, setShowCampaign] = useState(false);
  const [campaignData, setCampaignData] = useState<CampaignData | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [credits, setCredits] = useState(10000);
  const [filters, setFilters] = useState({ tier: "", language: "", sort: "match_score" });

  useEffect(() => { fetchStats().then(setStats).catch(() => {}); }, []);

  const useCredits = (amount: number) => {
    setCredits(prev => Math.max(0, prev - amount));
  };

  const handleProductSearch = useCallback(async (url: string) => {
    setProductUrl(url);
    setState("loading");
    setLoadingStep(0);
    setCampaignIds([]);
    setSearchData(null);
    useCredits(15);

    const timers = [300, 1200, 2400, 3200, 4000];
    timers.forEach((ms, i) => setTimeout(() => setLoadingStep(i + 1), ms));

    try {
      const result = await analyzeProduct(url);
      setData(result);
      setLoadingStep(6);
      setTimeout(() => setState("product-results"), 600);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Analysis failed");
      setLoadingStep(-1);
      setTimeout(() => setState("idle"), 5000);
    }
  }, []);

  const handleAISearch = useCallback(async (query: string, mode?: string) => {
    setState("loading");
    setLoadingStep(3);
    setData(null);
    useCredits(5);

    try {
      const result = await aiSearch(query, mode);
      setSearchData(result);
      setTimeout(() => setState("search-results"), 300);
    } catch {
      setLoadingStep(-1);
      setTimeout(() => setState("idle"), 3000);
    }
  }, []);

  const toggleCampaign = useCallback((id: number) => {
    setCampaignIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }, []);

  const handleViewCampaign = useCallback(async () => {
    if (campaignIds.length < 1) return;
    try {
      useCredits(25);
      const campaign = await buildCampaign(campaignIds, productUrl);
      setCampaignData(campaign);
      setShowCampaign(true);
    } catch {
      console.error("Campaign build failed");
    }
  }, [campaignIds, productUrl]);

  const handleReset = () => {
    setState("idle");
    setData(null);
    setSearchData(null);
    setProductUrl("");
    setCampaignIds([]);
    setSelectedCreator(null);
  };

  const handleNav = (id: string) => {
    if (id === "search" || id === "match") {
      handleReset();
      setNavPage(id as NavPage);
    } else if (id === "integrations") {
      window.location.href = "/integrations";
    } else if (id === "pricing") {
      window.location.href = "/pricing";
    } else {
      setNavPage(id as NavPage);
    }
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
    <div className="min-h-screen flex">
      <Sidebar active={navPage} onNavigate={handleNav} credits={credits} />

      <main className="flex-1 ml-[56px]">
        {state === "idle" && (
          <SearchHero onProductSearch={handleProductSearch} onAISearch={handleAISearch} stats={stats} />
        )}

        {state === "loading" && (
          <LoadingSequence step={loadingStep} url={productUrl} product={data?.product} errorMessage={errorMessage} />
        )}

        {state === "product-results" && data && (
          <div className="max-w-[1400px] mx-auto px-6 pt-6 pb-32 animate-fade-in">
            {/* Product + Demand Intel */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
              <ProductCard product={data.product} totalMatched={data.total_matched} totalDisqualified={data.total_disqualified} />
              <div className="lg:col-span-2">
                <DemandIntelCard intel={data.demand_intelligence} product={data.product} />
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-[0.2em] font-semibold mr-1">Tier</span>
              {["", "mega", "macro", "mid", "micro"].map(t => (
                <button key={t} onClick={() => setFilters(f => ({ ...f, tier: t }))}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                    filters.tier === t
                      ? "bg-[var(--accent)] text-white"
                      : "bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text)] border border-[var(--border)]"
                  }`}>
                  {t || "All"}
                </button>
              ))}

              <div className="w-px h-5 bg-[var(--border)] mx-2" />

              <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-[0.2em] font-semibold mr-1">Lang</span>
              {data.demand_intelligence.language_coverage && Object.entries(data.demand_intelligence.language_coverage)
                .sort(([, a], [, b]) => b - a).slice(0, 5)
                .map(([lang, count]) => (
                  <button key={lang} onClick={() => setFilters(f => ({ ...f, language: f.language === lang ? "" : lang }))}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                      filters.language === lang
                        ? "bg-[var(--accent)] text-white"
                        : "bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text)] border border-[var(--border)]"
                    }`}>
                    {lang.charAt(0).toUpperCase() + lang.slice(1)} <span className="opacity-50 ml-0.5">{count}</span>
                  </button>
                ))}

              <div className="flex-1" />

              <select value={filters.sort} onChange={e => setFilters(f => ({ ...f, sort: e.target.value }))}
                className="bg-[var(--bg-card)] border border-[var(--border)] rounded-full px-4 py-1.5 text-xs text-[var(--text)] outline-none appearance-none cursor-pointer">
                <option value="match_score">Best Match</option>
                <option value="subscribers">Subscribers</option>
                <option value="engagement">Engagement</option>
                <option value="cpv">Best CPV</option>
              </select>
            </div>

            <CreatorGrid creators={filteredCreators} onSelect={(id) => { setSelectedCreator(id); useCredits(5); }}
              campaignIds={campaignIds} onToggleCampaign={toggleCampaign} productBrand={data.product.brand} />
          </div>
        )}

        {state === "search-results" && searchData && (
          <div className="max-w-[1400px] mx-auto px-6 pt-6 pb-32 animate-fade-in">
            <div className="mb-6">
              <div className="text-xs text-[var(--text-muted)] mb-1">Results for</div>
              <div className="text-lg font-bold text-[var(--text)]">&ldquo;{searchData.query.raw_query as string}&rdquo;</div>
              <div className="text-xs text-[var(--text-muted)] mt-1">
                {searchData.total_results.toLocaleString()} results · {searchData.free_results.length} shown free
              </div>
            </div>

            {searchData.mode === "videos" ? (
              <VideoGrid freeVideos={searchData.free_results} lockedVideos={searchData.locked_results}
                totalResults={searchData.total_results} upgradeMessage={searchData.upgrade_message} />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {searchData.free_results.map((c, i) => (
                  <div key={(c.id as number) || i}
                    className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-5 card-hover cursor-pointer animate-fade-in"
                    style={{ animationDelay: `${i * 50}ms` }}
                    onClick={() => { setSelectedCreator(c.id as number); useCredits(5); }}>
                    <div className="flex items-center gap-3 mb-3">
                      <img src={(c.thumbnail_url as string) || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.name as string)}&background=222&color=fff&size=40`}
                        className="w-10 h-10 rounded-full object-cover bg-[var(--bg-elevated)]" alt="" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-[var(--text)] truncate">{c.name as string}</div>
                        <div className="text-[11px] text-[var(--text-muted)]">{(c.subscriber_count as number).toLocaleString()} · {c.tier as string} · {c.primary_language as string}</div>
                      </div>
                    </div>
                    <div className="text-xs text-[var(--text-muted)]">{c.phone_video_count as number} phone videos · {(c.engagement_rate as number).toFixed(1)}% eng</div>
                  </div>
                ))}
                {searchData.locked_results.map((c, i) => (
                  <div key={`l-${i}`} className="relative bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-5 overflow-hidden animate-fade-in" style={{ animationDelay: `${(searchData.free_results.length + i) * 50}ms` }}>
                    <div className="blur-[6px] pointer-events-none">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-[var(--bg-elevated)]" />
                        <div><div className="text-sm font-semibold text-[var(--text)]">{c.name as string}</div></div>
                      </div>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-8 h-8 rounded-full bg-[var(--bg-elevated)] border border-[var(--border)] flex items-center justify-center">
                        <Lock size={14} className="text-[var(--text-muted)]" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {searchData.upgrade_message && (
              <div className="mt-8 text-center">
                <div className="inline-flex items-center gap-2 bg-[var(--accent-dim)] border border-[var(--accent)]/20 rounded-full px-5 py-2.5">
                  <span className="text-xs text-[var(--accent)]">{searchData.upgrade_message}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {selectedCreator !== null && (
        <CreatorPanel creatorId={selectedCreator} productUrl={productUrl}
          onClose={() => setSelectedCreator(null)} onAddToCampaign={toggleCampaign}
          isInCampaign={campaignIds.includes(selectedCreator)} />
      )}

      {campaignIds.length > 0 && (state === "product-results" || state === "search-results") && (
        <CampaignBar count={campaignIds.length} onView={handleViewCampaign}
          onExport={() => { exportCampaignCSV(campaignIds, productUrl); useCredits(25); }} />
      )}

      {showCampaign && campaignData && (
        <CampaignModal data={campaignData} onClose={() => setShowCampaign(false)} productUrl={productUrl} />
      )}
    </div>
  );
}
