-- CreateEnum
CREATE TYPE "InstructorVerificationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "accountant_profiles" ADD COLUMN     "avatar" TEXT;

-- AlterTable
ALTER TABLE "admin_profiles" ADD COLUMN     "avatar" TEXT;

-- AlterTable
ALTER TABLE "department_head_profiles" ADD COLUMN     "avatar" TEXT;

-- AlterTable
ALTER TABLE "instructor_profiles" ADD COLUMN     "additionalFiles" JSONB,
ADD COLUMN     "avatar" TEXT,
ADD COLUMN     "bio" TEXT,
ADD COLUMN     "rejectionReason" TEXT,
ADD COLUMN     "resume" TEXT,
ADD COLUMN     "resumePublicId" TEXT,
ADD COLUMN     "reviewedAt" TIMESTAMP(3),
ADD COLUMN     "reviewedBy" TEXT,
ADD COLUMN     "verificationStatus" "InstructorVerificationStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "yearsOfExperience" INTEGER;

-- AlterTable
ALTER TABLE "student_profiles" ADD COLUMN     "avatar" TEXT;

-- AlterTable
ALTER TABLE "super_admin_profiles" ADD COLUMN     "avatar" TEXT;
