-- DropIndex
DROP INDEX `User.display_login_index` ON `User`;

-- CreateIndex
CREATE INDEX `User.display_login_inPrivateZone_index` ON `User`(`display`, `login`, `inPrivateZone`);
