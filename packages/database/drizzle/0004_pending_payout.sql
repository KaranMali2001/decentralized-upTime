ALTER TABLE "website_ticks" DROP CONSTRAINT "website_ticks_validatorId_validators_id_fk";
--> statement-breakpoint
ALTER TABLE "validators" ADD COLUMN "pending_payouts" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "validators" ADD COLUMN "is_processing" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "website_ticks" ADD COLUMN "updated_from_location" text NOT NULL;--> statement-breakpoint
ALTER TABLE "website_ticks" ADD CONSTRAINT "website_ticks_validatorId_validators_id_fk" FOREIGN KEY ("validatorId") REFERENCES "public"."validators"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "validators" ADD CONSTRAINT "validators_public_key_unique" UNIQUE("public_key");