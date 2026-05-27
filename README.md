# Globe Svelte

A country data view and analysis website built with SvelteKit and TypeScript.

## Overview

Globe Svelte is an interactive platform for exploring and analyzing country data. The application provides a user-friendly interface to browse country information, visualize data through interactive components, and gain insights into global statistics.

## Tech Stack

- **Frontend & Backend**: SvelteKit
- **Language**: TypeScript
- **Styling**: CSS
- **Database**: PostgreSQL 

## Features

- **Interactive country browsing** - Explore countries using an interactive map
- **Data analysis** - View and analyze country statistics and information
- **Authentication and saving analysis** - Create an account to save analysis results
- **AI chat** - Use AI chat to get data from World Bank Data Group

## Installation

### Requirements

- pnpm
- Docker

### Setup

1. Install dependencies:
```bash
pnpm install
```

2. **For the website:**
   - Configure `.env` with your database connection string and Gemini AI API key
   - Run the development server:
   ```bash
   pnpm dev
   ```

