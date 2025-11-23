const apiRoutes = {
  // Java Spring Boot로 프록시된 next.config.js rewrites
  longTerm: (stationId: string) => `/java/api/v1/rawdata/longterm?station=${stationId}&timestep=monthly&horizons=120`,
  weather: (stationId: string) => `/java/api/v1/rawdata/summary/weather?station=${stationId}`,

  // 내부 Next.js API routes
  currentElev: (days: number) => `/api/v1/dashboard/currentElev?days=${days}`,
  featureImportance: () => `/api/v1/dashboard/featureImportance`,
};

export default apiRoutes;
