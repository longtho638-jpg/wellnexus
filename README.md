# WellNexus Commerce OS: Project Sức-Khỏe & Niềm-Tin

This repository contains the backend services for the WellNexus affiliate marketing platform, built on Firebase and operated by a team of specialized AI agents. Our philosophy is to create a robust Evidence Layer for the entire commerce chain, guided by the principles: "Chứng minh. Tự động hoá. Mở rộng."

## Core Architecture

The system is designed as a team of specialized AI agents, each with a specific mission:

-   **Agentic Router**: The chief architect, responsible for analyzing requirements, dispatching tasks to specialized agents, and verifying their outputs.
-   **Onboarding & UX Coach**: Designs and monitors the 30-day onboarding journey to ensure a smooth user experience.
-   **Affiliate Policy Compiler**: Translates business policies into machine-readable rules and ensures their correct implementation.
-   **Compliance Counsel**: Ensures all operations adhere to legal and regulatory frameworks.
-   **Evidence Ledger Keeper**: Manages the hash chain and digital signatures for all critical transactions.
-   **Data & Risk Officer**: Monitors key business metrics and detects anomalies or market drifts.
-   **Channel Intelligence**: Prevents channel conflicts and ensures fair referral attribution.

## Development Roadmap

Our development follows a phased approach, inspired by natural growth:

1.  **SEED (HẠT GIỐNG)**: Focuses on core functionalities like the 30-day onboarding, initial affiliate payout system, and content compliance.
2.  **TREE (CÂY)**: Expands the platform with a marketplace, SDKs, and advanced channel management.
3.  **FOREST (RỪNG)**: Introduces a playbook store and advanced management tiers, aiming for high availability (99.9% SLA).
4.  **GROUND (ĐẤT)**: Aims to establish a transparent consortium for the wellness industry, with public verification APIs.

## Getting Started

### Prerequisites

-   Node.js (v20+)
-   Firebase CLI
-   pnpm

### Local Development

1.  **Install Dependencies**:
    ```bash
    pnpm install
    ```

2.  **Run Emulators**:
    Start the local Firebase emulators for Functions and Firestore.
    ```bash
    firebase emulators:start
    ```

3.  **Run Smoke Tests**:
    Execute the API smoke tests to verify local functionality.
    ```bash
    pnpm codex:smoke
    ```

## CI/CD Pipeline

The CI/CD pipeline is managed by GitHub Actions and automates the deployment process.

-   **Build & Test**: Automatically triggered on pushes to `main`. It builds the functions, runs smoke tests, and prepares the artifacts.
-   **Deploy to Staging**: Automatically deploys the build to a staging environment for review.
-   **Production Approval**: Requires a manual two-person approval from designated reviewers before proceeding.
-   **Promote to Production**: Deploys the release to production with a canary rollout and includes automated rollback protection.

For more details, see the [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) file.

## System Prompt & Guiding Principles

The core operational logic, policies, and architecture of the WellNexus Commerce OS are defined in the `PROJECT.md` file. This document serves as the single source of truth and the "system prompt" for all AI agents involved in the project. It includes detailed information on:

-   **Operational Modes**: Different modes for the AI agents, from risk-aware `zen_mode` to creative `street_hustler_mode`.
-   **KPIs and Constraints**: Key performance indicators and business rules that govern the system's operation.
-   **Evidence Layer**: The cryptographic foundation for ensuring trust and transparency.
-   **Policy-as-Code**: Detailed breakdown of affiliate tiers, commission rules, and channel policies.
-   **API Contracts and Schemas**: Formal definitions for all APIs and Firestore data structures.

All development and operational activities must align with the principles and specifications outlined in this document.
