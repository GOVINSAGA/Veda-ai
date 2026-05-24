# VedaAI: Development Approach & Methodology

This document outlines the end-to-end approach taken to architect, develop, and deploy the VedaAI Assessment Creator. The project was built with a focus on **pixel-perfect UI fidelity**, **asynchronous scalability**, and **production-ready infrastructure**.

---

## 1. System Architecture & Tech Stack Selection
The first step was selecting a stack capable of handling real-time updates and long-running AI tasks without timing out standard HTTP requests.

* **Frontend:** Next.js 16 (App Router), React, Zustand (Global State)
* **Backend:** Node.js, Express, TypeScript
* **Database & Cache:** MongoDB (Persistence), Redis (Queue state & Cache)
* **Message Broker:** BullMQ
* **Real-time:** WebSockets (`ws`)
* **AI Provider:** NVIDIA Llama 3.1 API (via OpenAI SDK wrapper)
* **Infrastructure:** Docker, Nginx, GitHub Actions (CI/CD), OCI (Oracle Cloud)

## 2. Frontend: Pixel-Perfect Design Implementation
The UI was meticulously crafted based on the provided Figma designs.
* **Vanilla CSS over Frameworks:** Instead of relying on Tailwind CSS or component libraries (which often dictate rigid constraints), a custom Design System was built in `globals.css` utilizing CSS variables for colors, typography, and spacing. This ensured **100% fidelity** to the Figma mockups.
* **State Management:** `Zustand` was chosen over Redux for its lightweight, boilerplate-free approach to managing complex global state, specifically the multi-step form data and the live AI generation progress.
* **Component Architecture:** The UI was split into reusable, modular components (`Sidebar`, `TopBar`, `AssignmentCard`) to keep the codebase clean and maintainable.

## 3. Backend: Asynchronous AI Pipeline
Directly awaiting LLM responses over standard HTTP requests leads to poor UX and browser timeouts (especially for large curriculum generation). To solve this, an asynchronous, event-driven architecture was designed:

1. **Ingestion (`Express API`):** When a teacher submits a syllabus (PDF/Text) and parameters, the API immediately saves a "Pending" record in MongoDB and returns a `202 Accepted` response.
2. **Queueing (`BullMQ + Redis`):** The task is offloaded to a Redis-backed background queue.
3. **Processing (`Worker Node`):** A dedicated worker picks up the job and executes the heavy AI lifting without blocking the main server thread.
4. **Prompt Engineering:** The NVIDIA Llama 3.1 model was heavily prompted with strict constraints to output data in a highly structured, predictable **JSON format** (Section arrays containing Question objects with varying difficulties).
5. **Real-Time Delivery (`WebSockets`):** As the background worker progresses, it emits WebSocket events to the client. The frontend listens to these events to show a live "Processing" spinner, instantly redirecting the user to the rendered paper the moment the AI completes the task.

## 4. Production Containerization
To ensure the application runs identically on any machine, the entire stack was Dockerized.
* **Multi-Stage Builds:** Custom Dockerfiles were written for both the Client and Server. The Next.js frontend utilizes the `standalone` output trace, drastically reducing the final Docker image size by excluding unnecessary `node_modules`.
* **Orchestration:** `docker-compose.prod.yml` was created to seamlessly link the Client, Server, MongoDB, and Redis containers together on a shared internal network.

## 5. CI/CD & Cloud Deployment (Oracle Cloud)
The deployment strategy was designed to be fully automated and conflict-free.

* **Automated Pipeline:** A GitHub Actions workflow (`deploy.yml`) was engineered to trigger on every push to the `master` branch. It automatically builds the Docker images and publishes them to the GitHub Container Registry (GHCR).
* **Zero-Downtime Deployment:** The Action securely SSHs into the OCI VM, pulls the latest images, and restarts the containers automatically.
* **Reverse Proxy Architecture:** Because the OCI VM was already hosting other projects (like Konix), a **Host Nginx Master Proxy** was configured. Nginx acts as the "Traffic Controller" on ports 80/443, inspecting incoming domain requests and seamlessly routing `vedaai.govinsaga.pp.ua` traffic to the VedaAI Docker containers, and `konix` traffic to the Konix containers.
* **Security:** Let's Encrypt (Certbot) was utilized to secure the domain with a trusted SSL/HTTPS certificate.

## Summary
By separating the UI rendering from the heavy AI generation via background queues and WebSockets, the resulting application is highly resilient. The custom CSS guarantees strict design adherence, while the Dockerized CI/CD pipeline ensures the application is truly production-ready and easily scalable.
