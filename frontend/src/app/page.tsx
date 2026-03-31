"use client";

import { useState, useEffect, useCallback } from "react";
import {
  analyzeProduct, fetchStats, buildCampaign, exportCampaignCSV,
  type AnalyzeResponse, type StatsResponse, type CampaignData,
} from "@/lib/api";
import { SearchHero } from "@/components/search-hero";
import { LoadingSequence } from "@/components/loading-sequence";
import { ProductCard } from "@/components/product-card";
import { DemandIntelCard } from "@/components/demand-intel-card";
import { CreatorGrid } from "@/components/creator-grid";
import { CreatorPanel } from "@/components/creator-panel";
import { CampaignBar } from "@/components/campaign-bar";
import { CampaignModal } from "@/components/campaign-modal";
import { TopBar } from "@/components/top-bar";

type AppState = "idle" | "loading" | "results";

export default function Home() {
  const [state, setState] = useState<AppState>("idle");
  const [productUrl, setProductUrl] = useState("");
  const [data, setData] = useState<AnalyzeResponse | null>(null);
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [selectedCreator, setSelectedCreator] = useState<number | null>(null);
  const [campaignIds, setCampaignIds] = useState<number[]>([]);
  const [showCampaign, setShowCampaign] = useState(false);
  const [campaignData, setCampaignData] = useState<CampaignData | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);
  const [filters, setFilters] = useState({ tier: "", language: "", sort: "match_score" });

  useEffect(() => {
    fetchStats().then(setStats).catch(() => {});
  }, []);

  const handleSearch = useCallback(async (url: string) => {
    setProductUrl(url);
    setState("loading");
    setLoadingStep(0);
    setCampaignIds([]);
    setCampaignData(null);

    const stepTimers = [300, 1200, 2400, 3200, 4000];
    stepTimers.forEach((ms, i) => setTimeout(() => setLoadingStep(i + 1), ms));

    try {
      const result = await analyzeProduct(url);
      setData(result);
      setLoadingStep(6);
      setTimeout(() => setState("results"), 800);
    } catch (err) {
      console.error(err);
      setLoadingStep(-1);
    }
  }, []);

  const toggleCampaign = useCallback((id: number) => {
    setCampaignIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  }, []);

  const handleViewCampaign = useCallback(async () => {
    if (campaignIds.length < 1) return;
    const campaign = await buildCampaign(campaignIds, productUrl);
    setCampaignData(campaign);
    setShowCampaign(true);
  }, [campaignIds, productUrl]);

  const handleExportCSV = useCallback(() => {
    exportCampaignCSV(campaignIds, productUrl);
  }, [campaignIds, productUrl]);

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
    <div className="min-h-screen bg-[#06060a]">
      <TopBar state={state} stats={stats} onReset={() => { setState("idle"); setData(null); setCampaignIds([]); }} />

      {state === "idle" && <SearchHero onSearch={handleSearch} stats={stats} />}

      {state === "loading" && (
        <LoadingSequence step={loadingStep} url={productUrl} product={data?.product} />
      )}

      {state === "results" && data && (
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 pt-4 pb-32">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            <ProductCard product={data.product} totalMatched={data.total_matched} totalDisqualified={data.total_disqualified} />
            <div className="lg:col-span-2">
              <DemandIntelCard intel={data.demand_intelligence} product={data.product} />
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2 mb-5">
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest mr-1">Tier</span>
            {["", "mega", "macro", "mid", "micro"].map(t => (
              <button
                key={t}
                onClick={() => setFilters(f => ({ ...f, tier: t }))}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  filters.tier === t
                    ? "bg-indigo-500 text-white"
                    : "bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800"
                }`}
              >
                {t || "All"}
                {t && data.demand_intelligence.language_coverage && (
                  <span className="ml-1 opacity-50">
                    {data.creators.filter(c => c.creator.tier === t).length}
                  </span>
                )}
              </button>
            ))}

            <div className="w-px h-5 bg-zinc-800 mx-1" />

            <span className="text-[10px] text-zinc-500 uppercase tracking-widest mr-1">Lang</span>
            {Object.entries(data.demand_intelligence.language_coverage || {})
              .sort(([, a], [, b]) => b - a)
              .slice(0, 6)
              .map(([lang, count]) => (
                <button
                  key={lang}
                  onClick={() => setFilters(f => ({ ...f, language: f.language === lang ? "" : lang }))}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                    filters.language === lang
                      ? "bg-indigo-500 text-white"
                      : "bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800"
                  }`}
                >
                  {lang.charAt(0).toUpperCase() + lang.slice(1)}
                  <span className="ml-1 opacity-50">{count}</span>
                </button>
              ))}

            <div className="flex-1" />

            <select
              value={filters.sort}
              onChange={e => setFilters(f => ({ ...f, sort: e.target.value }))}
              className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-300 outline-none"
            >
              <option value="match_score">Sort: Best Match</option>
              <option value="subscribers">Sort: Subscribers</option>
              <option value="engagement">Sort: Engagement</option>
              <option value="cpv">Sort: Best CPV</option>
            </select>

            <div className="text-xs text-zinc-500">
              {filteredCreators.length} creators
            </div>
          </div>

          <CreatorGrid
            creators={filteredCreators}
            onSelect={setSelectedCreator}
            campaignIds={campaignIds}
            onToggleCampaign={toggleCampaign}
            productBrand={data.product.brand}
          />
        </div>
      )}

      {selectedCreator !== null && (
        <CreatorPanel
          creatorId={selectedCreator}
          productUrl={productUrl}
          onClose={() => setSelectedCreator(null)}
          onAddToCampaign={toggleCampaign}
          isInCampaign={campaignIds.includes(selectedCreator)}
        />
      )}

      {campaignIds.length > 0 && state === "results" && (
        <CampaignBar
          count={campaignIds.length}
          onView={handleViewCampaign}
          onExport={handleExportCSV}
        />
      )}

      {showCampaign && campaignData && (
        <CampaignModal
          data={campaignData}
          onClose={() => setShowCampaign(false)}
          productUrl={productUrl}
        />
      )}
    </div>
  );
}
