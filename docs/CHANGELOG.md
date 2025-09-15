# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed
- **Review Word Modal**: Now displays the word's image in the review modal.
- **Review Word Modal**: Refactored to simplify UI and save level changes automatically.
- **Student Profile**: Moved "Review Words" button to the "Words for Review" section and removed the word count from the button.
- **Student Profile**: "Review Words" button now opens the new Flashcard Review Modal instead of navigating to a new page.
- **Flashcard Review Modal**: Set a fixed height for the image container to prevent the modal height from changing during review.
- **Backend**: Refactored student word progress storage from PostgreSQL table to JSON files, managed by new API endpoints.
- **Database**: `progress` table schema updated to store `progress_file_path` instead of individual word progress entries.
- **Tooling**: Updated cross-platform database backup scripts (`backup_db.sh`, `backup_db.bat`) to create plain SQL dumps from Dockerized PostgreSQL databases.
