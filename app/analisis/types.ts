import type { OverviewStats } from "@/lib/dataLoader";

export interface ChartsData {
  priceHistogram: { bin: string; count: number; label: string }[];
  boxplotSeries: {
    room_type: string;
    min: number;
    q1: number;
    median: number;
    q3: number;
    max: number;
    count: number;
  }[];
  minimumNightsHistogram: { bin: string; count: number; label: string }[];
  reviewsPerMonthHistogram: { bin: string; count: number; label: string }[];
  roomTypePie: { name: string; value: number }[];
  stats: OverviewStats;
}
