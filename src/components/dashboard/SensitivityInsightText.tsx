import { SensitivityDataset } from "@/types/uiTypes";

export default function SensitivityInsightText({ data }: { data: SensitivityDataset }) {
  const rainTop = data.top5_rainfall_increase[0];
  const droughtTop = data.top5_drought_decrease[0];
  return (
    <p className="text-xs text-gray-700 italic mt-2">
      {`Station ${rainTop.station}은 강수 시 ${rainTop.increase_if_rainfall.toFixed(2)}m 상승으로 전국 1위 함양형 반응을 보였으며, `}
      {`Station ${droughtTop.station}은 가뭄 시 ${droughtTop.decrease_if_drought.toFixed(2)}m 하락으로 가장 취약한 지역으로 나타났습니다.`}
    </p>
  );
}