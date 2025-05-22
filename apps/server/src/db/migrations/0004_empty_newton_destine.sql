ALTER TABLE "wallet" ADD COLUMN "limit_profile" jsonb;--> statement-breakpoint
ALTER TABLE "wallet" ADD COLUMN "kyc_tier" integer DEFAULT 0;