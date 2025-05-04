CREATE TABLE "income" (
	"id" text PRIMARY KEY NOT NULL,
	"amount" integer NOT NULL,
	"source_id" text NOT NULL,
	"date" date NOT NULL
);
--> statement-breakpoint
CREATE TABLE "income_sources" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"date" date NOT NULL
);
--> statement-breakpoint
ALTER TABLE "income" ADD CONSTRAINT "income_source_id_income_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."income_sources"("id") ON DELETE no action ON UPDATE no action;