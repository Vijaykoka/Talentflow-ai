import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database with dev suggestions...");

  // Clear existing
  await prisma.jobCandidateMatch.deleteMany();
  await prisma.hire.deleteMany();
  await prisma.resume.deleteMany();
  await prisma.candidate.deleteMany();
  await prisma.demand.deleteMany();
  await prisma.vendor.deleteMany();
  await prisma.client.deleteMany();

  // 1. Add Client
  const client = await prisma.client.create({
    data: {
      name: "Google Inc",
      industry: "Technology",
      contact: "Sundar Pichai",
      email: "sundar@google.com",
    }
  });
  console.log("Added Client:", client.name);

  // 2. Add Vendor
  const vendor = await prisma.vendor.create({
    data: {
      name: "TechTalent Partners",
      contact: "Sarah Jenkins",
      email: "sarah@techtalent.example.com",
      commissionRate: 0.1,
    }
  });
  console.log("Added Vendor:", vendor.name);

  // 3. Add Candidate
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
      location: "San Francisco, CA",
      vendorId: vendor.id, // Sourced from vendor
    }
  });
  console.log("Added Candidate:", candidate.name);

  // 4. Add Demand
  const demand = await prisma.demand.create({
    data: {
      title: "Senior Full Stack Developer at Google",
      location: "Remote",
      jdText: "We need a senior developer to lead our migration to Next.js. Must have deep experience with React ecosystems, server-side rendering, and scalable backend services.",
      requiredSkills: "React, TypeScript, Node.js, Next.js",
      rateMin: 100,
      rateMax: 150,
      priority: "HIGH",
      status: "OPEN",
      clientId: client.id,
      vendorId: vendor.id,
    }
  });
  console.log("Added Demand:", demand.title);

  console.log("Seeding complete! Dev database ready.");
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
