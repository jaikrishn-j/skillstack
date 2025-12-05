# SkillStack

SkillStack is a comprehensive learning management and resource-tracking tool designed to help you organize your learning, monitor progress, and gain AI-powered insights to improve productivity and skill development.

---

## Features

### Resource & Learning Management
- Add and edit learning resources (courses, books, videos, articles, etc.)
- Create custom **resource types** and **platforms** dynamically
- Manage and update the status of each resource (Not Started, In Progress, Completed)

### Time Tracking
- Log hours spent on each resource
- Track and review learning progress over time

### Dashboards & Analytics
- Visual dashboard for analyzing individual resources
- Course completion visualization and progress tracking

### AI-Powered Insights
- **Notes Summarization**: Generate AI summaries of your notes
- **Predictive Completion**: AI-based estimated completion time for each resource
- **Automatic Categorization**: Smart AI categorizing and tagging of resources

---

## Project Structure

SkillStack consists of a **frontend**, **backend**, and **database**, all containerized using Docker.

### Backend
- Built with **FastAPI**
- Handles resources, authentication, analytics, AI insights, and all API endpoints

### Frontend
- Developed using **Vite**
- Uses **shadcn UI components** for a clean, responsive interface

### Database
- Uses **PostgreSQL**, included as part of the Docker Compose setup

### Docker Setup
The Docker configuration includes:
- PostgreSQL database container  
- FastAPI backend container  
- Vite + shadcn UI frontend container  

These services are automatically built and orchestrated through Docker Compose.

---

## Installation

Getting started with SkillStack is straightforward.

### 1. Install Docker
Ensure Docker is installed and running on your system.  
Download from: https://www.docker.com/get-started/

---
### 2. Edit the docker-compose.yml
Ensure to change the user and password for postgresql.  
Add Gemini API key for AI insights.


### 3. Clone the Repository

```bash
git clone https://github.com/jaikrishn-j/skillstack.git
cd skillstack
docker compose up -d
