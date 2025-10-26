ALTER TABLE "profiles" ADD COLUMN "intended_country" varchar(100);--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "budget_min" integer;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "budget_max" integer;