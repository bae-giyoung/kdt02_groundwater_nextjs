import genInfo from '@/data/gennum_info.json';

/**
 * 모든 관측소 코드(gencode) 목록을 담은 배열입니다.
 * 이 배열은 서버 시작 시 한 번만 생성됩니다.
 */
export const GEN_CODES: readonly string[] = Object.keys(genInfo);

/**
 * stationCode를 기반으로 1부터 시작하는 stationId를 찾아 반환합니다.
 * 유효하지 않은 stationCode의 경우 null을 반환합니다.
 * @param stationCode - 찾고자 하는 관측소 코드
 * @returns stationId {number | null}
 */
export function getStationId(stationCode: string): number | null {
  const stationIndex = GEN_CODES.indexOf(stationCode);
  if (stationIndex === -1) {
    return null;
  }
  return stationIndex + 1;
}