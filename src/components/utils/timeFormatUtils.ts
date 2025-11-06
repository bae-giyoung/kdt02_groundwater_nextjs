function toDateUTC(yyyymm: number) {
  const year = Math.floor(yyyymm / 100);
  const month = (yyyymm % 100) - 1;
  return Date.UTC(year, month, 1);
};

function formatDateKST(timestamp: number) {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

const yyyymmToUTC = (yyyymm: number) : number => {
    const yyyymmNum = yyyymm;
    const yyyy = Math.floor(yyyymmNum / 100);
    const mm = (yyyymmNum % 100) - 1;
    return Date.UTC(yyyy, mm, 1);
}

export { toDateUTC, formatDateKST, yyyymmToUTC };