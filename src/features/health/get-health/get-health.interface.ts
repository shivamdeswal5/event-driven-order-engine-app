export interface HealthResponse {
  status: "healthy" | "unhealthy";
  timestamp: string;
  details: {
    database: {
      status: "up" | "down";
    };
    rabbitmq: {
      status: "up" | "down";
    };
  };
}
