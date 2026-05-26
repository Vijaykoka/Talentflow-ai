import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database with demo suggested inputs...");

  // 1. Add Vendor
  const vendor = await prisma.vendor.create({
    data: {
      name: "TechTalent Partners",
      contact: "Sarah Jenkins",
      email: "sarah@techtalent.example.com",
      commissionRate: 10,
    }
  });
  console.log("Added Vendor:", vendor.name);

  // 2. Add Candidate
  const candidate = await prisma.candidate.create({
    data: {
      name: "Alex Rivera",
      email: "alex.rivera@example.com",
      phone: "(555) 019-8234",
      experienceYears: 6,
      currentCtc: 120000,
      expectedCtc: 130000,
      extractedSkills: "React, TypeScript, Node.js, Next.js, AWS",
      status: "AVAILABLE",
      hotTalent: true,
    }
  });
  console.log("Added Candidate:", candidate.name);

  // 3. Add Demand
  const demand = await prisma.demand.create({
    data: {
      title: "Senior Full Stack Developer",
      location: "Remote",
      jdText: "We need a senior developer to lead our migration to Next.js. Must have deep experience with React ecosystems, server-side rendering, and scalable backend services.",
      requiredSkills: "React, TypeScript, Node.js, Next.js",
      rateMin: 100,
      rateMax: 150,
      priority: "HIGH",
      status: "OPEN",
    }
  });
  console.log("Added Demand:", demand.title);

  console.log("Seeding complete! You can now use these records to run AI Matching and Record Hires in the UI.");
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
