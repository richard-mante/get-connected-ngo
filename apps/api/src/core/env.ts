export interface Env {
 DB:D1Database;
 MEDIA:R2Bucket;
 ACCESS_TEAM_DOMAIN:string;
 ACCESS_AUD:string;
 ADMIN_EMAILS:string;
 ALLOWED_ORIGINS:string;
 APP_ENV?:string;
 TURNSTILE_SECRET_KEY?:string;
}