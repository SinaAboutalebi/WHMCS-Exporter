# WHMCS Exporter

## Overview

The **WHMCS Exporter** is a custom application designed to collect various metrics from your **WHMCS** installation, process them, and expose them in a format that can be scraped by **Prometheus** for monitoring and alerting. The exporter includes metrics such as income, ticket status, client statistics, and more.

This project uses Docker to containerize the applicatioYou can now configure Prometheus to scrape this endpoint for monitoring.n, allowing easy deployment and scaling.

- **Income Metrics** (daily, monthly, yearly, all-time)

- **Ticket Metrics** (open, in-progress, awaiting replies, etc.)

- **Client Stats** (active, inactive, closed clients)

- **Product and Domain Metrics**

- **Invoice Metrics** (paid, unpaid, overdue, cancelled, etc.)

## Prerequisites

- **Docker:** The application is Dockerized. You need Docker installed to run the application.

- **WHMCS:** The exporter relies on data from a running WHMCS installation with an accessible API.

## Getting Started

1. Clone the Repository

   ```bash
   git clone https://github.com/SinaAboutalebi/whmcs-exporter.git
   cd whmcs-exporter
   ```

2. **Set Up Environment Variables**

   **Option 1**: Using `.env` File
   Create a `.env` file in the project root directory with the following content:

   ```bash
   WHMCS_API_URL="https://your-whmcs-domain/api.php"
   WHMCS_IDENTIFIER="your-identifier"
   WHMCS_SECRET="your-secret"
   BASIC_AUTH_USER=""
   BASIC_AUTH_PASS=""
   PORT=9200
   ```

   **Option 2:** Using Docker Compose
   Alternatively, if you are using Docker Compose, you can configure the environment variables directly in the `docker-compose.yml` file:

   ```yaml
   version: "3.8"

   services:
   whmcs-exporter:
     image: whmcs-exporter:latest
     build: .
     ports:
       - "${PORT}:${PORT}"
     environment:
       - WHMCS_API_URL=${WHMCS_API_URL}
       - WHMCS_IDENTIFIER=${WHMCS_IDENTIFIER}
       - WHMCS_SECRET=${WHMCS_SECRET}
       - BASIC_AUTH_USER=${BASIC_AUTH_USER}
       - BASIC_AUTH_PASS=${BASIC_AUTH_PASS}
     healthcheck:
     test: curl --fail http://localhost:${PORT}/health || exit 1
     interval: 30s
     retries: 3
   ```

3. **Run the Docker Container**
   You can run the exporter using **Docker Compose** for ease of use. This will handle both building and running the container with the required environment variables.

   **With Docker Compose:**
   To start the exporter, use the following command:

   ```bash
   docker compose up -d
   ```

4. **Access the Metrics**
   Once the container is running, you can access the metrics at the following URL:

   ```bash
   http://localhost:9200/metrics
   ```

You can now configure **Prometheus** to scrape this endpoint for monitoring.
