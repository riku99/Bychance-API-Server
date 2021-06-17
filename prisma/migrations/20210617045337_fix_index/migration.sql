-- DropIndex
DROP INDEX `User.display_index` ON `User`;

-- CreateIndex
CREATE INDEX `User.display_login_index` ON `User`(`display`, `login`);

-- CreateIndex
CREATE INDEX `User.accessToken_index` ON `User`(`accessToken`);
