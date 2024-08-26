-- CreateTable
CREATE TABLE `BatchRecordHeader` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `documentNumber` VARCHAR(191) NOT NULL,
    `revision` VARCHAR(191) NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `family` VARCHAR(191) NOT NULL,
    `partPrefix` VARCHAR(191) NOT NULL,
    `partNumber` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `lotNumber` VARCHAR(191) NOT NULL,
    `manufactureDate` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
