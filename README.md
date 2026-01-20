# Backend Infrastructure Overview — Doxie Platform

## Purpose

This document describes **what we are building on the backend**, why the architecture exists, and how it is designed to support a **serious, production-grade SaaS product**.

This backend powers **Doxie**, a collaborative document and knowledge platform with real-time editing, autosave, versioning, organizations, and background processing.

---

## High-Level Goal

Build a backend that is:

* Production-ready from day one
* Secure and multi-tenant
* Fast for users and editors
* Scalable without rewrites
* Easy to evolve and reason about

The backend must support **real-time collaboration**, **frequent autosaves**, and **event-driven workflows** without blocking user interactions.

---

## Architectural Philosophy

We follow a **modular monolith architecture**, implemented using **Next.js App Router API routes**.

Instead of prematurely adopting microservices, we design **clear domain boundaries** inside a single backend. This provides:

* Faster development velocity
* Strong transactional consistency
* Simpler deployments
* Clean future extraction paths

Every domain is isolated at the code level so it can be extracted into a microservice later if and when scale requires it.

---

## Core Technology Stack

### Runtime & Framework

* **Next.js (App Router)** for API routes
* **TypeScript** for strong typing and maintainability
* Serverless-compatible, but not serverless-dependent

### Database Layer

* **PostgreSQL** as the primary datastore
* **Prisma ORM** for:

    * Schema definition
    * Type-safe queries
    * Migrations
* Designed for multi-tenant SaaS workloads

### Authentication & Security

* JWT-based authentication (access + refresh tokens)
* HttpOnly cookies for browser-based security
* **Argon2** for password hashing
* Role-based access control (RBAC)

### Background Processing

* **Inngest** for event-driven background jobs
* Used for:

    * Autosave persistence
    * Document exports
    * Heavy processing
    * Notifications
* Keeps API routes fast and non-blocking

### Realtime Collaboration

* Real-time collaboration is intentionally **decoupled**
* Implemented via a separate **WebSocket + Yjs** service
* Backend communicates with collaboration layer via persistence events

### Caching & Coordination

* **Redis** used for:

    * Rate limiting
    * Session coordination
    * Pub/Sub for realtime scaling
    * Token invalidation (future)

---

## Domain Structure

The backend is organized into clear domains, each responsible for a single concern.

### Authentication Domain

* User registration and login
* Token issuance and refresh
* Secure session handling
* Identity foundation for all other domains

### Organization & Membership Domain

* Multi-tenant organizations
* Membership roles (Owner, Admin, Member)
* Permission enforcement at API boundaries

### Documents Domain

* Document creation and metadata
* Ownership and access control
* Autosave entry points
* Revision history

### Revisions & Autosave

* Autosave requests are lightweight API calls
* Heavy persistence work is handled by background workers
* Revision history is preserved for auditing and recovery

### Worker / Event Domain

* All long-running or non-critical work is event-driven
* API routes emit events
* Workers consume events asynchronously

---

## Autosave & Collaboration Model

Autosave is a **first-class backend feature**.

* Clients send frequent autosave requests or emit events
* API routes validate and enqueue save events
* Background workers persist document revisions
* Optional compression and external storage for large snapshots

This design ensures:

* Fast editor responsiveness
* No UI blocking
* Safe persistence under heavy load
* Horizontal scalability

Real-time collaboration is handled by a separate WebSocket service using CRDTs (Yjs), ensuring conflict-free editing and offline resilience.

---

## Separation of Concerns

The backend enforces strict responsibility boundaries:

| Responsibility  | Layer                   |
| --------------- | ----------------------- |
| Authorization   | API routes / middleware |
| Business logic  | Service layer           |
| Persistence     | Prisma + PostgreSQL     |
| Background work | Inngest workers         |
| Realtime sync   | WebSocket/Yjs service   |
| UI rendering    | Frontend layer          |

This keeps the system maintainable as complexity grows.

---

## Scalability Strategy

The backend is designed to scale **incrementally**.

### Current scaling model

* Stateless API routes
* Connection-pooled database access
* Event-driven background jobs

### Future scaling paths

* Independent collaboration service scaling
* Independent worker service scaling
* Read replicas for PostgreSQL
* Row-level security (RLS)
* Gradual domain extraction into microservices

No architectural rewrite is required to reach these stages.

---

## Deployment Strategy

### Local Development

* Docker-based Postgres and Redis
* Prisma migrations
* Hot-reload Next.js API routes

### Production

* Frontend + API: Vercel
* Database: Managed PostgreSQL
* Cache: Managed Redis
* Workers: Inngest Cloud or self-hosted runners
* Realtime: Dedicated WebSocket service on VM or container platform

The backend is cloud-agnostic and provider-independent.

---

## Security Principles

* HTTPS everywhere
* HttpOnly and Secure cookies
* Short-lived access tokens
* Rate-limited authentication endpoints
* Strict input validation
* No direct database access from clients
* Encrypted secrets and environment variables
* Automated backups and recovery

---

## Why This Backend Exists

This backend is not a prototype.

It is designed to:

* Support real users
* Handle concurrent collaboration
* Preserve data integrity
* Scale without rewrites
* Remain understandable to future engineers

It balances **engineering rigor** with **practical delivery speed**, which is essential for building a serious SaaS product.

---

## Summary

The Doxie backend is a **modern, event-driven SaaS backend** built with Next.js, PostgreSQL, and background workers.

It is modular, secure, scalable, and intentionally designed to evolve rather than be rewritten.

This backend forms the **foundation** on which all future Doxie features will be built.
