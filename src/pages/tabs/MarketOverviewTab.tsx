import { DollarSign, TrendingUp, BarChart3 } from "lucide-react";
import { KPICard } from "@/components/aircraft-interiors/KPICard";
import { MarketOverviewChart } from "@/components/aircraft-interiors/MarketOverviewChart";
import { DistributionDonutsRow } from "@/components/aircraft-interiors/DistributionDonutsRow";
import { DrillDownModal } from "@/components/aircraft-interiors/DrillDownModal";
import { MarketData, calculateCAGR, SegmentData, YearlyData } from "@/hooks/useMarketData";
import { MainTabType } from "@/components/aircraft-interiors/MainNavigation";
import { useDrillDown } from "@/hooks/useDrillDown";

interface MarketOverviewTabProps {
  marketData: MarketData;
  selectedYear: number;
  onYearChange: (year: number) => void;
  onNavigateToTab: (tabType: MainTabType) => void;
  endUserLabel?: string;
  equipmentLabel?: string;
  processTypeLabel?: string;
  applicationLabel?: string;
  useMillions?: boolean;
  forecastEndYear?: number;
}

export function MarketOverviewTab({
  marketData,
  selectedYear,
  onYearChange,
  onNavigateToTab,
  endUserLabel = "End User",
  equipmentLabel = "Equipment",
  processTypeLabel = "Process Type",
  applicationLabel = "Application",
  useMillions = false,
  forecastEndYear,
}: MarketOverviewTabProps) {
  const { drillDownState, openDrillDown, closeDrillDown } = useDrillDown();

  // Calculate KPI values
  const lastYear = forecastEndYear ?? marketData.years[marketData.years.length - 1];
  const firstYear = marketData.years[0];
  const currentMarketValue = marketData.totalMarket.find((d) => d.year === selectedYear)?.value ?? 0;
  const valueFirst = marketData.totalMarket.find((d) => d.year === firstYear)?.value ?? 0;
  const valueLast = marketData.totalMarket.find((d) => d.year === lastYear)?.value ?? 0;
  const cagrYears = lastYear - firstYear;
  const cagrValue = calculateCAGR(valueFirst, valueLast, cagrYears);

  // Handle slice click for drill-down modal
  const handleSliceClick = (
    segmentName: string,
    segmentData: YearlyData[],
    color: string,
    donutType: MainTabType
  ) => {
    // Determine related segments based on donut type
    let relatedSegments: { title: string; data: SegmentData[] } | undefined;
    
    switch (donutType) {
      case "endUser":
        relatedSegments = { title: "By Region", data: marketData.region };
        break;
      case "aircraft":
        relatedSegments = { title: "By Application", data: marketData.application };
        break;
      case "region":
        relatedSegments = { title: `By ${endUserLabel}`, data: marketData.endUser };
        break;
      case "application":
        relatedSegments = { title: "By Aircraft Type", data: marketData.aircraftType };
        break;
      case "equipment":
        relatedSegments = { title: `By ${endUserLabel}`, data: marketData.endUser };
        break;
      case "process":
        relatedSegments = { title: "By Region", data: marketData.region };
        break;
    }

    openDrillDown(segmentName, segmentData, color, relatedSegments);
  };

  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KPICard
          title={`${selectedYear} Market Size`}
          value={useMillions ? currentMarketValue : currentMarketValue / 1000}
          suffix={useMillions ? "M" : "B"}
          icon={DollarSign}
          delay={0}
          accentColor="primary"
        />
        <KPICard
          title={`CAGR (${firstYear}-${lastYear})`}
          value={cagrValue}
          prefix=""
          suffix="%"
          icon={BarChart3}
          delay={0.1}
          accentColor="chart-4"
        />
        <KPICard
          title={`${lastYear} Forecast`}
          value={useMillions ? valueLast : valueLast / 1000}
          suffix={useMillions ? "M" : "B"}
          icon={TrendingUp}
          delay={0.2}
          accentColor="accent"
        />
      </div>

      {/* Dual-Axis Line Chart */}
      <MarketOverviewChart
        data={marketData.totalMarket}
        title="Market Size & YoY Growth Trend"
        subtitle={`${marketData.years[0]}-${marketData.years[marketData.years.length - 1]} data`}
        useMillions={useMillions}
      />

      {/* Distribution Donuts Row */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">
          {selectedYear} Market Distribution
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Click any slice to see detailed analysis
        </p>
        <DistributionDonutsRow
          endUserData={marketData.endUser}
          aircraftData={marketData.aircraftType}
          regionData={marketData.region}
          applicationData={marketData.application}
          equipmentData={marketData.furnishedEquipment?.length ? marketData.furnishedEquipment : (marketData.materialType ?? [])}
          processTypeData={marketData.processType}
          year={selectedYear}
          onDonutClick={onNavigateToTab}
          onSliceClick={handleSliceClick}
          endUserLabel={endUserLabel}
          equipmentLabel={equipmentLabel}
          processTypeLabel={processTypeLabel}
          applicationLabel={applicationLabel}
        />
      </div>

      {/* Drill-Down Modal */}
      <DrillDownModal
        isOpen={drillDownState.isOpen}
        onClose={closeDrillDown}
        segmentName={drillDownState.segmentName}
        segmentData={drillDownState.segmentData}
        color={drillDownState.color}
        useMillions={useMillions}
      />
    </div>
  );
}
