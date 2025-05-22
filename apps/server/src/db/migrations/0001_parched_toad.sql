ALTER TABLE "setup" RENAME COLUMN "is_bvn_verified" TO "is_identity_verified";--> statement-breakpoint
ALTER TABLE "setup" ALTER COLUMN "is_email_verified" SET DEFAULT false;--> statement-breakpoint
ALTER TABLE "setup" ALTER COLUMN "is_phone_verified" SET DEFAULT false;--> statement-breakpoint
ALTER TABLE "setup" ADD COLUMN "is_bvn_provided" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "bvn_phone_number" varchar;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "state_of_origin" varchar;--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_bvn_phone_number_unique" UNIQUE("bvn_phone_number");