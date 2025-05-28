# Neon PostgreSQL Database Setup

This guide will help you set up a Neon PostgreSQL database for the AI Agent Platform.

## Step 1: Create a Neon Account

1. Go to [Neon Console](https://console.neon.tech/)
2. Sign up for a free account using GitHub, Google, or email
3. Verify your email if required

## Step 2: Create a New Database

1. Click "Create Project" in the Neon Console
2. Choose your settings:
   - **Project name**: `ai-agent-platform`
   - **Database name**: `ai_agent_db`
   - **Region**: Choose the region closest to your users (e.g., US East for North America)
   - **PostgreSQL version**: Use the latest stable version (15+)

## Step 3: Get Connection Details

1. After creating the project, go to the "Connection Details" section
2. Copy the connection string that looks like:
   ```
   postgresql://username:password@ep-example-123456.us-east-1.aws.neon.tech/ai_agent_db?sslmode=require
   ```

## Step 4: Configure Environment Variables

1. Open the `.env.local` file in the `apps/api-service` directory
2. Replace the `DATABASE_URL` with your actual Neon connection string:
   ```env
   DATABASE_URL="postgresql://your-username:your-password@your-endpoint.neon.tech/ai_agent_db?sslmode=require"
   ```

## Step 5: Test the Connection

Run the database connection test:

```bash
cd apps/api-service
npm run dev
```

Then in another terminal:

```bash
cd apps/api-service
npx tsx db/test-connection.ts
```

You should see a success message with the current time and PostgreSQL version.

## Step 6: Generate and Run Initial Migration

1. Generate the initial migration:
   ```bash
   npm run db:generate
   ```

2. Push the schema to your database:
   ```bash
   npm run db:push
   ```

## Step 7: Verify Database Schema

You can use Drizzle Studio to view your database:

```bash
npm run db:studio
```

This will open a web interface where you can see your tables and data.

## Available Database Commands

- `npm run db:generate` - Generate migration files from schema changes
- `npm run db:migrate` - Run pending migrations
- `npm run db:push` - Push schema changes directly (development only)
- `npm run db:studio` - Open Drizzle Studio for database management
- `npm run db:drop` - Drop database (use with caution)

## Troubleshooting

### Connection Issues

1. **Invalid connection string**: Make sure you copied the full connection string from Neon
2. **SSL issues**: Ensure `?sslmode=require` is at the end of your connection string
3. **Network issues**: Check if your firewall allows connections to Neon

### Environment Variable Issues

1. Make sure `.env.local` is in the correct directory (`apps/api-service/`)
2. Restart your development server after changing environment variables
3. Check that there are no extra spaces or quotes in your environment variables

### Migration Issues

1. If migrations fail, check your database permissions
2. Make sure your database is accessible and the connection string is correct
3. Try using `npm run db:push` for development instead of migrations

## Security Notes

- Never commit your actual database credentials to version control
- Use different databases for development, staging, and production
- Regularly rotate your database passwords
- Consider using Neon's branching feature for development databases

## Next Steps

After setting up the database:

1. ✅ Database connection established
2. ⏳ Implement core database schemas (Task 2)
3. ⏳ Set up user authentication (Task 3)
4. ⏳ Implement AI agent management (Task 4) 