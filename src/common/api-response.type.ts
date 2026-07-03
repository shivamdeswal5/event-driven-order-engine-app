/**
 * Standard API response wrapper returned by the NestJS backend.
 * Most mutations return { message: string }.
 * Query handlers return the entity/list directly.
 */
export interface ApiMessageResponse {
  message: string;
}
