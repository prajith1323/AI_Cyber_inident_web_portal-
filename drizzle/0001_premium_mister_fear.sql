CREATE TABLE `aiAnalysisResults` (
	`id` int AUTO_INCREMENT NOT NULL,
	`incidentId` int NOT NULL,
	`classificationConfidence` decimal(5,4) NOT NULL,
	`predictedSeverity` enum('low','medium','high','critical') NOT NULL,
	`severityConfidence` decimal(5,4) NOT NULL,
	`riskScore` decimal(5,2) NOT NULL,
	`threatIndicators` text,
	`recommendedActions` text,
	`llmAnalysis` text,
	`modelVersion` varchar(64) NOT NULL,
	`analyzedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `aiAnalysisResults_id` PRIMARY KEY(`id`),
	CONSTRAINT `aiAnalysisResults_incidentId_unique` UNIQUE(`incidentId`)
);
--> statement-breakpoint
CREATE TABLE `analystNotes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`incidentId` int NOT NULL,
	`analystId` int NOT NULL,
	`content` text NOT NULL,
	`isInternal` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `analystNotes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `auditLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`incidentId` int,
	`action` varchar(255) NOT NULL,
	`resourceType` varchar(64) NOT NULL,
	`resourceId` int,
	`changes` text,
	`ipAddress` varchar(45),
	`userAgent` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `auditLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `incidentTimeline` (
	`id` int AUTO_INCREMENT NOT NULL,
	`incidentId` int NOT NULL,
	`eventType` varchar(64) NOT NULL,
	`previousValue` text,
	`newValue` text,
	`changedBy` int,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `incidentTimeline_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `incidents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`reporterId` int NOT NULL,
	`assignedAnalystId` int,
	`title` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`incidentType` enum('phishing','malware','ddos','brute_force','data_exfiltration','other') NOT NULL,
	`affectedSystems` text,
	`severity` enum('low','medium','high','critical') NOT NULL DEFAULT 'medium',
	`status` enum('open','investigating','mitigated','resolved','false_positive') NOT NULL DEFAULT 'open',
	`riskScore` decimal(5,2) NOT NULL DEFAULT '0.00',
	`timestamp` timestamp NOT NULL,
	`reportedAt` timestamp NOT NULL DEFAULT (now()),
	`resolvedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `incidents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `systemConfig` (
	`id` int AUTO_INCREMENT NOT NULL,
	`key` varchar(255) NOT NULL,
	`value` text NOT NULL,
	`description` text,
	`isSecret` boolean NOT NULL DEFAULT false,
	`updatedBy` int,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `systemConfig_id` PRIMARY KEY(`id`),
	CONSTRAINT `systemConfig_key_unique` UNIQUE(`key`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('admin','analyst','reporter') NOT NULL DEFAULT 'reporter';--> statement-breakpoint
ALTER TABLE `users` ADD `department` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `isActive` boolean DEFAULT true NOT NULL;--> statement-breakpoint
CREATE INDEX `incident_idx` ON `aiAnalysisResults` (`incidentId`);--> statement-breakpoint
CREATE INDEX `incident_idx` ON `analystNotes` (`incidentId`);--> statement-breakpoint
CREATE INDEX `analyst_idx` ON `analystNotes` (`analystId`);--> statement-breakpoint
CREATE INDEX `user_idx` ON `auditLogs` (`userId`);--> statement-breakpoint
CREATE INDEX `incident_idx` ON `auditLogs` (`incidentId`);--> statement-breakpoint
CREATE INDEX `action_idx` ON `auditLogs` (`action`);--> statement-breakpoint
CREATE INDEX `created_at_idx` ON `auditLogs` (`createdAt`);--> statement-breakpoint
CREATE INDEX `incident_idx` ON `incidentTimeline` (`incidentId`);--> statement-breakpoint
CREATE INDEX `event_type_idx` ON `incidentTimeline` (`eventType`);--> statement-breakpoint
CREATE INDEX `reporter_idx` ON `incidents` (`reporterId`);--> statement-breakpoint
CREATE INDEX `analyst_idx` ON `incidents` (`assignedAnalystId`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `incidents` (`status`);--> statement-breakpoint
CREATE INDEX `severity_idx` ON `incidents` (`severity`);--> statement-breakpoint
CREATE INDEX `type_idx` ON `incidents` (`incidentType`);--> statement-breakpoint
CREATE INDEX `created_at_idx` ON `incidents` (`createdAt`);--> statement-breakpoint
CREATE INDEX `role_idx` ON `users` (`role`);--> statement-breakpoint
CREATE INDEX `active_idx` ON `users` (`isActive`);