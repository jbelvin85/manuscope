# ManuScope: Early Language Acquisition Platform

ManuScope is a comprehensive, web-based application designed to support early language development, particularly for children with hearing loss. It provides a structured, engaging, and trackable flashcard-based learning system for children, managed by teachers and monitored by parents.

## About The Project

Drawing inspiration from proven methodologies like those from the Moog Center for Deaf Education, ManuScope provides a digital tool for therapists, educators, and parents. The platform facilitates vocabulary acquisition through interactive flashcard sessions, tracks student progress, and provides separate dashboards for teachers and parents to manage and observe a child's learning journey.

### Key Features:

*   **Role-Based Access:** Separate interfaces and functionalities for Teachers, Parents, and Students.
*   **Student Management:** Teachers can add and manage students, track their progress, and customize their learning path.
*   **Interactive Flashcard Sessions:** Engaging sessions for students using a library of categorized and illustrated vocabulary words.
*   **Parental Involvement:** Parents can monitor their child's progress and stay involved in the learning process through a dedicated dashboard.
*   **Structured Vocabulary:** Word lists are based on established early language curricula.

## Built With

This project is a modern web application built with a robust and scalable tech stack:

*   **Frontend:** [React](https://reactjs.org/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/)
*   **Backend:** [Node.js](https://nodejs.org/), [Express.js](https://expressjs.com/), [TypeScript](https://www.typescriptlang.org/)
*   **Database:** [PostgreSQL](https://www.postgresql.org/)
*   **Containerization:** [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/)

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

Ensure you have Docker and Docker Compose installed on your development machine.
*   [Docker Desktop](https://www.docker.com/products/docker-desktop/) (includes Docker Compose)

### Installation

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/your_username/manuscope.git
    cd manuscope
    ```
2.  **Build and run the containers:**
    Use Docker Compose to build the images and start the services in detached mode.
    ```sh
    docker compose up -d --build
    ```
    This command will start the frontend, backend, and database services. The database will be initialized with the schema located in `db/init.sql`.

## Usage

Once the containers are running, you can access the different parts of the application:

*   **Frontend Application:** Open your web browser and navigate to [http://localhost:4000](http://localhost:4000)
*   **Backend API:** The API server is accessible at `http://localhost:4001`
*   **Database:** The PostgreSQL database is running on port `5432`

You can start by creating a teacher account and then adding students to begin a flashcard session.

## Roadmap

See the `ROADMAP.md` file for a detailed list of proposed features and known issues.

## Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## License

Distributed under the MIT License. See `LICENSE` for more information.

## Contact

Project Link: [https://github.com/your_username/manuscope](https://github.com/your_username/manuscope)