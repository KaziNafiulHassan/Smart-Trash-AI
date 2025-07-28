# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/3f82d121-f6ca-4050-b621-b1f52dd3ef7f

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/3f82d121-f6ca-4050-b621-b1f52dd3ef7f) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Set up environment variables.
# Copy the example files and fill in your actual values:
cp .env.example .env
cp neo4j.env.example neo4j.env
# Edit .env and neo4j.env with your actual API keys and credentials

# Step 5: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/3f82d121-f6ca-4050-b621-b1f52dd3ef7f) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

## Environment Setup

This project requires several environment variables to function properly. For security reasons, these are not included in the repository.

### Required Environment Files

1. **`.env`** - Main application environment variables
2. **`neo4j.env`** - Neo4j database credentials

### Setup Instructions

1. Copy the example files:
   ```sh
   cp .env.example .env
   cp neo4j.env.example neo4j.env
   ```

2. Edit each file with your actual credentials:

   **`.env`** requires:
   - `VITE_NEO4J_URI` - Your Neo4j AuraDB connection URI
   - `VITE_NEO4J_USERNAME` - Your Neo4j username
   - `VITE_NEO4J_PASSWORD` - Your Neo4j password
   - `VITE_OPENROUTER_API_KEY` - Your OpenRouter API key for LLM services

   **`neo4j.env`** requires:
   - `NEO4J_URI` - Your Neo4j AuraDB connection URI
   - `NEO4J_USERNAME` - Your Neo4j username
   - `NEO4J_PASSWORD` - Your Neo4j password

### Security Notes

- Never commit `.env` or `neo4j.env` files to version control
- These files are automatically ignored by Git
- Use the `.example` files as templates for new deployments
