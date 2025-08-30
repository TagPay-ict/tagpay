ALTER TABLE "setup" ADD COLUMN "is_nin_provided" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "setup" ADD COLUMN "is_bvn_verified" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "setup" ADD COLUMN "is_nin_verified" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "migrated" boolean;