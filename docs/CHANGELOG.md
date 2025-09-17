# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachanglog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Parent Frontend**: Developed a dedicated "Progress Reports" section (`ProgressReports.tsx`) for parents, providing comprehensive, period-based overviews of student learning.
- **Parent Frontend**: Implemented detailed progress visualizations (Overall Progress, Acquisition Level Distribution, Progress Over Time, Category Breakdown) on the `StudentProfile.tsx` page using `recharts`.
- **Parent Frontend**: Implemented a new parent-centric dashboard (`ParentDashboard.tsx`) with student selection and basic progress overview.
- **Parent Frontend**: Added a "Claim Student" page (`ClaimStudent.tsx`) allowing parents to associate students with their account using a claim code.
- **Parent Frontend**: Refactored `StudentProfile.tsx` to provide a simplified, parent-friendly view of student progress and assigned vocabulary.
- **Authentication**: Enhanced `AuthContext.tsx` to store and manage students associated with a logged-in parent.
- **Routing**: Integrated new parent frontend routes (`/parent`, `/claim-student`, `/student/:studentId`, `/progress-reports/:studentId`) in `main.tsx`.
- **Backend API**: Added new endpoint `GET /students/{studentId}/progress-summary` to provide aggregated data for progress visualizations.
- **Backend API**: Added new endpoint `GET /students/{studentId}/progress-report` to provide comprehensive data for detailed progress reports.

### Fixed
- **Frontend**: Resolved issue where student record changes were not showing on page reload by adding `cache: 'no-store'` to all relevant frontend fetch calls (`StudentProfile.tsx`, `ParentDashboard.tsx`, `ProgressReports.tsx`).
- **Backend**: Fixed latent bug in `updateStudentProgressFile` where `progress_file_path` in the database was not updated if the JSON file was missing on disk, ensuring data consistency.
- **Backend**: Fixed `SyntaxError: Unexpected end of JSON input` by gracefully handling empty or malformed student progress JSON files in `updateStudentProgressFile`.

### Changed
- **Frontend**: Modified `handleBulkForReviewChange` in `StudentProfile.tsx` to send bulk progress updates to the backend, improving efficiency and reliability.
- **Data Storage**: Completed migration of student progress from PostgreSQL table to JSON files.
- **Frontend**: Updated `StudentProfile.tsx`, `FlashcardSession.tsx`, and `ReviewSession.tsx` to correctly handle student progress data in JSON object format.
- **Review Word Modal**: Now displays the word's image in the review modal.
- **Review Word Modal**: Refactored to simplify UI and save level changes automatically.
- **Student Profile**: Moved "Review Words" button to the "Words for Review" section and removed the word count from the button.
- **Student Profile**: "Review Words" button now opens the new Flashcard Review Modal instead of navigating to a new page.
- **Flashcard Review Modal**: Set a fixed height for the image container to prevent the modal height from changing during review.
- **Backend**: Refactored student word progress storage from PostgreSQL table to JSON files, managed by new API endpoints.
- **Database**: `progress` table schema updated to store `progress_file_path` instead of individual word progress entries.
- **Backend**: Enhanced error logging in `updateStudentProgressFile` for file read/write and JSON parsing operations to provide more detailed debugging information.
- **Tooling**: Updated cross-platform database backup scripts (`backup_db.sh`, `backup_db.bat`) to create plain SQL dumps from Dockerized PostgreSQL databases.
- **Documentation**: Removed `docs/THE_PRIMER.md` as it is no longer needed.
- **Documentation**: Clarified documentation structure: `PARENT_GUIDE.md` and `TEACHER_GUIDE.md` are now designated as essential forward-facing documentation, while `SUMMARY.md`, `ROADMAP.md`, `CHANGELOG.md`, and `README.md` are the core living documents.