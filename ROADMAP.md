# ManuScope Project Roadmap

This document outlines the development goals for the ManuScope project. It is a living document that will be updated as we complete features and add new ones.

## Phase 1: Core Functionality & MVP

### Core Application
- [x] Setup project structure (frontend, backend, db).
- [x] Dockerize the application for easy deployment.
- [x] Implement basic frontend-backend communication.
- [x] Migrate project to TypeScript.

### User Authentication
- [ ] Implement user creation with email, password, and role (Teacher/Parent).
- [ ] Implement user login for both Teacher and Parent roles.
- [ ] Secure password storage (using bcrypt).
- [ ] Role-based access control (directing users to the correct dashboard).

### Vocabulary Database
- [ ] Create a database schema for all necessary tables (users, students, words, etc.).
- [ ] Seed the database with the Moog Center's first 100 vocabulary words.
- [ ] Words should be categorized (e.g., food, animals, household).

### Teacher Features (MVP)
- [ ] **Teacher Dashboard:**
    - [ ] View a list of all students.
    - [ ] Quick-view progress for each student.
- [ ] **Student Management:**
    - [ ] Create new student profiles.
    - [ ] View a detailed profile for each student.
- [ ] **Goal Management:**
    - [ ] Assign vocabulary goals to students from the Moog 100 list.

### Parent Features (MVP)
- [ ] **Parent Dashboard:**
    - [ ] View their child's assigned vocabulary goals.
    - [ ] A button to start a flashcard session.
- [ ] **Flashcard System:**
    - [ ] Display flashcards for the child's current vocabulary goals.
    - [ ] Each card should show the word and a corresponding image/icon.
    - [ ] Ability for the parent to mark progress (e.g., "Practicing", "Mastered").

## Phase 2: Enhanced Features

### Progress Tracking
- [ ] **Visual Dashboards:**
    - [ ] Display progress charts on both Teacher and Parent dashboards (e.g., % mastered, words in progress).
    - [ ] Show vocabulary growth over time with graphs.

### Communication
- [ ] **Notes System:**
    - [ ] Teachers can add notes about a student's progress in class.
    - [ ] Parents can add notes about a child's word usage at home.
    - [ ] Notes should be visible to both the teacher and the parent.

### Media & Content
- [ ] **Sign Language Videos:**
    - [ ] Link each word in the database to a sign language video.
    - [ ] Display the video on the flashcard.
- [ ] **Audio Support:**
    - [ ] Add optional audio pronunciation for each word.

## Phase 3: Long-Term Goals & Expansion

### Vocabulary Expansion
- [ ] Add the Moog Center's 150 and 300-word lists to the database.
- [ ] Allow teachers to select which list to use for goals.

### Administrative Features
- [ ] **Admin Dashboard:**
    - [ ] A super-user role to manage schools and teacher accounts.

### Offline Functionality
- [ ] Allow parents to use the flashcard system offline.
- [ ] Sync progress with the server when the connection is restored.

### Printable Resources
- [ ] **Printable Flashcards:**
    - [ ] Generate a PDF of flashcards from the vocabulary lists.
    - [ ] Optimize for easy printing and cutting.
- [ ] **Printable Reports:**
    - [ ] Allow teachers to print progress reports for students.

