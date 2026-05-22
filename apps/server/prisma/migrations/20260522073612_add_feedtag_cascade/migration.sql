-- DropForeignKey
ALTER TABLE "FeedTag" DROP CONSTRAINT "FeedTag_feedId_fkey";

-- AddForeignKey
ALTER TABLE "FeedTag" ADD CONSTRAINT "FeedTag_feedId_fkey" FOREIGN KEY ("feedId") REFERENCES "Feed"("id") ON DELETE CASCADE ON UPDATE CASCADE;
