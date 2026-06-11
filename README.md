# **Async Video Collaboration Platform**

A Loom-inspired video collaboration platform that enables teams to record, upload, organize, and discuss videos asynchronously through workspaces and threaded collaboration.

## **Live Demo**

async-ai-video-platform.vercel.app

## **Screenshots**
<img width="1849" height="839" alt="Screenshot 2026-06-11 174633" src="https://github.com/user-attachments/assets/822f0710-fc6e-40c5-850c-dd84151321f2" />

## **Features**

### Authentication
- Secure authentication
- Session management
- Protected routes

### Video Management
- Screen recording
- Camera recording
- Video upload
- Thumbnail generation
- Visibility controls

### Workspaces
- Create workspaces
- Invite members
- Accept / Reject invitations
- Owner-member role system

### Collaboration
- Video comments
- Team discussion
- Workspace video sharing

### Storage
- AWS S3 video storage
- Secure file handling

### Dashboard
- Personal videos
- Workspace videos
- Analytics overview

## ** Architecture**

User
↓
Next.js Frontend
↓
Next.js API Routes
↓
Prisma ORM
↓
PostgreSQL

Video Upload
↓
AWS S3

Workspace
↓
RBAC
↓
Comments
↓
Collaboration

## **Tech Stack**

Frontend
- Next.js 15
- TypeScript
- TailwindCSS
- Shadcn UI

Backend
- Next.js Route Handlers
- Prisma ORM

Database
- PostgreSQL

Storage
- AWS S3

Authentication
- Better Auth


## **What I Learned**

Building this project helped me understand:

- Authentication flows
- Session management
- Role Based Access Control (RBAC)
- File uploads to AWS S3
- Database modeling with Prisma
- Workspace collaboration systems
- Video processing workflows
- Full-stack deployment
