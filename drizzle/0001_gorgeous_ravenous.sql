CREATE TABLE `brand_requests` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`parent_category` text NOT NULL,
	`status` text DEFAULT 'pending',
	`requested_by` integer,
	`created_at` integer DEFAULT (unixepoch()),
	FOREIGN KEY (`requested_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
