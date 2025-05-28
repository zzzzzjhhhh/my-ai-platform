import { PrismaClient } from '../app/generated/prisma';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log(`Start seeding ...`);

  // Create Users
  const user1 = await prisma.user.create({
    data: {
      email: 'alice@example.com',
      passwordHash: await bcrypt.hash('password123', 10),
      name: 'Alice',
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'bob@example.com',
      passwordHash: await bcrypt.hash('password456', 10),
      name: 'Bob',
    },
  });

  console.log({ user1, user2 });

  // Create AI Agents
  const agent1 = await prisma.aIAgent.create({
    data: {
      name: 'Helpful Assistant',
      instructions: 'You are a helpful assistant. Be concise and polite.',
      userId: user1.id,
    },
  });

  const agent2 = await prisma.aIAgent.create({
    data: {
      name: 'Sarcastic Bot',
      instructions: 'You are a sarcastic bot. Make jokes and be slightly unhelpful.',
      userId: user2.id,
    },
  });
  console.log({ agent1, agent2 });

  // Create Meetings
  const meeting1 = await prisma.meeting.create({
    data: {
      name: 'Project Kickoff',
      userId: user1.id,
      aiAgentId: agent1.id,
      status: 'completed',
      startedAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      endedAt: new Date(Date.now() - 1000 * 60 * 60 * 1),   // 1 hour ago
    },
  });

  const meeting2 = await prisma.meeting.create({
    data: {
      name: 'Weekly Sync',
      userId: user2.id,
      aiAgentId: agent2.id,
      status: 'pending',
    },
  });
  console.log({ meeting1, meeting2 });

  // Create Transcripts
  const transcript1 = await prisma.transcript.create({
    data: {
      meetingId: meeting1.id,
      content: 'Alice: Hello Bob, welcome to the kickoff meeting. Bob: Thanks Alice! ...',
    },
  });
  console.log({ transcript1 });

  // Create Summaries
  const summary1 = await prisma.summary.create({
    data: {
      meetingId: meeting1.id,
      content: 'The meeting was a project kickoff. Alice welcomed Bob. They discussed project goals.',
    },
  });
  console.log({ summary1 });

  console.log(`Seeding finished.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  }); 