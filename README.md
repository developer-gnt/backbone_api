# Backbone API

A comprehensive backend system for managing inspection and quality assurance workflows with order tracking, team collaboration, and financial management capabilities.

---

## Overview

Backbone API is an enterprise-grade backend platform designed to manage complex inspection and quality assurance operations. The system enables organizations to accept orders for various inspection types (including property inspections and UAD evaluations), assign work to supervisors and team members, track order progress through customizable workflows, and process payments securely. Teams can collaborate on orders through built-in messaging, share documents and attachments, and generate comprehensive reports on organizational performance and order analytics.

Built with scalability and security in mind, the platform provides role-based access control, audit trails for all activities, multiple payment options (PayPal integration), PDF and Excel export capabilities, and flexible pricing models tailored to different client needs.

---

## Key Capabilities

* **Order Management** — Create, track, and manage inspection orders with full lifecycle support from initial submission through completion and delivery to clients
* **Team Assignment & Workflow** — Assign orders to supervisors and team members with status tracking, enabling clear accountability and work management
* **Order Collaboration** — Enable client-team communication through built-in messaging for each order, facilitating clarifications and updates without leaving the platform
* **Attachment Management** — Support large file uploads (up to 2GB) for order documentation, working files, and completed deliverables with organized storage
* **Flexible Pricing & Packages** — Define and manage multiple service packages with customizable pricing, TAT (turnaround time) options, and client-specific pricing configurations
* **Payment Processing** — Process client payments securely through PayPal integration with transaction tracking and payment status management
* **Comprehensive Reporting** — Generate detailed reports on order performance, team productivity, attendance, website access logs, and financial transactions
* **Client Feedback** — Collect and track client feedback and ratings after order completion for quality improvement
* **User Authentication** — Support multiple login methods including standard credentials and Google OAuth with secure JWT-based session management
* **Client Self-Service** — Allow clients to self-register, create their own orders, check address duplicates, and track order progress independently

---

## What the Platform Manages

### Orders & Assignments

The core function of Backbone API is comprehensive order management. Users can create new orders specifying inspection type, location details, package selection, and attachments. Orders flow through defined statuses (Pending → Assigned → In Progress → Completed) with supervisor and team member assignments. The system tracks who created the order, who is assigned to it, when work started, and when it was completed. Orders maintain complete history including all modifications, reassignments, and status changes.

### Work & Collaboration

Once assigned, team members can mark orders as "in progress" and upload working attachments. The built-in messaging system allows clients and team members to communicate directly on specific orders, creating a conversation history. Supervisors verify work quality, and team members can complete orders by uploading deliverable files. The system supports resending completed orders if clients request changes, with full tracking of revisions.

### Pricing & Financial Management

Organizations can define multiple service packages with different features and pricing. Client-specific pricing can be configured, allowing custom rates for different clients. The turnaround time (TAT) pricing module supports different completion timelines with corresponding pricing models. Transactions are recorded for payment processing through PayPal, and the system maintains complete financial records linked to orders.

### Reporting & Analytics

The reporting module provides insights across multiple dimensions: order analytics (volume, completion rates, status distribution), team productivity (who completed how many orders, average completion times), attendance tracking, website access logs, and financial reports. Reports can be exported as PDF or Excel files for sharing and analysis.

### Master Data

The platform manages various configuration and master data including states/locations, reference data, order types, forms, inspection types (26-point and 36-point inspections), alert availability settings, and transaction records. This structured data enables consistent categorization and filtering of orders.

---

## How It Works

The main workflow for order management follows this flow:

**Client Perspective:**
1. Client registers on the platform (or logs in with Google)
2. Client creates a new order by selecting service package, specifying inspection details, uploading relevant documents
3. Client optionally uploads attachments for the inspection team to review
4. Client receives order confirmation and can track status in real-time
5. Client receives notifications as order progresses (assigned, in-progress, completed)
6. Client receives completed deliverables and can provide feedback on work quality

**Team Perspective:**
1. Administrator or supervisor reviews pending orders in the system
2. Supervisor assigns order to available team member
3. Team member marks order as work-in-progress and begins assignments
4. Team member uploads working attachments and communicates with client through order messages
5. Upon completion, team member uploads final deliverable files and submits completion
6. Supervisor reviews and approves completed work
7. System notifies client that order is ready for delivery

**Administrator Perspective:**
1. Administrator configures service packages, pricing, and TAT options
2. Administrator manages team members and assigns roles/permissions
3. Administrator monitors order pipeline and team productivity through reports
4. Administrator processes client payments and reconciles transactions
5. Administrator exports reports for billing, performance analysis, and business intelligence

---

## Who It's For

* **Inspection Organizations** — Manage large volumes of inspection orders with dispersed teams
* **Quality Assurance Teams** — Track work assignments, verify completed work, and maintain quality standards
* **Team Supervisors** — Assign work to team members, verify deliverables, and manage order progress
* **Team Members/Inspectors** — Receive assignments, upload work, communicate with clients and supervisors
* **Organization Administrators** — Configure packages, manage pricing, process payments, generate reports
* **Clients** — Submit orders, track progress, communicate with team, receive results, provide feedback

---

## Core Features at a Glance

| Feature | Purpose |
|---------|---------|
| **Order Lifecycle Management** | Create, assign, track, and complete inspection orders with status workflow |
| **Role-Based Access Control** | Support admin, supervisor, and team member roles with appropriate permissions |
| **Messaging & Collaboration** | Client-team communication within order context for transparent collaboration |
| **Large File Support** | Accept and manage order attachments up to 2GB with organized storage |
| **Custom Packages & Pricing** | Define service packages with configurable pricing and turnaround options |
| **Payment Processing** | Secure PayPal integration for client payments with transaction tracking |
| **Reporting & Analytics** | Generate reports on orders, team performance, attendance, and finances |
| **User Authentication** | Login support via credentials or Google OAuth with JWT session management |
| **Client Self-Service** | Self-registration, order creation, progress tracking without internal staff intervention |
| **Quality Feedback** | Collect client ratings and feedback for quality improvement tracking |

---

## Project Status

**Active Development** — The platform has core order management, authentication, and reporting features fully implemented and operational. Payment processing, team collaboration, and document management are complete. The system is actively maintained and developed with regular updates and enhancements.

---

## Technology Stack

The application is built with modern, production-ready technologies:

* **NestJS** — Scalable, modular Node.js framework with built-in dependency injection
* **PostgreSQL** — Robust relational database for persistent data storage and reliability
* **TypeORM** — Object-relational mapping with type-safe database operations and migrations
* **JWT & Passport** — Secure authentication with support for multiple strategies (local, JWT, Google OAuth)
* **PayPal SDK** — Payment processing and transaction management
* **Multer** — Large file upload handling with support for multi-file processing
* **PDF-Lib** — PDF generation for reports and documentation
* **ExcelJS** — Excel file generation for data exports and reporting
* **Swagger** — Automatic API documentation and interactive testing interface

