ALTER TABLE "user" RENAME COLUMN "gabs_tag" TO "tag";--> statement-breakpoint
ALTER TABLE "user" DROP CONSTRAINT "user_gabs_tag_unique";--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_tag_unique" UNIQUE("tag");