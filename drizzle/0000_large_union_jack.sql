CREATE TABLE "coordinate_posts" (
	"id" serial PRIMARY KEY NOT NULL,
	"staffName" varchar(100) NOT NULL,
	"storeName" varchar(100) NOT NULL,
	"age" integer,
	"height" integer,
	"weight" integer,
	"outfitDescription" text NOT NULL,
	"comment" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "post_photos" (
	"id" serial PRIMARY KEY NOT NULL,
	"postId" integer NOT NULL,
	"url" text NOT NULL,
	"fileKey" varchar(500) NOT NULL,
	"sortOrder" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"openId" varchar(64) NOT NULL,
	"name" text,
	"email" varchar(320),
	"loginMethod" varchar(64),
	"role" varchar(20) DEFAULT 'user' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"lastSignedIn" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_openId_unique" UNIQUE("openId")
);
