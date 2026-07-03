-- 1. Add the new columns. Provide temporary defaults for the required ones so the existing 4 rows don't crash the database.
ALTER TABLE "ScanHistory" 
  ADD COLUMN "estimatedPrice" DECIMAL(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN "qualityScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
  ADD COLUMN "isArtwork" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "summary" TEXT;

-- 2. Modify the existing columns that are becoming optional.
ALTER TABLE "ScanHistory" 
  ALTER COLUMN "predictedMaterial" DROP NOT NULL,
  ALTER COLUMN "confidenceScore" DROP NOT NULL;

-- 3. Immediately drop the temporary defaults so future records are strictly required to provide these values.
ALTER TABLE "ScanHistory" 
  ALTER COLUMN "estimatedPrice" DROP DEFAULT,
  ALTER COLUMN "qualityScore" DROP DEFAULT;