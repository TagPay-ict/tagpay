CREATE TABLE "bill_payment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"status" "status" NOT NULL,
	"type" "type" NOT NULL,
	"reference" varchar NOT NULL,
	"provider" varchar NOT NULL,
	"external_bill_id" varchar NOT NULL,
	"amount" integer NOT NULL,
	"attributes" jsonb NOT NULL,
	"updated_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "bill_payment_id_unique" UNIQUE("id")
);
--> statement-breakpoint
ALTER TABLE "setup" ADD COLUMN "is_address_provided" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "bill_payment" ADD CONSTRAINT "bill_payment_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;