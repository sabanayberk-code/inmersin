CREATE TABLE `listing_translations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`listing_id` integer NOT NULL,
	`language` text NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`slug` text NOT NULL,
	FOREIGN KEY (`listing_id`) REFERENCES `listings`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `listings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`agent_id` integer NOT NULL,
	`type` text DEFAULT 'real_estate' NOT NULL,
	`price` integer NOT NULL,
	`currency` text DEFAULT 'USD',
	`location` text NOT NULL,
	`features` text NOT NULL,
	`status` text DEFAULT 'draft',
	`is_showcase` integer DEFAULT false,
	`view_count` integer DEFAULT 0,
	`serial_code` text,
	`created_at` integer DEFAULT (cast(unixepoch() * 1000 as integer)),
	`updated_at` integer DEFAULT (cast(unixepoch() * 1000 as integer)),
	FOREIGN KEY (`agent_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `listings_serial_code_unique` ON `listings` (`serial_code`);--> statement-breakpoint
CREATE TABLE `media` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`listing_id` integer NOT NULL,
	`url` text NOT NULL,
	`type` text DEFAULT 'image',
	`order` integer DEFAULT 0,
	FOREIGN KEY (`listing_id`) REFERENCES `listings`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` integer NOT NULL,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`phone` text,
	`company_name` text,
	`role` text DEFAULT 'agent',
	`languages` text,
	`created_at` integer DEFAULT (unixepoch()),
	`email_verified` integer DEFAULT false,
	`is_approved` integer DEFAULT false,
	`verification_token` text,
	`reset_token` text,
	`reset_token_expires_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);