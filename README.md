<div align="center">
  <img src="public/logo.png" alt="PsyPlex Logo" width="150" height="150">
  <h1>PsyPlex</h1>
  <p><strong>AI-Powered Tools for Mental Health Professionals</strong></p>
  <p>
    <a href="#features">Features</a> •
    <a href="#installation">Installation</a> •
    <a href="#usage">Usage</a> •
    <a href="#technologies">Technologies</a> •
    <a href="#contributing">Contributing</a> •
    <a href="#license">License</a>
  </p>
</div>

## 📋 Overview

PsyPlex is a comprehensive platform that leverages AI to empower mental health professionals with innovative tools for better client care. The application streamlines client management, session notes, therapy insights, and progress tracking in one intuitive interface.

## ✨ Features

### 🧠 For Therapists

- **Client Management**: Organize and access client information efficiently
- **Session Scheduling**: Manage both in-person and virtual therapy sessions
- **Therapy Insights**: AI-powered analysis of sessions to identify patterns and progress
- **Progress Tracking**: Visual dashboards to monitor client improvement
- **Notes System**: Structured note-taking with AI assistance for better documentation

### 🔒 Security & Compliance

- **Secure Authentication**: Email/password and Google OAuth integration
- **Role-Based Access Control**: Proper authorization for all data operations
- **Data Privacy**: Designed with privacy and compliance in mind

## 🚀 Installation

### Prerequisites

- [Bun](https://bun.sh/) (v1.0.0 or higher)
- [Node.js](https://nodejs.org/) (v18.0.0 or higher)
- [Supabase](https://supabase.io/) account for the backend

### Setup

1. Clone the repository

```bash
git clone https://github.com/yourusername/psyplex.git
cd psyplex
```

2. Install dependencies using Bun

```bash
bun install
```

3. Configure environment variables

Create a `.env` file in the root directory and add your Supabase credentials:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Start the development server

```bash
bun run dev
```

The application will be available at http://localhost:8081

## 💻 Usage

### User Authentication

- Register as a new therapist or log in with existing credentials
- Google authentication option available for quicker access

### Dashboard

- View upcoming sessions, recent clients, and key metrics
- Quick access to all major platform features

### Client Management

- Add new clients with comprehensive profiles
- Track session history and progress over time

### Session Management

- Schedule new sessions with clients
- Start and record virtual sessions
- Generate AI-assisted notes

## 🛠️ Technologies

### Frontend
- **React**: UI library for building the user interface
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Radix UI**: Headless UI components for accessibility
- **React Router**: For navigation and routing
- **Supabase Auth**: Authentication and user management

### Backend
- **Supabase**: Database, authentication, and storage
- **TypeScript**: For type safety across the codebase
- **Vite**: Next generation frontend tooling

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <p>Made with ❤️ for mental health professionals</p>
  <p>© 2025 PsyPlex</p>
</div>
