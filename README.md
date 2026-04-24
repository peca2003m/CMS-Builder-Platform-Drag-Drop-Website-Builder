# Simple CMS - Content Management System

A modern, drag-and-drop web application for creating and managing websites without coding.

---

## 🚀 Quick Start

### Prerequisites
- **Docker** and **Docker Compose** installed
- **Node.js 18+** (for local development)
- **PostgreSQL** (handled by Docker)

---

## 📦 Installation & Running

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd cms-project
```

### 2. Set Up Environment Variables

Create a `.env` file in the `BE` folder:

```env
# Database
DATABASE_URL=postgresql://postgres:postgres@db:5432/cms

# JWT
JWT_SECRET=your_secret_key_here

# Server
PORT=5000
NODE_ENV=development

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**Get Cloudinary credentials:** https://cloudinary.com/ (free account)

### 3. Start the Application

```bash
docker compose up --build
```

This will start:
- **Database** (PostgreSQL) on port 5432
- **Backend** (Express API) on port 5000
- **Frontend** (React + Vite) on port 3000

### 4. Access the Application

Open your browser:
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **Swagger Docs:** http://localhost:5000/api-docs

---

## 📁 Project Structure

```
cms-project/
├── .github/workflows/ci-cd.yml  # GitHub Actions pipeline
├── BE/                           # Backend
│   ├── src/
│   │   ├── config/               # Database, Cloudinary, Swagger
│   │   ├── controllers/          # Business logic
│   │   ├── models/               # Data access layer
│   │   ├── routes/               # API endpoints
│   │   ├── middleware/           # JWT verification
│   │   ├── app.js                # Express app
│   │   └── server.js             # Entry point
│   ├── tests/                    # Jest tests (13)
│   ├── Dockerfile
│   └── package.json
├── FE/                           # Frontend
│   ├── src/
│   │   ├── components/           # Navbar, ProtectedRoute
│   │   ├── pages/                # Login, Dashboard, Editor, etc.
│   │   └── utils/                # API helper functions
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml            # Service orchestration
└── README.md
```

---

## 🛠️ Features

### For All Users:
- ✅ View public sites and pages
- ✅ Leave comments on published pages

### For Authors:
- ✅ Create and manage their own sites
- ✅ Drag & drop page builder (GrapesJS)
- ✅ Upload images (Cloudinary)
- ✅ Draft and publish pages

### For Admins:
- ✅ All author features
- ✅ Manage all users (view, delete)
- ✅ Delete any site
- ✅ Delete comments

---
## 📊 External APIs

The project uses **4 external APIs**:

1. **Cloudinary** - Cloud storage for production images
2. **GrapesJS** - WYSIWYG page builder framework
3. **Picsum Photos** - Random images generator for design
4. **Chart.js** - Data visualization on dashboard

---

## 🔧 Development

### Stop All Containers
```bash
docker compose down
```

### Rebuild Containers
```bash
docker compose up --build
```

---

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Sites
- `GET /api/sites/public` - Get all public sites
- `POST /api/sites` - Create site (auth required)
- `DELETE /api/sites/:id` - Delete site (auth required)

### Pages
- `GET /api/pages/site/:siteId` - Get pages by site
- `POST /api/pages` - Create page (auth required)
- `PUT /api/pages/:id` - Update page (auth required)
- `POST /api/pages/:id/publish` - Publish page (auth required)

### Media
- `POST /api/media` - Upload image (auth required)
- `GET /api/media/site/:siteId` - Get media by site

### Comments
- `POST /api/comments` - Add comment (public)
- `GET /api/comments/page/:pageId` - Get comments
- `DELETE /api/comments/:id` - Delete comment (admin only)

### Admin
- `GET /api/admin/users` - Get all users (admin only)
- `DELETE /api/admin/users/:id` - Delete user (admin only)

Full API documentation: http://localhost:5000/api-docs

---

## 🔐 Security

- JWT authentication
- Bcrypt password hashing
- CORS protection
- SQL Injection
- XSS (Cross-Site Scripting)
- Helmet.js
- Role-based authorization

---

## 🛠️ Technologies

### Backend
- **Node.js** + **Express.js** - REST API server
- **PostgreSQL** - Relational database
- **JWT** - User authentication
- **Bcrypt** - Password hashing
- **Cloudinary** - Cloud storage for images
- **Swagger** - API documentation
- **Helmet.js** - Security headers
- **Jest & Supertest** - Automated testing (13 tests)

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **React Router** - Client-side routing
- **Tailwind CSS** - Styling framework
- **GrapesJS** - WYSIWYG page builder
- **Chart.js** - Data visualization

### DevOps
- **Docker & Docker Compose** - Containerization
- **GitHub Actions** - CI/CD pipeline

---

## 🌿 Git Strategy

The project follows **Git Flow** strategy with a clear branch hierarchy.

### Main Branches:

- **`main`** - Stable production version
- **`develop`** - Integration branch for development

### Feature Branches:

- **`feature/UI`** - GrapesJS page builder integration
- **`feature/security+chart.js`** - Helmet, Cors + Chart.js visualization
- **`feature/externAPI`** - Cloudinary cloud storage integration
- **`feature/tests+pipeline`** - Jest + Supertest automated testing + GitHub pipeline

### Git Flow Diagram:

```
main (production)
  ↑
  └── develop (integration)
        ↑
        ├── feature/UI
        ├── feature/security+chart.js
        ├── feature/externAPI
        └── feature/tests+pipeline
```

### Branch Commands:

```bash
# List all branches
git branch -a

# Switch to a branch
git checkout feature/UI

# Create new feature branch
git checkout -b feature/new-feature
```

---

## 🧪 Testing

### Automated Tests (Jest + Supertest)

The project contains **13 integration tests** divided into 3 suites:

- **Auth API Tests** (6 tests) - Registration, login, JWT verification
- **Sites API Tests** (4 tests) - CRUD operations for sites
- **Pages API Tests** (3 tests) - CRUD operations for pages

### Run Tests:

```bash
cd BE
npm test
```

**Result:**
```
Test Suites: 3 passed, 3 total
Tests:       13 passed, 13 total
Time:        5.534 s
```

### CI/CD Pipeline

GitHub Actions automatically runs tests on every push:

```yaml
# .github/workflows/ci-cd.yml
- Run tests (PostgreSQL in Docker container)
- Build Docker images (Backend + Frontend)
- Push to Docker Hub (only if tests pass)
```

---

## 👥 Contributors

- Petar Mitrović (2022/0179)
- Mihailo Obradović (2022/0106)
- Gianluca Bartoli (2023/1074)