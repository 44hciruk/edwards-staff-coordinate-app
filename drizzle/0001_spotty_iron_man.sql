CREATE TABLE `coordinate_posts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`staffName` varchar(100) NOT NULL,
	`storeName` varchar(100) NOT NULL,
	`age` int,
	`height` int,
	`weight` int,
	`outfitDescription` text NOT NULL,
	`comment` text,
	`status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`adminNote` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `coordinate_posts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `post_photos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`postId` int NOT NULL,
	`url` text NOT NULL,
	`fileKey` varchar(500) NOT NULL,
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `post_photos_id` PRIMARY KEY(`id`)
);
