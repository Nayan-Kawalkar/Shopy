import { useEffect, useMemo, useRef, useState } from "react";

import { COMMODITIES, Commodity, commoditiesInNews, getPrices, PriceResult } from "./market-prices";
import type { NewsArticle } from "./news";

export interface CropPrices {
  // Crops in today's headlines first, then the rest.
  ordered: Commodity[];
  inNews: Set<string>;
  commodity: Commodity;
  select: (label: string) => void;
  result: PriceResult | null;
  loading: boolean;
  // The first headline mentioning the selected crop, if any.
  relatedNews: NewsArticle | undefined;
}

// Selected crop + its mandi prices, shared by the price list and the price map on the Articles tab.
export function useCropPrices(news: NewsArticle[] | null): CropPrices {
  const inNewsList = useMemo(() => commoditiesInNews((news ?? []).map((a) => a.title)), [news]);
  const inNews = useMemo(() => new Set(inNewsList.map((c) => c.label)), [inNewsList]);
  const ordered = useMemo(
    () => [...inNewsList, ...COMMODITIES.filter((c) => !inNews.has(c.label))],
    [inNewsList, inNews]
  );

  const [selected, setSelected] = useState<string | null>(null);
  const commodity = ordered.find((c) => c.label === selected) ?? ordered[0];

  const [result, setResult] = useState<PriceResult | null>(null);
  const [loading, setLoading] = useState(false);
  const cache = useRef(new Map<string, PriceResult>());

  useEffect(() => {
    const cached = cache.current.get(commodity.label);
    if (cached) {
      setResult(cached);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setResult(null);
    setLoading(true);
    getPrices(commodity)
      .then((prices) => {
        cache.current.set(commodity.label, prices);
        if (!cancelled) setResult(prices);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [commodity.label]);

  const relatedNews = (news ?? []).find((a) => commodity.match.test(a.title));

  return { ordered, inNews, commodity, select: setSelected, result, loading, relatedNews };
}
