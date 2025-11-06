'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import CustomButton from '@/components/CustomButton';
import { toDateUTC, formatDateKST } from '../utils/timeFormatUtils';

type RawSummaryRow = [number, number, number, number, number?];

type SummaryApiResponse = {
  table?: {
    table_data_3y: RawSummaryRow[];
    columns?: string[];
  };
  metrics?: Record<string, number>;
};

type ProcessedRow = {
  station: number;
  yyyymm: number;
  observed: number;
  predicted: number;
  diff: number;
};

type SeasonSummary = {
  key: string;
  label: string;
  months: number[];
  rmse: number;
  bias: number;
  range: number;
  diffs: number[];
};

type YearSummary = {
  year: number;
  meanPred: number;
  meanObs: number;
  rmse: number;
  nse: number;
  kge: number;
  r2: number;
  bias: number;
  range: number;
  mae: number;
  diffSeries: number[];
  rows: ProcessedRow[];
  seasons: SeasonSummary[];
};

type HeatmapRow = {
  year: number;
  values: (number | null)[];
};

type ViewMode = 'year' | 'season' | 'heatmap';

interface Props {
  station: string;
  stationName?: string;
  onHighlightRange?: (from: number | null, to?: number | null) => void;
}

const SEASON_MAP: { key: string; label: string; months: number[] }[] = [
  { key: 'spring', label: '봄(3-5)', months: [3, 4, 5] },
  { key: 'summer', label: '여름(6-8)', months: [6, 7, 8] },
  { key: 'autumn', label: '가을(9-11)', months: [9, 10, 11] },
  { key: 'winter', label: '겨울(12-2)', months: [12, 1, 2] },
];

const VIEW_TABS: { id: ViewMode; label: string }[] = [
  { id: 'year', label: '연도별' },
  { id: 'season', label: '계절별' },
  { id: 'heatmap', label: '월별 수위 편차 Heatmap' },
];

const MONTH_LABELS = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];

const KPI_DESCRIPTIONS: Record<string, string> = {
  KGE: 'Kling-Gupta efficiency (closer to 1 indicates better agreement).',
  NSE: 'Nash-Sutcliffe efficiency (closer to 1 indicates stronger performance).',
  RMSE: 'Root mean square error of groundwater level in meters.',
  R2: 'R-squared goodness-of-fit (closer to 1 indicates better alignment).',
};

const mean = (values: number[]) => (values.length ? values.reduce((acc, cur) => acc + cur, 0) / values.length : 0);

const stdDev = (values: number[]) => {
  if (values.length <= 1) return 0;
  const m = mean(values);
  const variance = values.reduce((acc, cur) => acc + (cur - m) ** 2, 0) / values.length;
  return Math.sqrt(variance);
};

const correlation = (a: number[], b: number[]) => {
  if (!a.length || a.length !== b.length) return 0;
  const meanA = mean(a);
  const meanB = mean(b);
  const numerator = a.reduce((acc, cur, idx) => acc + (cur - meanA) * (b[idx] - meanB), 0);
  const denomA = Math.sqrt(a.reduce((acc, cur) => acc + (cur - meanA) ** 2, 0));
  const denomB = Math.sqrt(b.reduce((acc, cur) => acc + (cur - meanB) ** 2, 0));
  if (denomA === 0 || denomB === 0) return 0;
  return numerator / (denomA * denomB);
};

const buildSeasonSummaries = (rows: ProcessedRow[]): SeasonSummary[] => {
  return SEASON_MAP.flatMap(({ key, label, months }) => {
    const seasonRows = rows.filter((row) => months.includes(row.yyyymm % 100));
    if (!seasonRows.length) return [];
    const diffs = seasonRows.map((row) => row.predicted - row.observed);
    const preds = seasonRows.map((row) => row.predicted);
    const rmse = Math.sqrt(
      seasonRows.reduce((acc, cur) => acc + (cur.predicted - cur.observed) ** 2, 0) / seasonRows.length
    );
    return [
      {
        key,
        label,
        months,
        rmse,
        bias: mean(diffs),
        range: Math.max(...preds) - Math.min(...preds),
        diffs,
      },
    ];
  });
};

const calcYearSummary = (rows: ProcessedRow[]): YearSummary => {
  const diffs = rows.map((row) => row.predicted - row.observed);
  const preds = rows.map((row) => row.predicted);
  const obs = rows.map((row) => row.observed);
  const absDiff = diffs.map((value) => Math.abs(value));
  const errors = diffs.map((value) => value ** 2);
  const meanObs = mean(obs);
  const sse = errors.reduce((acc, cur) => acc + cur, 0);
  const sst = obs.reduce((acc, cur) => acc + (cur - meanObs) ** 2, 0);
  const rmse = Math.sqrt(sse / (rows.length || 1));
  const nse = sst === 0 ? 1 : 1 - sse / sst;

  const r = correlation(obs, preds);
  const stdObs = stdDev(obs);
  const stdPred = stdDev(preds);
  const alpha = stdObs === 0 ? 1 : stdPred / stdObs;
  const meanPred = mean(preds);
  const beta = meanObs === 0 ? 1 : meanPred / meanObs;
  const kge = 1 - Math.sqrt((r - 1) ** 2 + (alpha - 1) ** 2 + (beta - 1) ** 2);

  return {
    year: Math.floor(rows[0].yyyymm / 100),
    meanPred,
    meanObs,
    rmse,
    nse,
    kge,
    r2: r ** 2,
    bias: mean(diffs),
    range: Math.max(...preds) - Math.min(...preds),
    mae: mean(absDiff),
    diffSeries: diffs,
    rows,
    seasons: buildSeasonSummaries(rows),
  };
};

const buildHeatmap = (years: YearSummary[]): HeatmapRow[] => {
  return years
    .map((summary) => {
      const values = Array(12).fill(null) as (number | null)[];
      summary.rows.forEach((row) => {
        const month = (row.yyyymm % 100) - 1;
        values[month] = row.predicted - row.observed;
      });
      return { year: summary.year, values };
    })
    .sort((a, b) => b.year - a.year);
};

const formatNumber = (value: number, fractionDigits = 2) =>
  Number.isFinite(value) ? value.toFixed(fractionDigits) : '-';

const formatMetric = (value: number | undefined, digits: number) =>
    value == null || Number.isNaN(value) ? '-' : Math.floor(value * 10 ** digits) / 10 ** digits;

const Sparkline = ({
  data,
  color = '#1E88E5',
  width = 80,
  height = 24,
}: {
  data: number[];
  color?: string;
  width?: number;
  height?: number;
}) => {
  if (!data.length) {
    return <span className="summary-sparkline-empty">-</span>;
  }
  const minVal = Math.min(...data);
  const maxVal = Math.max(...data);
  const span = maxVal - minVal || 1;
  const points = data
    .map((value, idx) => {
      const x = data.length === 1 ? width / 2 : (idx / (data.length - 1)) * width;
      const y = height - ((value - minVal) / span) * height;
      return `${idx === 0 ? 'M' : 'L'}${x},${y}`;
    })
    .join(' ');
  const zeroPosition = 0 >= minVal && 0 <= maxVal ? height - ((0 - minVal) / span) * height : null;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="summary-sparkline">
      {zeroPosition !== null && (
        <line x1={0} y1={zeroPosition} x2={width} y2={zeroPosition} stroke="#CBD5F5" strokeDasharray="2,2" strokeWidth={1} />
      )}
      <path d={points} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </svg>
  );
};

const Heatmap = ({ rows }: { rows: HeatmapRow[] }) => {
  const maxAbs = Math.max(
    0,
    ...rows.flatMap((row) => row.values.map((val) => (val == null ? 0 : Math.abs(val))))
  );
  const colorForValue = (val: number | null) => {
    if (val == null || maxAbs === 0) return '#e2e8f0';
    const intensity = Math.min(1, Math.abs(val) / maxAbs);
    const alpha = 0.2 + intensity * 0.6;
    return val >= 0 ? `rgba(33,150,243,${alpha})` : `rgba(239,68,68,${alpha})`;
  };
  return (
    <div className="summary-heatmap-wrapper">
      <div className="summary-heatmap-inner">
        <div className="summary-heatmap-header">
          <div className="summary-heatmap-header-cell" style={{ textAlign: 'left' }}>
            년도
          </div>
          {MONTH_LABELS.map((label, idx) => (
            <div key={`hm-header-${idx}`} className="summary-heatmap-header-cell">
              {label}
            </div>
          ))}
        </div>
        {rows.map((row) => (
          <div key={`hm-row-${row.year}`} className="summary-heatmap-row">
            <div className="summary-heatmap-year">{row.year}</div>
            {row.values.map((val, monthIdx) => {
              const backgroundColor = colorForValue(val);
              const textColor = val == null ? '#475569' : '#ffffff';
              return (
                <div
                  key={`hm-cell-${row.year}-${monthIdx}`}
                  className="summary-heatmap-cell"
                  style={{ backgroundColor, color: textColor }}
                  title={
                    val == null
                      ? '측정치 없음'
                      : `${row.year} ${MONTH_LABELS[monthIdx]} | Delta-h: ${formatNumber(val, 3)} el.m`
                  }
                >
                  {val == null ? '-' : formatNumber(val, 2)}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

const ForecastSummaryPanel = ({ station, stationName, onHighlightRange }: Props) => {
  const [view, setView] = useState<ViewMode>('year');
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rawRows, setRawRows] = useState<ProcessedRow[]>([]);
  const [metrics, setMetrics] = useState<Record<string, number>>({});

  const summaryUrl = useMemo(() => {
    return `/java/api/v1/rawdata/summary/predict?station=${station}&timestep=monthly&horizons=36`;
    //return `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/mockdata/summary?station=${station}&timestep=monthly&horizons=36`;
  }, [station]);

  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();
    const fetchSummary = async () => {
      setLoading(true);
      setError(null);

      try {
        const resp = await fetch(summaryUrl, { signal: controller.signal });
        
        if (!resp.ok) {
          throw new Error(`요약 데이터 로딩 실패 (status ${resp.status}).`);
        }

        const json: SummaryApiResponse = await resp.json();
        const rows = json.table?.table_data_3y ?? [];
        const processed: ProcessedRow[] = rows.map((row) => {
          const [stationNo, yyyymm, observed, predicted, diff] = row;
          return {
            station: stationNo,
            yyyymm,
            observed,
            predicted,
            diff: diff ?? predicted - observed,
          };
        });

        if (mounted) {
          setRawRows(processed);
          setMetrics(json.metrics ?? {});
        }

      } catch (err) {
        if (mounted) {
          const message = err instanceof Error ? err.message : '요약 데이터 로딩 중 오류 발생';
          setError(message);
          setRawRows([]);
        }

      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchSummary();
    
    return () => {
      mounted = false;
      controller.abort();
    };
  }, [summaryUrl]);

  const yearSummaries = useMemo(() => {
    if (!rawRows.length) return [];
    const groups = new Map<number, ProcessedRow[]>();
    rawRows.forEach((row) => {
      const year = Math.floor(row.yyyymm / 100);
      if (!groups.has(year)) groups.set(year, []);
      groups.get(year)!.push(row);
    });
    return Array.from(groups.entries())
      .map(([, rows]) => calcYearSummary(rows.sort((a, b) => a.yyyymm - b.yyyymm)))
      .sort((a, b) => b.year - a.year);
  }, [rawRows]);

  const heatmapRows = useMemo(() => buildHeatmap(yearSummaries), [yearSummaries]);

  const lastUpdated = useMemo(() => {
    if (!rawRows.length) return null;
    const maxYyyymm = Math.max(...rawRows.map((row) => row.yyyymm));
    return toDateUTC(maxYyyymm);
  }, [rawRows]);

  const toggleYear = (year: number) => {
    setExpanded((prev) => ({ ...prev, [year]: !prev[year] }));
  };

  const currentKpis = useMemo(() => {

    if (Object.keys(metrics).length) {
      return [
        { key: 'NSE', label: 'NSE', value: formatMetric(metrics.NSE, 2), title: KPI_DESCRIPTIONS.NSE },
        { key: 'KGE', label: 'KGE', value: formatMetric(metrics.KGE, 2), title: KPI_DESCRIPTIONS.KGE },
        { key: 'RMSE', label: 'RMSE (el.m)', value: formatMetric(metrics.RMSE, 3), title: KPI_DESCRIPTIONS.RMSE },
        { key: 'R2', label: 'R^2', value: formatMetric(metrics.R2, 2), title: KPI_DESCRIPTIONS.R2 },
      ];
    }

    if (!yearSummaries.length) return [];
    const latest = yearSummaries[0];
    return [
      { key: 'NSE', label: 'NSE', value: formatMetric(latest.nse, 2), title: KPI_DESCRIPTIONS.NSE },
      { key: 'KGE', label: 'KGE', value: formatMetric(latest.kge, 2), title: KPI_DESCRIPTIONS.KGE },
      { key: 'RMSE', label: 'RMSE (el.m)', value: formatMetric(latest.rmse, 3), title: KPI_DESCRIPTIONS.RMSE },
      { key: 'R2', label: 'R^2', value: formatMetric(latest.r2, 2), title: KPI_DESCRIPTIONS.R2 },
    ];
  }, [metrics, yearSummaries]);

  const handleExport = useCallback(() => {
    const BOM = '\uFEFF';
    const headers = ['연도별 또는 계절별', '예측 평균', '실측 평균', 'RMSE', 'NSE', 'KGE', 'Bias', 'Range', 'MAE'];
    const rows =
      view === 'year'
        ? yearSummaries.map((summary) => [
            summary.year,
            summary.meanPred.toFixed(3),
            summary.meanObs.toFixed(3),
            summary.rmse.toFixed(3),
            formatMetric(summary.nse, 3),
            formatMetric(summary.kge, 3),
            summary.bias.toFixed(3),
            summary.range.toFixed(3),
            summary.mae.toFixed(3),
          ])
        : view === 'season'
        ? yearSummaries.flatMap((summary) =>
            summary.seasons.map((season) => [
              `${summary.year} ${season.label}`,
              '',
              '',
              season.rmse.toFixed(3),
              '',
              '',
              season.bias.toFixed(3),
              season.range.toFixed(3),
              '',
            ])
          )
        : heatmapRows.flatMap((row) =>
            row.values.map((val, idx) => [
              `${row.year} ${MONTH_LABELS[idx]}`,
              '',
              '',
              '',
              '',
              '',
              val == null ? '' : val.toFixed(3),
              '',
              '',
            ])
          );

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const date = lastUpdated ? formatDateKST(lastUpdated).replace(/\s|:/g, '-') : new Date().toISOString().slice(0, 10);
    const link = document.createElement('a');
    link.href = url;
    link.download = `요약데이터_${station}_${date}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }, [heatmapRows, lastUpdated, station, view, yearSummaries]);

  const handleRowHover = (summary: YearSummary | null, season?: SeasonSummary) => {
    if (!onHighlightRange) return;
    if (!summary) {
      onHighlightRange(null, null);
      return;
    }
    const rowsToUse = season ? summary.rows.filter((row) => season.months.includes(row.yyyymm % 100)) : summary.rows;
    if (!rowsToUse.length) {
      onHighlightRange(null, null);
      return;
    }
    const start = toDateUTC(rowsToUse[0].yyyymm);
    const end = toDateUTC(rowsToUse[rowsToUse.length - 1].yyyymm);
    onHighlightRange(start, end);
  };

  return (
    <section className="summary-container">
      <div className="summary-header">
        <div className="summary-header-info">
          <h2 className="summary-header-title c-tit03">
              <span className="c-txt-point">{stationName ?? 'Station'}</span> 예측 기간 요약
          </h2>
          <p className="summary-header-subtitle">
            변동 추세 및 정확도
          </p>
        </div>
        <div className="summary-header-actions">
          <div className="summary-tab-list">
            {VIEW_TABS.map((tab) => {
              const isActive = view === tab.id;
              const tabClassName = isActive
                ? 'btn-style-6 active'
                : 'btn-style-6';
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setView(tab.id)}
                  className={tabClassName}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
          <CustomButton caption="CSV 다운로드" bType="button" bStyle="btn-style-3" handler={handleExport} />
        </div>
      </div>

      {loading ? (
        <div className="summary-loading-wrapper">
          <div className="summary-kpi-section">
            <div className="summary-kpi-grid summary-skeleton-grid">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div key={`skeleton-card-${idx}`} className="summary-kpi-card summary-skeleton-card">
                  <span className="summary-kpi-label">indicators</span>
                  <span className="summary-kpi-value">0</span>
                </div>
              ))}
            </div>
          </div>
          <div className="summary-table-wrapper">
            <table className="summary-data-table summary-skeleton-block">
              <thead>
                <tr><th className="" colSpan={10}>로딩중</th></tr>
              </thead>
              <tbody>
                <tr className="summary-data-rows"><td className="summary-data-cell" colSpan={10}><p style={{width: "24px", height: "24px"}}>로딩중</p></td></tr>
                <tr className="summary-data-rows"><td className="summary-data-cell" colSpan={10}><p style={{width: "24px", height: "24px"}}>로딩중</p></td></tr>
                <tr className="summary-data-rows"><td className="summary-data-cell" colSpan={10}><p style={{width: "24px", height: "24px"}}>로딩중</p></td></tr>
              </tbody>
            </table>
          </div>
        </div>
      ) : error ? (
        <div className="summary-error-box">{error}</div>
      ) : !yearSummaries.length ? (
        <div className="summary-empty-box">
          현재 관측소의 요약 데이터가 존재하지 않습니다.
        </div>
      ) : (
        <>
          <div className="summary-kpi-section">
            <div className="summary-kpi-grid">
              {currentKpis.map((kpi) => (
                <div key={kpi.key} className="summary-kpi-card" title={kpi.title}>
                  <span className="summary-kpi-label">{kpi.label}</span>
                  <span className="summary-kpi-value">{kpi.value}</span>
                </div>
              ))}
            </div>
          </div>

          {view === 'heatmap' ? (
            <Heatmap rows={heatmapRows} />
          ) : (
            <div className="summary-table-wrapper">
              <table className="summary-data-table">
                <thead>
                  <tr>
                    <th>년도</th>
                    <th>예측 평균 (el.m)</th>
                    <th>실측 평균 (el.m)</th>
                    <th>RMSE</th>
                    <th>NSE</th>
                    <th>KGE</th>
                    <th>Bias (el.m)</th>
                    <th>Range (el.m)</th>
                    <th>MAE (el.m)</th>
                    <th>월별 수위차 스파크라인</th>
                  </tr>
                </thead>
                <tbody>
                  {yearSummaries.map((summary) => {
                    const isExpanded = expanded[summary.year];
                    return (
                      <FragmentRow
                        key={`year-${summary.year}`}
                        summary={summary}
                        isExpanded={!!isExpanded}
                        view={view}
                        onToggle={() => toggleYear(summary.year)}
                        onHover={(enter) => handleRowHover(enter ? summary : null)}
                        onHoverSeason={(season, enter) =>
                          handleRowHover(enter ? summary : null, enter ? season : undefined)
                        }
                      />
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      <div className="summary-footer">
        <div className="summary-footer-legend">
          <span className="summary-legend-item">
            <span className="summary-legend-dot-neutral" />
            <span>Heatmap: </span>
          </span>
          <span className="summary-legend-item">
            <span className="summary-legend-dot summary-legend-dot-positive" />
            <span>수위 편차 &gt; 0</span>
          </span>
          <span className="summary-legend-item">
            <span className="summary-legend-dot summary-legend-dot-negative" />
            <span>수위 편차 &lt; 0</span>
          </span>
          <span className="summary-legend-item">
            <span className="summary-legend-dot summary-legend-dot-neutral" />
            <span>관측치 없음</span>
          </span>
        </div>
        <div className="summary-footer-timestamp">
          {lastUpdated && <span>업데이트 (KST): {formatDateKST(lastUpdated)}</span>}
        </div>
      </div>
    </section>
  );
};

const FragmentRow = ({
  summary,
  isExpanded,
  view,
  onToggle,
  onHover,
  onHoverSeason,
}: {
  summary: YearSummary;
  isExpanded: boolean;
  view: ViewMode;
  onToggle: () => void;
  onHover: (enter: boolean) => void;
  onHoverSeason: (season: SeasonSummary, enter: boolean) => void;
}) => {
  return (
    <>
      <tr
        className="summary-data-row"
        onMouseEnter={() => onHover(true)}
        onMouseLeave={() => onHover(false)}
      >
        <td className="summary-data-cell">
          <button
            type="button"
            onClick={onToggle}
            className="summary-expand-button"
          >
            <span>{summary.year}</span>
            {
              view === 'season' && 
              <span className="summary-expand-hint">{isExpanded ? '계절별 닫기' : '계절별 보기'}</span>
            }
          </button>
        </td>
        <td className="summary-data-cell summary-numeric-cell">{formatNumber(summary.meanPred, 3)}</td>
        <td className="summary-data-cell summary-numeric-cell">{formatNumber(summary.meanObs, 3)}</td>
        <td className="summary-data-cell summary-numeric-cell">{formatNumber(summary.rmse, 3)}</td>
        <td className="summary-data-cell summary-numeric-cell">{formatMetric(summary.nse, 3)}</td>
        <td className="summary-data-cell summary-numeric-cell">{formatMetric(summary.kge, 3)}</td>
        <td className="summary-data-cell summary-numeric-cell">{formatNumber(summary.bias, 3)}</td>
        <td className="summary-data-cell summary-numeric-cell">{formatNumber(summary.range, 3)}</td>
        <td className="summary-data-cell summary-numeric-cell">{formatNumber(summary.mae, 3)}</td>
        <td className="summary-data-cell summary-numeric-cell">
          <Sparkline data={summary.diffSeries} />
        </td>
      </tr>
      {view === 'season' && isExpanded && (
        summary.seasons.map((season) => (
          <tr
            key={`season-${summary.year}-${season.key}`}
            className="summary-season-row"
            onMouseEnter={() => onHoverSeason(season, true)}
            onMouseLeave={() => onHoverSeason(season, false)}
          >
            <td className="summary-data-cell">{season.label}</td>
            <td className="summary-data-cell summary-numeric-cell">-</td>
            <td className="summary-data-cell summary-numeric-cell">-</td>
            <td className="summary-data-cell summary-numeric-cell">{formatNumber(season.rmse, 3)}</td>
            <td className="summary-data-cell summary-numeric-cell">-</td>
            <td className="summary-data-cell summary-numeric-cell">-</td>
            <td className="summary-data-cell summary-numeric-cell">{formatNumber(season.bias, 3)}</td>
            <td className="summary-data-cell summary-numeric-cell">{formatNumber(season.range, 3)}</td>
            <td className="summary-data-cell summary-numeric-cell">-</td>
            <td className="summary-data-cell summary-numeric-cell">
              <Sparkline data={season.diffs} color="#FB8C00" />
            </td>
          </tr>
        ))
      )}
    </>
  );
};

export default ForecastSummaryPanel;