ALTER TABLE "income_sources" ADD COLUMN "user_id" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "incomes" ADD COLUMN "user_id" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "investment_assets" ADD COLUMN "user_id" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "investments" ADD COLUMN "user_id" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "receivables" ADD COLUMN "user_id" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "spend_categories" ADD COLUMN "user_id" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "spends" ADD COLUMN "user_id" varchar NOT NULL;