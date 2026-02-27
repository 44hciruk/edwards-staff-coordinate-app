ALTER TABLE `users` MODIFY COLUMN `role` varchar(20) NOT NULL DEFAULT 'user';--> statement-breakpoint
ALTER TABLE `coordinate_posts` DROP COLUMN `status`;--> statement-breakpoint
ALTER TABLE `coordinate_posts` DROP COLUMN `adminNote`;