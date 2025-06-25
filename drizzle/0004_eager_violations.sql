ALTER TABLE "income" RENAME TO "incomes";--> statement-breakpoint
ALTER TABLE "spend" RENAME TO "spends";--> statement-breakpoint
ALTER TABLE "incomes" DROP CONSTRAINT "income_source_id_income_sources_id_fk";
--> statement-breakpoint
ALTER TABLE "spends" DROP CONSTRAINT "spend_category_id_spend_categories_id_fk";
--> statement-breakpoint
ALTER TABLE "incomes" ADD CONSTRAINT "incomes_source_id_income_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."income_sources"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "spends" ADD CONSTRAINT "spends_category_id_spend_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."spend_categories"("id") ON DELETE no action ON UPDATE no action;