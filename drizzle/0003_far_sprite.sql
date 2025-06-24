CREATE TABLE "spend" (
	"id" text PRIMARY KEY NOT NULL,
	"amount" integer NOT NULL,
	"category_id" text NOT NULL,
	"date" date NOT NULL
);
--> statement-breakpoint
CREATE TABLE "spend_categories" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "spend" ADD CONSTRAINT "spend_category_id_spend_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."spend_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "spend_dateIndex" ON "spend" USING btree ("date");