CREATE TABLE "txn" (
	"id" serial PRIMARY KEY NOT NULL,
	"from" text NOT NULL,
	"to" text NOT NULL,
	"txnSignature" text NOT NULL,
	"amount" integer NOT NULL,
	"validatorId" integer NOT NULL,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "validators" ADD COLUMN "temp_signed_message" text;--> statement-breakpoint
ALTER TABLE "validators" ADD COLUMN "signed_message_expiry" timestamp;--> statement-breakpoint
ALTER TABLE "txn" ADD CONSTRAINT "txn_validatorId_validators_id_fk" FOREIGN KEY ("validatorId") REFERENCES "public"."validators"("id") ON DELETE set null ON UPDATE cascade;