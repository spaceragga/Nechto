process.env.NODE_ENV ??= 'test';
process.env.PORT ??= '3001';
process.env.DATABASE_URL ??=
  'postgresql://nechto:nechto@localhost:5432/nechto';
process.env.JWT_SECRET ??= 'test-jwt-secret-key';
process.env.JWT_EXPIRES_IN ??= '7d';
process.env.COOKIE_SECURE ??= 'false';
process.env.CORS_ORIGIN ??= 'http://localhost:3000';
