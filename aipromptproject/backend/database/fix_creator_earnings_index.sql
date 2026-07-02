-- The current unique index on `purchase_id` prevents a single purchase (which has one purchase_id)
-- from generating earnings for multiple different creators. 
-- We need to drop the unique index on `purchase_id` and instead create a unique index on the combination 
-- of `purchase_id` and `creator_id` so that each creator can get their respective earnings record for a given purchase.

ALTER TABLE `creator_earnings` DROP INDEX `purchase_id`;
ALTER TABLE `creator_earnings` ADD UNIQUE INDEX `purchase_creator_unique` (`purchase_id`, `creator_id`);
