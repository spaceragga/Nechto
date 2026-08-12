export type HealthResponse = {
  status: 'ok' | 'degraded';
  service: string;
  database: 'up' | 'down';
};

export type HelloResponse = {
  message: string;
};
