-- =============================================================================
-- Migration: Refactor Submission Flow — Old Statuses → New 10-Status System
-- =============================================================================
-- This migration:
--   1. Maps existing book_chapter_submissions status data to new values
--   2. Alters the enum_book_chapter_submissions_status enum type (Sequelize-managed)
--   3. Maps existing individual_chapters status data to new values
--   4. Alters the chapter_status_enum type (manually-managed)
--   5. Alters chapter_status_history previous_status / new_status enums
--   6. Maps string values in book_chapter_status_history
--   7. Adds isbn, doi, designated_editor_id columns (if not exist)
-- =============================================================================

BEGIN;

-- =====================================================================
-- STEP 1: Submission-level status migration
-- =====================================================================

-- 1a. Convert status column to VARCHAR temporarily to hold new values
ALTER TABLE book_chapter_submissions 
    ALTER COLUMN status TYPE VARCHAR(50) USING status::VARCHAR;

-- 1b. Map old status values to new values
UPDATE book_chapter_submissions SET status = 'ABSTRACT_SUBMITTED'      WHERE status = 'INITIAL_SUBMITTED';
UPDATE book_chapter_submissions SET status = 'MANUSCRIPTS_PENDING'     WHERE status IN ('MANUSCRIPT_PENDING', 'FULL_CHAPTER_PENDING', 'EDITOR_ACCEPTED', 'ASSIGNED_TO_EDITOR');
UPDATE book_chapter_submissions SET status = 'REVIEWER_ASSIGNMENT'     WHERE status IN ('REVIEWERS_ASSIGNED', 'REVIEWER_PENDING_ACCEPTANCE', 'FULL_CHAPTER_SUBMITTED');
UPDATE book_chapter_submissions SET status = 'UNDER_REVIEW'            WHERE status IN ('EDITOR_REVIEWING', 'REVISION_REQUESTED', 'REVISION_SUBMITTED', 'REVIEWER_REVIEWING');
-- UNDER_REVIEW already maps to UNDER_REVIEW, no update needed
UPDATE book_chapter_submissions SET status = 'EDITORIAL_REVIEW'        WHERE status IN ('REVIEW_COMPLETED', 'EDITOR_FINAL_REVIEW');
-- APPROVED, PUBLISHED already match, no update needed
UPDATE book_chapter_submissions SET status = 'REJECTED'                WHERE status IN ('EDITOR_REJECTED', 'WITHDRAWN');
-- REJECTED already matches, no update needed

-- 1c. Drop the default and then the old enum type
ALTER TABLE book_chapter_submissions ALTER COLUMN status DROP DEFAULT;
DROP TYPE IF EXISTS "enum_book_chapter_submissions_status";

-- 1d. Create new enum type with 10 values
CREATE TYPE "enum_book_chapter_submissions_status" AS ENUM (
    'ABSTRACT_SUBMITTED',
    'MANUSCRIPTS_PENDING',
    'REVIEWER_ASSIGNMENT',
    'UNDER_REVIEW',
    'EDITORIAL_REVIEW',
    'APPROVED',
    'ISBN_APPLIED',
    'PUBLICATION_IN_PROGRESS',
    'PUBLISHED',
    'REJECTED'
);

-- 1e. Convert back to enum
ALTER TABLE book_chapter_submissions 
    ALTER COLUMN status TYPE "enum_book_chapter_submissions_status" 
    USING status::"enum_book_chapter_submissions_status";

ALTER TABLE book_chapter_submissions 
    ALTER COLUMN status SET DEFAULT 'ABSTRACT_SUBMITTED'::"enum_book_chapter_submissions_status";

-- Verify no unmapped values remain
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM book_chapter_submissions WHERE status::text NOT IN ('ABSTRACT_SUBMITTED','MANUSCRIPTS_PENDING','REVIEWER_ASSIGNMENT','UNDER_REVIEW','EDITORIAL_REVIEW','APPROVED','ISBN_APPLIED','PUBLICATION_IN_PROGRESS','PUBLISHED','REJECTED')) THEN
        RAISE EXCEPTION 'Unmapped submission status values found!';
    END IF;
END $$;


-- =====================================================================
-- STEP 2: Chapter-level status migration
-- =====================================================================

-- 2a. Convert status column to VARCHAR temporarily
ALTER TABLE individual_chapters 
    ALTER COLUMN status DROP DEFAULT;

ALTER TABLE individual_chapters 
    ALTER COLUMN status TYPE VARCHAR(50) USING status::VARCHAR;

-- 2b. Map old chapter status values to new values
UPDATE individual_chapters SET status = 'MANUSCRIPTS_PENDING'         WHERE status IN ('MANUSCRIPT_PENDING', 'ABSTRACT_ACCEPTED');
UPDATE individual_chapters SET status = 'REVIEWER_ASSIGNMENT'         WHERE status IN ('REVIEWERS_ASSIGNED', 'REVIEWER_PENDING_ACCEPTANCE', 'MANUSCRIPT_SUBMITTED');
UPDATE individual_chapters SET status = 'EDITORIAL_REVIEW'            WHERE status IN ('REVIEW_COMPLETED', 'EDITOR_FINAL_REVIEW');
UPDATE individual_chapters SET status = 'CHAPTER_REJECTED'            WHERE status = 'ABSTRACT_REJECTED';
-- Remove PUBLISHED from chapters (now only submission-level)
UPDATE individual_chapters SET status = 'CHAPTER_APPROVED'            WHERE status = 'PUBLISHED';
-- ABSTRACT_SUBMITTED, UNDER_REVIEW, REVISION_REQUESTED, REVISION_SUBMITTED, CHAPTER_APPROVED, CHAPTER_REJECTED already match


-- =====================================================================
-- STEP 3: Chapter status history migration
-- =====================================================================

-- 3a. Convert status columns to VARCHAR temporarily
ALTER TABLE chapter_status_history
    ALTER COLUMN previous_status TYPE VARCHAR(50) USING previous_status::VARCHAR;

ALTER TABLE chapter_status_history
    ALTER COLUMN new_status TYPE VARCHAR(50) USING new_status::VARCHAR;

-- 3b. Map old values in history
UPDATE chapter_status_history SET previous_status = 'MANUSCRIPTS_PENDING'     WHERE previous_status IN ('MANUSCRIPT_PENDING', 'ABSTRACT_ACCEPTED');
UPDATE chapter_status_history SET previous_status = 'REVIEWER_ASSIGNMENT'     WHERE previous_status IN ('REVIEWERS_ASSIGNED', 'REVIEWER_PENDING_ACCEPTANCE', 'MANUSCRIPT_SUBMITTED');
UPDATE chapter_status_history SET previous_status = 'EDITORIAL_REVIEW'        WHERE previous_status IN ('REVIEW_COMPLETED', 'EDITOR_FINAL_REVIEW');
UPDATE chapter_status_history SET previous_status = 'CHAPTER_REJECTED'        WHERE previous_status = 'ABSTRACT_REJECTED';
UPDATE chapter_status_history SET previous_status = 'CHAPTER_APPROVED'        WHERE previous_status = 'PUBLISHED';

UPDATE chapter_status_history SET new_status = 'MANUSCRIPTS_PENDING'     WHERE new_status IN ('MANUSCRIPT_PENDING', 'ABSTRACT_ACCEPTED');
UPDATE chapter_status_history SET new_status = 'REVIEWER_ASSIGNMENT'     WHERE new_status IN ('REVIEWERS_ASSIGNED', 'REVIEWER_PENDING_ACCEPTANCE', 'MANUSCRIPT_SUBMITTED');
UPDATE chapter_status_history SET new_status = 'EDITORIAL_REVIEW'        WHERE new_status IN ('REVIEW_COMPLETED', 'EDITOR_FINAL_REVIEW');
UPDATE chapter_status_history SET new_status = 'CHAPTER_REJECTED'        WHERE new_status = 'ABSTRACT_REJECTED';
UPDATE chapter_status_history SET new_status = 'CHAPTER_APPROVED'        WHERE new_status = 'PUBLISHED';


-- =====================================================================
-- STEP 4: Replace the chapter_status_enum type
-- =====================================================================

-- 4a. Drop old enum type
DROP TYPE IF EXISTS chapter_status_enum;

-- 4b. Create new enum type with 10 values
CREATE TYPE chapter_status_enum AS ENUM (
    'ABSTRACT_SUBMITTED',
    'MANUSCRIPTS_PENDING',
    'REVIEWER_ASSIGNMENT',
    'UNDER_REVIEW',
    'REVISION_REQUESTED',
    'ADDITIONAL_REVISION_REQUESTED',
    'REVISION_SUBMITTED',
    'EDITORIAL_REVIEW',
    'CHAPTER_APPROVED',
    'CHAPTER_REJECTED'
);

-- 4c. Convert columns back to new enum type
ALTER TABLE individual_chapters 
    ALTER COLUMN status TYPE chapter_status_enum 
    USING status::chapter_status_enum;

ALTER TABLE individual_chapters 
    ALTER COLUMN status SET DEFAULT 'ABSTRACT_SUBMITTED'::chapter_status_enum;

ALTER TABLE chapter_status_history
    ALTER COLUMN previous_status TYPE chapter_status_enum 
    USING previous_status::chapter_status_enum;

ALTER TABLE chapter_status_history
    ALTER COLUMN new_status TYPE chapter_status_enum 
    USING new_status::chapter_status_enum;


-- =====================================================================
-- STEP 5: Book chapter status history (STRING column — just update data)
-- =====================================================================

UPDATE book_chapter_status_history SET "previousStatus" = 'ABSTRACT_SUBMITTED'      WHERE "previousStatus" = 'INITIAL_SUBMITTED';
UPDATE book_chapter_status_history SET "previousStatus" = 'MANUSCRIPTS_PENDING'     WHERE "previousStatus" IN ('MANUSCRIPT_PENDING', 'FULL_CHAPTER_PENDING', 'EDITOR_ACCEPTED', 'ASSIGNED_TO_EDITOR');
UPDATE book_chapter_status_history SET "previousStatus" = 'REVIEWER_ASSIGNMENT'     WHERE "previousStatus" IN ('REVIEWERS_ASSIGNED', 'REVIEWER_PENDING_ACCEPTANCE', 'FULL_CHAPTER_SUBMITTED');
UPDATE book_chapter_status_history SET "previousStatus" = 'UNDER_REVIEW'            WHERE "previousStatus" IN ('EDITOR_REVIEWING', 'REVISION_REQUESTED', 'REVISION_SUBMITTED', 'REVIEWER_REVIEWING');
UPDATE book_chapter_status_history SET "previousStatus" = 'EDITORIAL_REVIEW'        WHERE "previousStatus" IN ('REVIEW_COMPLETED', 'EDITOR_FINAL_REVIEW');
UPDATE book_chapter_status_history SET "previousStatus" = 'REJECTED'                WHERE "previousStatus" IN ('EDITOR_REJECTED', 'WITHDRAWN');

UPDATE book_chapter_status_history SET "newStatus" = 'ABSTRACT_SUBMITTED'      WHERE "newStatus" = 'INITIAL_SUBMITTED';
UPDATE book_chapter_status_history SET "newStatus" = 'MANUSCRIPTS_PENDING'     WHERE "newStatus" IN ('MANUSCRIPT_PENDING', 'FULL_CHAPTER_PENDING', 'EDITOR_ACCEPTED', 'ASSIGNED_TO_EDITOR');
UPDATE book_chapter_status_history SET "newStatus" = 'REVIEWER_ASSIGNMENT'     WHERE "newStatus" IN ('REVIEWERS_ASSIGNED', 'REVIEWER_PENDING_ACCEPTANCE', 'FULL_CHAPTER_SUBMITTED');
UPDATE book_chapter_status_history SET "newStatus" = 'UNDER_REVIEW'            WHERE "newStatus" IN ('EDITOR_REVIEWING', 'REVISION_REQUESTED', 'REVISION_SUBMITTED', 'REVIEWER_REVIEWING');
UPDATE book_chapter_status_history SET "newStatus" = 'EDITORIAL_REVIEW'        WHERE "newStatus" IN ('REVIEW_COMPLETED', 'EDITOR_FINAL_REVIEW');
UPDATE book_chapter_status_history SET "newStatus" = 'REJECTED'                WHERE "newStatus" IN ('EDITOR_REJECTED', 'WITHDRAWN');


-- =====================================================================
-- STEP 6: Add new columns (safe — uses IF NOT EXISTS pattern)
-- =====================================================================

-- Add isbn column to book_chapter_submissions
DO $$ BEGIN
    ALTER TABLE book_chapter_submissions ADD COLUMN isbn VARCHAR(30);
EXCEPTION
    WHEN duplicate_column THEN NULL;
END $$;

-- Add doi column to book_chapter_submissions
DO $$ BEGIN
    ALTER TABLE book_chapter_submissions ADD COLUMN doi VARCHAR(100);
EXCEPTION
    WHEN duplicate_column THEN NULL;
END $$;

-- Add designated_editor_id column to book_chapter_submissions
DO $$ BEGIN
    ALTER TABLE book_chapter_submissions ADD COLUMN "designatedEditorId" INTEGER REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL;
EXCEPTION
    WHEN duplicate_column THEN NULL;
END $$;


-- =====================================================================
-- STEP 7: Insert migration record
-- =====================================================================

INSERT INTO "SequelizeMeta" (name) 
VALUES ('20260220-refactor-submission-flow.sql')
ON CONFLICT (name) DO NOTHING;

COMMIT;
