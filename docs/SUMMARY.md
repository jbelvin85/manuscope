# ManuScope Project Summary

## 1. Core Purpose & Vision

ManuScope is a web-based platform designed to support early language acquisition for children, especially those with hearing loss. It provides a structured, flashcard-based learning system managed by teachers and monitored by parents, inspired by methodologies from the Moog Center for Deaf Education.

## 2. Technology Stack

*   **Frontend:** React, TypeScript, Vite
*   **Backend:** Node.js, Express.js, TypeScript
*   **Database:** PostgreSQL
*   **Containerization:** Docker & Docker Compose

## 3. Application Architecture

*   **Monorepo Structure:** The project is organized with separate `frontend`, `backend`, and `db` directories.
*   **Role-Based Access:** The system has distinct interfaces and capabilities for three user roles:
    *   **Teacher:** Manages students, assigns vocabulary goals, and tracks progress.
    *   **Parent:** Monitors their child's progress and facilitates flashcard sessions.
    *   **Student:** (Implicitly) Interacts with the flashcard system guided by a parent.
*   **Data Flow:**
    *   The frontend (React) communicates with the backend (Node.js/Express) via a REST API.
    *   The backend services business logic and interacts with the PostgreSQL database.
    *   A significant recent change involves storing student word progress in individual JSON files instead of directly in the database to improve performance and simplify data management.

## 4. Current Status & Recent Activity

The project is in **Phase 2 (Enhanced Features)** of its roadmap.

### Completed (Phase 1):
*   Core application infrastructure (Docker, TypeScript).
*   User authentication system for Teachers and Parents.
*   Seeded database with the initial 100-word vocabulary list.
*   MVP dashboards for both Teachers and Parents.
*   Basic student and goal management.

### Recent Developments (from Changelog):
*   **Flashcard Review System:** Significant work has been done on a "Review Word Modal," allowing for a streamlined review process directly from the student's profile.
*   **Data Storage Refactor:** Student word progress has been moved from a monolithic database table into individual JSON files. This is a critical architectural shift. The `progress` table now stores a file path to the JSON file.
*   **UI/UX Refinements:** Various improvements to the student profile and review modals to enhance usability.
*   **Tooling:** Cross-platform database backup scripts have been improved.

## 5. Next Steps & Future Goals

### Immediate Focus (Phase 2):
*   **Visual Progress Dashboards:** Implementing charts and graphs for better progress visualization.
*   **Communication/Notes System:** Building a feature for teachers and parents to share notes on a student's progress.
*   **Rich Media:** Integrating sign language videos and audio pronunciations into the flashcard system.

### Long-Term Vision (Phase 3):
*   **Vocabulary Expansion:** Adding more extensive word lists.
*   **Administrative Dashboard:** Creating a super-user role for managing schools and teachers.
*   **Offline Functionality:** Enabling the use of flashcards without an internet connection.
*   **Printable Resources:** Generating printable reports and flashcards.
