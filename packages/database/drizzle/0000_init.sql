CREATE TYPE "public"."chain" AS ENUM('sol');--> statement-breakpoint
CREATE TYPE "public"."status" AS ENUM('up', 'down', 'unknown', 'unreachable', 'timeout', 'error');--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"first_name" text,
	"last_name" text,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "validators" (
	"id" serial PRIMARY KEY NOT NULL,
	"public_key" text NOT NULL,
	"chain" "chain" NOT NULL,
	"location" text NOT NULL,
	"ip_address" text NOT NULL,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "websites" (
	"id" serial PRIMARY KEY NOT NULL,
	"url" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now(),
	"userId" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "website_ticks" (
	"id" serial PRIMARY KEY NOT NULL,
	"status" "status" NOT NULL,
	"latency" integer NOT NULL,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now(),
	"website_id" integer NOT NULL,
	"validatorId" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "websites" ADD CONSTRAINT "websites_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "website_ticks" ADD CONSTRAINT "website_ticks_website_id_websites_id_fk" FOREIGN KEY ("website_id") REFERENCES "public"."websites"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "website_ticks" ADD CONSTRAINT "website_ticks_validatorId_validators_id_fk" FOREIGN KEY ("validatorId") REFERENCES "public"."validators"("id") ON DELETE cascade ON UPDATE cascade;