import type { SensitivityRecord } from "@/types/uiTypes";

interface Props { records: SensitivityRecord[]; }

export default function SensitivityClusterTable({ records }: Props) {
  const classify = (r: SensitivityRecord) => {
    if (r.increase_if_rainfall > 0.3 && r.decrease_if_drought < 0.1) return "🌧️ 함양형";
    if (r.decrease_if_drought > 0.4) return "☀️ 가뭄취약형";
    if (r.range_variation > 0.5) return "🔁 변동형";
    return "⚪ 중립형";
  };

  return (
    <table className="table-auto text-sm w-full">
      <thead><tr><th>관측소</th><th>상승폭</th><th>하강폭</th><th>변동폭</th><th>유형</th></tr></thead>
      <tbody>
        {records.map(r => (
          <tr key={r.station}>
            <td>{r.station}</td>
            <td>{r.increase_if_rainfall.toFixed(2)}</td>
            <td>{r.decrease_if_drought.toFixed(2)}</td>
            <td>{r.range_variation.toFixed(2)}</td>
            <td>{classify(r)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
