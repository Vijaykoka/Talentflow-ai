import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const INTERVIEWERS = [
  "Sarah Jenkins",
  "David Koka",
  "Marcus Vance",
  "Elena Rostova",
  "Linus Chen",
  "Aisha Rahman",
  "Christopher Nolan",
];

const FEEDBACK_TEMPLATES = [
  {
    rating: 5,
    tech: 92,
    behav: 95,
    rec: "STRONG_HIRE",
    comments: "Exceptional candidate. Demonstrated deep understanding of React concurrent rendering features and modular state architecture. Excellent algorithmic problem-solving speed and highly collaborative, positive behavioral traits. Strong leadership potential.",
  },
  {
    rating: 4,
    tech: 84,
    behav: 88,
    rec: "HIRE",
    comments: "Very solid technical foundation. Candidate explained systems design tradeoffs clearly and built a clean microservices architecture on the whiteboard. Behavioral fit is excellent, very humble and proactive.",
  },
  {
    rating: 4,
    tech: 78,
    behav: 82,
    rec: "HIRE",
    comments: "Good generalist skills. Answered database query optimization questions well, though struggled slightly with complex cache invalidation patterns. Shows good potential and takes instruction extremely well.",
  },
  {
    rating: 3,
    tech: 64,
    behav: 75,
    rec: "NO_HIRE",
    comments: "Candidate possesses reasonable basic coding skills but lacked depth in systems architecture, containerization, and AWS serverless models required for this senior position. Communication was slightly defensive during technical pushback.",
  },
  {
    rating: 2,
    tech: 48,
    behav: 60,
    rec: "STRONG_NO_HIRE",
    comments: "Significant gaps in coding fundamentals. Struggled to implement simple recursion and was unable to explain basic asynchronous processing in Node.js. Behavioral fit was also low due to lack of preparation.",
  },
];

async function seedFeedback() {
  console.log("Seeding Database with Premium Interview Feedbacks...");

  // Get matches where the demand is assigned to a vendor
  const vendorMatches = await prisma.jobCandidateMatch.findMany({
    where: {
      demand: {
        vendorId: {
          not: null,
        },
      },
    },
    include: {
      candidate: true,
      demand: {
        include: {
          vendor: true,
        },
      },
    },
  });

  if (vendorMatches.length === 0) {
    console.log("No vendor-associated candidate matches found. Please run matches first!");
    return;
  }

  console.log(`Found ${vendorMatches.length} candidate matches processed by vendors.`);
  
  // Clear any existing feedbacks to avoid duplication
  const cleared = await prisma.interviewFeedback.deleteMany();
  console.log(`Cleared ${cleared.count} existing interview feedbacks.`);

  // Let's seed feedback for about 70% of the matches
  let seededCount = 0;
  const matchesToSeed = vendorMatches.slice(0, Math.floor(vendorMatches.length * 0.7) || 1);

  const operations = [];
  for (let i = 0; i < matchesToSeed.length; i++) {
    const match = matchesToSeed[i];
    const template = FEEDBACK_TEMPLATES[i % FEEDBACK_TEMPLATES.length];
    const interviewer = INTERVIEWERS[i % INTERVIEWERS.length];

    // Add some random variation in technical & behavioral scores
    const randomVar = Math.floor(Math.random() * 9) - 4; // -4 to +4
    const technicalScore = Math.min(100, Math.max(0, template.tech + randomVar));
    const behavioralScore = Math.min(100, Math.max(0, template.behav + randomVar));
    
    // Create the feedback record
    operations.push(
      prisma.interviewFeedback.create({
        data: {
          matchId: match.id,
          rating: template.rating,
          interviewer,
          technicalScore,
          behavioralScore,
          comments: `[Initial assessment for ${match.candidate.name}] ${template.comments}`,
          recommendation: template.rec,
        },
      })
    );

    // Sync match status
    let matchStatus = "PENDING";
    if (template.rec === "STRONG_HIRE" || template.rec === "HIRE") {
      matchStatus = "SHORTLISTED";
    } else if (template.rec === "NO_HIRE" || template.rec === "STRONG_NO_HIRE") {
      matchStatus = "REJECTED";
    }

    operations.push(
      prisma.jobCandidateMatch.update({
        where: { id: match.id },
        data: { status: matchStatus },
      })
    );

    // Sync candidate status
    let candidateStatus = "INTERVIEWING";
    if (template.rec === "STRONG_HIRE" || template.rec === "HIRE") {
      candidateStatus = "OFFERED";
    } else if (template.rec === "NO_HIRE" || template.rec === "STRONG_NO_HIRE") {
      candidateStatus = "AVAILABLE";
    }

    operations.push(
      prisma.candidate.update({
        where: { id: match.candidateId },
        data: { status: candidateStatus },
      })
    );

    seededCount++;
  }

  console.log(`Executing database transaction with ${operations.length} operations...`);
  await prisma.$transaction(operations);

  console.log(`\nSuccessfully seeded ${seededCount} mock interview assessments!`);
}

seedFeedback()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
