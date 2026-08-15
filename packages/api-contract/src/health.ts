export type HealthResponse = {
  status: 'ok' | 'degraded';
  service: string;
  database: 'up' | 'down';
  release: string;
};

export type HelloResponse = {
  message: string;
};
