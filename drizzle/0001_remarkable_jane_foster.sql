CREATE TABLE `audit_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`auditUserId` int,
	`auditAction` varchar(100) NOT NULL,
	`auditEntity` varchar(100) NOT NULL,
	`auditEntityId` int,
	`auditDetails` json,
	`ipAddress` varchar(45),
	`auditUserAgent` text,
	`auditCreatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `audit_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `bookings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` varchar(50) NOT NULL,
	`userId` int NOT NULL,
	`eventId` int NOT NULL,
	`unitId` int NOT NULL,
	`bookingStatus` enum('pending_review','approved','rejected','pending_payment','paid','cancelled','expired') NOT NULL DEFAULT 'pending_review',
	`totalAmount` decimal(12,2) NOT NULL,
	`notes` text,
	`reviewedBy` int,
	`reviewedAt` timestamp,
	`reviewerNote` text,
	`paymentMethod` varchar(50),
	`contractId` int,
	`expiresAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `bookings_id` PRIMARY KEY(`id`),
	CONSTRAINT `bookings_orderId_unique` UNIQUE(`orderId`)
);
--> statement-breakpoint
CREATE TABLE `contracts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`contractNumber` varchar(50) NOT NULL,
	`bookingId` int NOT NULL,
	`userId` int NOT NULL,
	`eventId` int,
	`contractType` enum('booth_rental','sponsorship','investment','supply','employment') NOT NULL DEFAULT 'booth_rental',
	`contractTitleAr` varchar(500),
	`contractTitleEn` varchar(500),
	`unitDetails` text,
	`contractTotalAmount` decimal(12,2) NOT NULL,
	`terms` json,
	`contractStatus` enum('draft','pending_signature','signed','active','expired','terminated') NOT NULL DEFAULT 'draft',
	`signedAt` timestamp,
	`signedByUser` boolean DEFAULT false,
	`signedByAdmin` boolean DEFAULT false,
	`pdfUrl` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `contracts_id` PRIMARY KEY(`id`),
	CONSTRAINT `contracts_contractNumber_unique` UNIQUE(`contractNumber`)
);
--> statement-breakpoint
CREATE TABLE `events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`venueId` int NOT NULL,
	`titleAr` varchar(500) NOT NULL,
	`titleEn` varchar(500) NOT NULL,
	`descriptionAr` text,
	`descriptionEn` text,
	`city` varchar(100) NOT NULL,
	`startDate` timestamp NOT NULL,
	`endDate` timestamp NOT NULL,
	`expectedVisitors` int DEFAULT 0,
	`rating` decimal(3,2) DEFAULT '0',
	`isOfficial` boolean NOT NULL DEFAULT false,
	`status` enum('draft','upcoming','active','completed','cancelled') NOT NULL DEFAULT 'draft',
	`image` text,
	`totalUnits` int DEFAULT 0,
	`availableUnits` int DEFAULT 0,
	`priceRange` varchar(100),
	`categories` json,
	`publishedAt` timestamp,
	`createdBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `invoices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`invoiceNumber` varchar(50) NOT NULL,
	`invoiceBookingId` int,
	`invoiceContractId` int,
	`invoiceUserId` int NOT NULL,
	`invoiceType` enum('booking','service','sponsorship','investment','refund') NOT NULL DEFAULT 'booking',
	`subtotal` decimal(12,2) NOT NULL,
	`vatRate` decimal(5,2) DEFAULT '15.00',
	`vatAmount` decimal(12,2) NOT NULL,
	`invoiceTotalAmount` decimal(12,2) NOT NULL,
	`currency` varchar(10) DEFAULT 'SAR',
	`invoiceStatus` enum('draft','issued','paid','overdue','cancelled','refunded') NOT NULL DEFAULT 'draft',
	`dueDate` timestamp,
	`paidAt` timestamp,
	`zatcaQrCode` text,
	`zatcaHash` varchar(255),
	`invoicePdfUrl` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `invoices_id` PRIMARY KEY(`id`),
	CONSTRAINT `invoices_invoiceNumber_unique` UNIQUE(`invoiceNumber`)
);
--> statement-breakpoint
CREATE TABLE `kyc_documents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`kycUserId` int NOT NULL,
	`documentType` enum('commercial_register','national_id','business_license','tax_certificate','bank_statement','other') NOT NULL,
	`documentNumber` varchar(100),
	`kycFileUrl` text NOT NULL,
	`kycFileName` varchar(255),
	`kycDocStatus` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`kycReviewedBy` int,
	`kycReviewedAt` timestamp,
	`rejectionReason` text,
	`expiryDate` timestamp,
	`kycCreatedAt` timestamp NOT NULL DEFAULT (now()),
	`kycUpdatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `kyc_documents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`notifUserId` int NOT NULL,
	`notifTitleAr` varchar(500) NOT NULL,
	`notifTitleEn` varchar(500) NOT NULL,
	`notifMessageAr` text NOT NULL,
	`notifMessageEn` text NOT NULL,
	`notifType` enum('booking','payment','contract','system','kyc','support','promotion') NOT NULL DEFAULT 'system',
	`notifChannel` enum('in_app','sms','email','push','whatsapp') NOT NULL DEFAULT 'in_app',
	`isRead` boolean NOT NULL DEFAULT false,
	`actionUrl` varchar(500),
	`notifMetadata` json,
	`notifCreatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`paymentInvoiceId` int NOT NULL,
	`paymentUserId` int NOT NULL,
	`paymentAmount` decimal(12,2) NOT NULL,
	`paymentCurrency` varchar(10) DEFAULT 'SAR',
	`paymentMethod` enum('tap','stripe','bank_transfer','apple_pay','mada','visa','mastercard') NOT NULL DEFAULT 'tap',
	`gateway` varchar(50),
	`gatewayTransactionId` varchar(255),
	`paymentStatus` enum('pending','processing','completed','failed','refunded','cancelled') NOT NULL DEFAULT 'pending',
	`paymentPaidAt` timestamp,
	`failureReason` text,
	`paymentMetadata` json,
	`paymentCreatedAt` timestamp NOT NULL DEFAULT (now()),
	`paymentUpdatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `payments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `promo_codes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`promoCode` varchar(50) NOT NULL,
	`discountType` enum('percentage','fixed') NOT NULL DEFAULT 'percentage',
	`discountValue` decimal(10,2) NOT NULL,
	`maxUses` int,
	`usedCount` int DEFAULT 0,
	`promoEventId` int,
	`minAmount` decimal(12,2),
	`promoExpiresAt` timestamp,
	`promoIsActive` boolean NOT NULL DEFAULT true,
	`promoCreatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `promo_codes_id` PRIMARY KEY(`id`),
	CONSTRAINT `promo_codes_promoCode_unique` UNIQUE(`promoCode`)
);
--> statement-breakpoint
CREATE TABLE `reviews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`reviewUserId` int NOT NULL,
	`reviewEventId` int,
	`reviewBookingId` int,
	`reviewRating` int NOT NULL,
	`reviewComment` text,
	`isPublic` boolean NOT NULL DEFAULT true,
	`reviewCreatedAt` timestamp NOT NULL DEFAULT (now()),
	`reviewUpdatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `reviews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `service_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`serviceEventId` int,
	`serviceNameAr` varchar(255) NOT NULL,
	`serviceNameEn` varchar(255) NOT NULL,
	`serviceDescAr` text,
	`serviceDescEn` text,
	`serviceCategory` varchar(100),
	`servicePrice` decimal(10,2) NOT NULL,
	`serviceUnit` varchar(50) DEFAULT 'piece',
	`serviceImage` text,
	`serviceIsActive` boolean NOT NULL DEFAULT true,
	`serviceCreatedAt` timestamp NOT NULL DEFAULT (now()),
	`serviceUpdatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `service_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `service_orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`soOrderNumber` varchar(50) NOT NULL,
	`soUserId` int NOT NULL,
	`soBookingId` int,
	`soItems` json,
	`soTotalAmount` decimal(12,2) NOT NULL,
	`soStatus` enum('pending','confirmed','in_progress','delivered','cancelled') NOT NULL DEFAULT 'pending',
	`soCreatedAt` timestamp NOT NULL DEFAULT (now()),
	`soUpdatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `service_orders_id` PRIMARY KEY(`id`),
	CONSTRAINT `service_orders_soOrderNumber_unique` UNIQUE(`soOrderNumber`)
);
--> statement-breakpoint
CREATE TABLE `support_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`smTicketId` int NOT NULL,
	`smUserId` int NOT NULL,
	`smMessage` text NOT NULL,
	`isStaff` boolean NOT NULL DEFAULT false,
	`smAttachmentUrl` text,
	`smCreatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `support_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `support_tickets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ticketNumber` varchar(50) NOT NULL,
	`ticketUserId` int NOT NULL,
	`subject` varchar(500) NOT NULL,
	`ticketMessage` text NOT NULL,
	`ticketCategory` enum('booking','payment','contract','technical','general','complaint') NOT NULL DEFAULT 'general',
	`priority` enum('low','medium','high','urgent') NOT NULL DEFAULT 'medium',
	`ticketStatus` enum('open','in_progress','waiting_response','resolved','closed') NOT NULL DEFAULT 'open',
	`assignedTo` int,
	`resolvedAt` timestamp,
	`ticketCreatedAt` timestamp NOT NULL DEFAULT (now()),
	`ticketUpdatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `support_tickets_id` PRIMARY KEY(`id`),
	CONSTRAINT `support_tickets_ticketNumber_unique` UNIQUE(`ticketNumber`)
);
--> statement-breakpoint
CREATE TABLE `team_members` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tmOwnerId` int NOT NULL,
	`tmName` varchar(255) NOT NULL,
	`tmEmail` varchar(320),
	`tmPhone` varchar(20),
	`tmRole` varchar(100),
	`tmPermissions` json,
	`tmAvatar` text,
	`tmIsActive` boolean NOT NULL DEFAULT true,
	`tmCreatedAt` timestamp NOT NULL DEFAULT (now()),
	`tmUpdatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `team_members_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `units` (
	`id` int AUTO_INCREMENT NOT NULL,
	`eventId` int NOT NULL,
	`zoneId` int,
	`code` varchar(50) NOT NULL,
	`type` enum('standard','premium','corner','island','kiosk','outdoor') NOT NULL DEFAULT 'standard',
	`area` decimal(10,2) NOT NULL,
	`price` decimal(12,2) NOT NULL,
	`pricePerSqm` decimal(10,2),
	`unitStatus` enum('available','reserved','sold','maintenance','blocked') NOT NULL DEFAULT 'available',
	`unitX` decimal(10,2) DEFAULT '0',
	`unitY` decimal(10,2) DEFAULT '0',
	`unitWidth` decimal(10,2) DEFAULT '0',
	`unitHeight` decimal(10,2) DEFAULT '0',
	`amenities` json,
	`trafficScore` int,
	`allowedCategories` json,
	`unitImage` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `units_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `venues` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nameAr` varchar(255) NOT NULL,
	`nameEn` varchar(255) NOT NULL,
	`city` varchar(100) NOT NULL,
	`address` text,
	`capacity` int,
	`mapImage` text,
	`latitude` decimal(10,7),
	`longitude` decimal(10,7),
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `venues_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `zones` (
	`id` int AUTO_INCREMENT NOT NULL,
	`eventId` int NOT NULL,
	`nameAr` varchar(255) NOT NULL,
	`nameEn` varchar(255) NOT NULL,
	`color` varchar(20),
	`description` text,
	`x` decimal(10,2) DEFAULT '0',
	`y` decimal(10,2) DEFAULT '0',
	`width` decimal(10,2) DEFAULT '0',
	`height` decimal(10,2) DEFAULT '0',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `zones_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','admin','merchant','investor','sponsor','supervisor') NOT NULL DEFAULT 'merchant';--> statement-breakpoint
ALTER TABLE `users` ADD `phone` varchar(20);--> statement-breakpoint
ALTER TABLE `users` ADD `company` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `activityType` varchar(100);--> statement-breakpoint
ALTER TABLE `users` ADD `region` varchar(100);--> statement-breakpoint
ALTER TABLE `users` ADD `avatar` text;--> statement-breakpoint
ALTER TABLE `users` ADD `commercialRegister` varchar(50);--> statement-breakpoint
ALTER TABLE `users` ADD `kycStatus` enum('pending','submitted','under_review','verified','rejected') DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `isActive` boolean DEFAULT true NOT NULL;