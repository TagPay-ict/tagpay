CREATE TYPE "public"."payment_type" AS ENUM('INTER_BANK', 'WALLET_TRANSFER');--> statement-breakpoint
CREATE TYPE "public"."transaction_status" AS ENUM('PENDING', 'COMPLETED', 'FAILED', 'REVERSED');--> statement-breakpoint
CREATE TYPE "public"."transaction_type" AS ENUM('DEBIT', 'CREDIT');--> statement-breakpoint
CREATE TYPE "public"."user_gender" AS ENUM('male', 'female');--> statement-breakpoint
CREATE TYPE "public"."medium" AS ENUM('friend', 'referral', 'facebook', 'instagram', 'google', 'twitter', 'linkedin', 'others');--> statement-breakpoint
CREATE TYPE "public"."platform" AS ENUM('web', 'mobile');--> statement-breakpoint
CREATE TYPE "public"."status" AS ENUM('active', 'blocked', 'inactive');--> statement-breakpoint
CREATE TYPE "public"."wallet_status" AS ENUM('active', 'open', 'blocked', 'inactive');--> statement-breakpoint
CREATE TYPE "public"."type" AS ENUM('Savings', 'Current');--> statement-breakpoint
CREATE TABLE "session" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"expires_at" timestamp NOT NULL,
	"user_agent" varchar,
	"updated_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "session_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "transaction" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reference" varchar NOT NULL,
	"amount" integer NOT NULL,
	"fee" integer,
	"type" "transaction_type" NOT NULL,
	"payment_type" "payment_type" NOT NULL,
	"sender" jsonb,
	"status" "transaction_status" DEFAULT 'PENDING' NOT NULL,
	"user_id" uuid NOT NULL,
	"wallet_id" uuid NOT NULL,
	"narration" varchar,
	"metadata" jsonb,
	"recipient" jsonb,
	"session_id" varchar,
	"updated_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "transaction_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "setup" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"is_avatar_uploaded" boolean DEFAULT false,
	"is_tag_created" boolean DEFAULT false,
	"is_notification_enabled" boolean DEFAULT false,
	"is_account_funded" boolean DEFAULT false,
	"is_email_verified" boolean,
	"is_phone_verified" boolean,
	"is_address_verified" boolean DEFAULT false,
	"is_bvn_verified" boolean DEFAULT false,
	"has_created_transactionPin" boolean DEFAULT false,
	CONSTRAINT "setup_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"first_name" varchar,
	"last_name" varchar,
	"middle_name" varchar,
	"account_ref" uuid DEFAULT gen_random_uuid(),
	"full_name" varchar,
	"gabs_tag" varchar,
	"email" varchar,
	"has_onboarded" boolean DEFAULT false,
	"password" varchar,
	"phone_number" varchar,
	"country" varchar DEFAULT 'NG',
	"status" "status" DEFAULT 'active',
	"referral_code" varchar,
	"referral_link" varchar,
	"referred_by" uuid,
	"referrals" uuid[] DEFAULT '{}'::uuid[],
	"gender" "user_gender",
	"providers" jsonb,
	"provider_id" varchar,
	"bvn" varchar,
	"kyc_tier" integer DEFAULT 0,
	"kyc_verified" boolean DEFAULT false,
	"nin" varchar,
	"avatar" varchar,
	"medium" "medium",
	"date_of_birth" varchar,
	"is_flagged" boolean,
	"platform" "platform",
	"terms" boolean DEFAULT true,
	"address" jsonb,
	"passcode" varchar,
	"secure_pin" varchar,
	"refresh_token" varchar[],
	"updated_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "user_id_unique" UNIQUE("id"),
	CONSTRAINT "user_account_ref_unique" UNIQUE("account_ref"),
	CONSTRAINT "user_gabs_tag_unique" UNIQUE("gabs_tag"),
	CONSTRAINT "user_email_unique" UNIQUE("email"),
	CONSTRAINT "user_phone_number_unique" UNIQUE("phone_number"),
	CONSTRAINT "user_referral_code_unique" UNIQUE("referral_code"),
	CONSTRAINT "user_referral_link_unique" UNIQUE("referral_link")
);
--> statement-breakpoint
CREATE TABLE "wallet" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_type" "type" DEFAULT 'Savings' NOT NULL,
	"user_id" uuid NOT NULL,
	"provider_account_id" varchar NOT NULL,
	"currency" varchar DEFAULT 'NGN' NOT NULL,
	"status" "wallet_status" DEFAULT 'open',
	"balance" integer DEFAULT 0 NOT NULL,
	"ledger_balance" integer DEFAULT 0,
	"hold_balance" integer DEFAULT 0,
	"available_balance" integer DEFAULT 0,
	"alias" varchar NOT NULL,
	"account_name" varchar NOT NULL,
	"account_number" varchar NOT NULL,
	"bank_name" varchar NOT NULL,
	"bank_code" varchar NOT NULL,
	"account_purpose" varchar,
	"frozen" boolean DEFAULT false,
	"meta_data" jsonb,
	"updated_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "wallet_id_unique" UNIQUE("id")
);
--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_wallet_id_wallet_id_fk" FOREIGN KEY ("wallet_id") REFERENCES "public"."wallet"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "setup" ADD CONSTRAINT "setup_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wallet" ADD CONSTRAINT "wallet_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;