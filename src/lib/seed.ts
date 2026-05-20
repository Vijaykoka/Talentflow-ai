import { PrismaClient } from "../generated/prisma/client";

const prisma = new PrismaClient();

const SKILLS = [
  "React", "TypeScript", "Node.js", "Python", "PostgreSQL", "MongoDB",
  "AWS", "Docker", "Kubernetes", "GraphQL", "REST API", "Redis",
  "Vue.js", "Angular", "Java", "Spring Boot", "Go", "Rust",
  "Machine Learning", "Data Science", "DevOps", "CI/CD", "Terraform",
  "Next.js", "Tailwind CSS", "Git", "Microservices",
  "Kafka", "RabbitMQ", "Elasticsearch", "Figma",
  "React Native", "Swift", "Kotlin", "Flutter", "C#", ".NET",
  "PyTorch", "TensorFlow", "NLP", "Computer Vision",
  "Apache Spark", "Hadoop", "Airflow", "Snowflake", "BigQuery",
  "Jira", "Confluence", "Agile", "Scrum",
  "Linux", "Bash", "Nginx", "Apache",
  "DynamoDB", "Neo4j", "Cassandra", "SQS", "SNS",
];

const DEMAND_TITLES = [
  "Senior Full Stack Developer", "DevOps Engineer", "Data Scientist", "Frontend Developer",
  "Backend Developer", "Cloud Architect", "ML Engineer", "Product Manager",
  "UX Designer", "QA Engineer", "Solutions Architect", "Security Engineer",
  "Mobile Developer", "Full Stack Engineer", "Site Reliability Engineer",
  "AI Research Engineer", "Platform Engineer", "Systems Engineer",
  "Database Administrator", "Network Engineer", "Scrum Master",
  "Technical Lead", "Engineering Manager", "Principal Engineer",
  "Staff Engineer", "Senior Software Engineer",
  "Data Engineer", "MLOps Engineer", "iOS Developer", "Android Developer",
];

const JD_TEMPLATES: Record<string, string> = {
  "Senior Full Stack Developer": "We are seeking an experienced Full Stack Developer to build and maintain scalable web applications. You will work across the entire stack, from database design to frontend implementation, collaborating with cross-functional teams to deliver high-impact features.",
  "DevOps Engineer": "Join our platform engineering team to build and maintain CI/CD pipelines, manage cloud infrastructure, and automate deployment processes. You'll ensure 99.9% uptime and drive infrastructure-as-code initiatives.",
  "Data Scientist": "Leverage advanced analytics and machine learning to solve complex business problems. You'll work with large datasets, build predictive models, and communicate insights to stakeholders.",
  "Frontend Developer": "Build beautiful, responsive, and performant user interfaces using modern frameworks. You'll collaborate closely with designers and backend engineers to create seamless user experiences.",
  "Backend Developer": "Design and build robust, scalable APIs and microservices. You'll architect data models, implement business logic, and ensure system reliability and performance.",
  "Cloud Architect": "Design and implement cloud-native solutions across AWS/GCP/Azure. You'll define architecture standards, optimize costs, and ensure security best practices.",
  "ML Engineer": "Productionize machine learning models at scale. You'll build ML pipelines, deploy models to production, and optimize inference performance.",
  "Product Manager": "Define product strategy and roadmap for our platform. You'll work with engineering, design, and business teams to deliver features that delight users.",
  "UX Designer": "Design intuitive and accessible user experiences. You'll conduct user research, create wireframes and prototypes, and collaborate with engineering on implementation.",
  "QA Engineer": "Ensure software quality through automated and manual testing. You'll design test strategies, implement test frameworks, and champion quality throughout the development lifecycle.",
  "Solutions Architect": "Design end-to-end technical solutions for enterprise clients. You'll translate business requirements into technical specifications and guide implementation teams.",
  "Security Engineer": "Protect our systems and data through proactive security measures. You'll conduct security assessments, implement controls, and respond to incidents.",
  "Mobile Developer": "Build cross-platform mobile applications using React Native or Flutter. You'll create smooth, native-feeling experiences for iOS and Android users.",
  "Site Reliability Engineer": "Ensure the reliability, scalability, and performance of our production systems. You'll build monitoring, automate operations, and lead incident response.",
  "AI Research Engineer": "Push the boundaries of what's possible with AI. You'll research, implement, and deploy state-of-the-art models in production.",
  "Data Engineer": "Build and maintain data pipelines that process billions of records. You'll design data architectures, implement ETL processes, and ensure data quality.",
  "MLOps Engineer": "Bridge the gap between ML research and production. You'll build ML infrastructure, automate model deployment, and monitor model performance.",
  "iOS Developer": "Develop native iOS applications using Swift and SwiftUI. You'll create polished, performant apps that delight Apple users.",
  "Android Developer": "Build native Android applications using Kotlin and Jetpack Compose. You'll create modern, feature-rich Android experiences.",
};

const FIRST_NAMES = [
  "James", "Mary", "John", "Patricia", "Robert", "Jennifer", "Michael", "Linda",
  "William", "Barbara", "David", "Elizabeth", "Richard", "Susan", "Joseph", "Jessica",
  "Thomas", "Sarah", "Charles", "Karen", "Christopher", "Nancy", "Daniel", "Lisa",
  "Matthew", "Margaret", "Anthony", "Betty", "Mark", "Sandra", "Donald", "Ashley",
  "Steven", "Kimberly", "Paul", "Emily", "Andrew", "Donna", "Joshua", "Michelle",
  "Kenneth", "Dorothy", "Kevin", "Carol", "Brian", "Amanda", "George", "Melissa",
  "Timothy", "Deborah", "Ronald", "Stephanie", "Edward", "Rebecca", "Jason", "Sharon",
  "Jeffrey", "Laura", "Ryan", "Cynthia", "Jacob", "Kathleen", "Gary", "Amy",
  "Nicholas", "Angela", "Eric", "Shirley", "Jonathan", "Anna", "Stephen", "Brenda",
  "Larry", "Pamela", "Justin", "Emma", "Scott", "Nicole", "Brandon", "Helen",
  "Aisha", "Wei", "Priya", "Carlos", "Fatima", "Hiroshi", "Olga", "Kwame",
];

const LAST_NAMES = [
  "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis",
  "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson",
  "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson",
  "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson",
  "Walker", "Young", "Allen", "King", "Wright", "Scott", "Torres", "Nguyen",
  "Hill", "Flores", "Green", "Adams", "Nelson", "Baker", "Hall", "Rivera",
  "Campbell", "Mitchell", "Carter", "Roberts", "Chen", "Kim", "Park", "Patel",
  "Kumar", "Singh", "Ali", "Cohen", "O'Brien", "Murphy", "Kelly",
  "Sharma", "Yamamoto", "Johansson", "Petrov", "Okonkwo", "Ivanova",
];

const VENDOR_NAMES = [
  "TechRecruit Pro", "Elite Talent Hub", "CodeFinders Inc", "DevHire Solutions",
  "TalentBridge", "Silicon Valley Recruiters", "TechPros Agency",
  "DevStar Staffing", "CodeWizards Hiring", "FutureTech Talent",
  "Global Talent Partners", "Apex Recruiting", "Prime Source Tech",
  "CloudStaff International", "NexGen Hiring",
];

const LOCATIONS = [
  "Remote", "New York, NY", "San Francisco, CA", "Austin, TX", "Seattle, WA",
  "Chicago, IL", "Boston, MA", "Denver, CO", "Atlanta, GA", "Miami, FL",
  "Los Angeles, CA", "Portland, OR", "San Diego, CA", "Phoenix, AZ",
  "Dallas, TX", "Houston, TX", "Philadelphia, PA", "Washington, DC",
  "Minneapolis, MN", "Raleigh, NC", "Nashville, TN", "Salt Lake City, UT",
];

const COMPANIES = [
  "Google", "Microsoft", "Amazon", "Meta", "Apple", "Netflix", "Tesla",
  "Uber", "Airbnb", "Stripe", "Shopify", "Salesforce", "Adobe", "Oracle",
  "IBM", "Intel", "Cisco", "VMware", "Slack", "Zoom", "Snowflake",
  "Datadog", "Cloudflare", "Twilio", "Square", "PayPal", "Coinbase",
  "Instagram", "LinkedIn", "Pinterest", "Spotify", "Dropbox", "Atlassian",
];

function randomSkills(count: number): string {
  const shuffled = [...SKILLS].sort(() => 0.5 - Math.random());
  return JSON.stringify(shuffled.slice(0, count));
}

function randomSkillsWeighted(min: number, max: number, preferredSkills?: string[]): string {
  const count = randomBetween(min, max);
  const skills = new Set<string>();
  
  if (preferredSkills) {
    for (const s of preferredSkills) {
      if (Math.random() > 0.3) skills.add(s);
    }
  }
  
  while (skills.size < count) {
    skills.add(SKILLS[Math.floor(Math.random() * SKILLS.length)]);
  }
  
  return JSON.stringify(Array.from(skills).slice(0, count));
}

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number, decimals: number = 2): number {
  const val = Math.random() * (max - min) + min;
  return parseFloat(val.toFixed(decimals));
}

function pickRandom<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// Skill clusters for different roles
const SKILL_CLUSTERS: Record<string, string[]> = {
  "Senior Full Stack Developer": ["React", "TypeScript", "Node.js", "PostgreSQL", "AWS", "GraphQL", "Docker", "Next.js"],
  "DevOps Engineer": ["AWS", "Docker", "Kubernetes", "Terraform", "CI/CD", "Linux", "Bash", "Git"],
  "Data Scientist": ["Python", "Machine Learning", "Data Science", "PostgreSQL", "PyTorch", "TensorFlow", "Apache Spark"],
  "Frontend Developer": ["React", "TypeScript", "Next.js", "Tailwind CSS", "GraphQL", "Figma", "Git"],
  "Backend Developer": ["Node.js", "Python", "PostgreSQL", "MongoDB", "Redis", "GraphQL", "REST API", "Docker"],
  "Cloud Architect": ["AWS", "Docker", "Kubernetes", "Terraform", "Linux", "DevOps", "Microservices", "Kafka"],
  "ML Engineer": ["Python", "Machine Learning", "PyTorch", "TensorFlow", "Docker", "AWS", "NLP", "Computer Vision"],
  "Mobile Developer": ["React Native", "Swift", "Kotlin", "Flutter", "TypeScript", "REST API", "Git"],
  "Site Reliability Engineer": ["AWS", "Docker", "Kubernetes", "Linux", "Bash", "CI/CD", "Terraform", "Redis"],
  "Data Engineer": ["Python", "Apache Spark", "Airflow", "Snowflake", "AWS", "Kafka", "PostgreSQL", "BigQuery"],
  "MLOps Engineer": ["Docker", "Kubernetes", "Python", "AWS", "CI/CD", "Terraform", "Machine Learning", "Airflow"],
  "iOS Developer": ["Swift", "SwiftUI", "REST API", "Git", "Core Data", "Combine"],
  "Android Developer": ["Kotlin", "Jetpack Compose", "REST API", "Git", "Android SDK", "Dagger"],
};

async function seed() {
  console.log("Starting seed...");
  console.log("Clearing existing data...");

  await prisma.jobCandidateMatch.deleteMany();
  await prisma.hire.deleteMany();
  await prisma.resume.deleteMany();
  await prisma.candidate.deleteMany();
  await prisma.demand.deleteMany();
  await prisma.vendor.deleteMany();

  console.log("Creating vendors...");
  const vendors = await Promise.all(
    VENDOR_NAMES.map((name, i) => {
      const hiresCount = randomBetween(3, 25);
      const avgFillDays = randomBetween(5, 35);
      return prisma.vendor.create({
        data: {
          name,
          contact: `${randomFrom(FIRST_NAMES)} ${randomFrom(LAST_NAMES)}`,
          email: `info@${name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
          commissionRate: randomFloat(0.05, 0.18),
          performanceScore: randomFloat(3.0, 5.0),
        },
      });
    })
  );

  console.log("Creating 80 demands...");
  const demands = await Promise.all(
    Array.from({ length: 80 }, (_, i) => {
      const title = DEMAND_TITLES[i % DEMAND_TITLES.length];
      const clusterSkills = SKILL_CLUSTERS[title] || [];
      const rateMin = title.includes("Senior") || title.includes("Lead") || title.includes("Principal") || title.includes("Architect") || title.includes("Manager") || title.includes("VP") || title.includes("Staff")
        ? randomBetween(120, 220)
        : randomBetween(60, 140);
      const isRemote = Math.random() > 0.55;
      const priority = randomFrom(["HIGH", "HIGH", "MEDIUM", "MEDIUM", "LOW"]);
      const statusWeights: string[] = [];
      if (i < 20) statusWeights.push(...Array(4).fill("OPEN"), "IN_PROGRESS", "INTERVIEW", "FILLED");
      else if (i < 40) statusWeights.push(...Array(3).fill("OPEN"), ...Array(2).fill("IN_PROGRESS"), "INTERVIEW", "OFFER", "FILLED");
      else statusWeights.push("OPEN", "IN_PROGRESS", "INTERVIEW", "OFFER", "FILLED", "FILLED");

      return prisma.demand.create({
        data: {
          title: i < 30 ? title : `${title} @ ${randomFrom(COMPANIES)}`,
          jdText: JD_TEMPLATES[title] || `We are looking for a talented ${title} to join our growing team. You will work on challenging problems with a world-class team.`,
          requiredSkills: randomSkillsWeighted(4, 9, clusterSkills),
          rateMin,
          rateMax: rateMin + randomBetween(20, 80),
          location: isRemote ? "Remote" : randomFrom(LOCATIONS),
          priority,
          status: randomFrom(statusWeights),
          vendorId: Math.random() > 0.35 ? randomFrom(vendors).id : null,
        },
      });
    })
  );

  console.log("Creating 100 candidates...");
  const candidates = await Promise.all(
    Array.from({ length: 100 }, (_, i) => {
      const firstName = randomFrom(FIRST_NAMES);
      const lastName = randomFrom(LAST_NAMES);
      const experience = Math.random() < 0.15 ? randomBetween(15, 25) : Math.random() < 0.3 ? randomBetween(8, 15) : randomBetween(1, 8);
      const isHot = experience >= 10 && Math.random() > 0.4;
      const isHotRare = experience >= 5 && Math.random() > 0.85;
      const statusWeights = ["AVAILABLE", "AVAILABLE", "AVAILABLE", "AVAILABLE", "INTERVIEWING", "INTERVIEWING", "OFFERED"];

      return prisma.candidate.create({
        data: {
          name: `${firstName} ${lastName}`,
          email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@email.com`,
          phone: `+1-${randomBetween(200, 999)}-${randomBetween(100, 999)}-${randomBetween(1000, 9999)}`,
          extractedSkills: randomSkills(randomBetween(4, 12)),
          experienceYears: experience,
          currentCtc: experience * randomBetween(8000, 18000),
          expectedCtc: experience * randomBetween(9000, 22000),
          status: randomFrom(statusWeights),
          hotTalent: isHot || isHotRare,
        },
      });
    })
  );

  console.log("Creating resumes for candidates...");
  let resumeCount = 0;
  for (const candidate of candidates) {
    if (Math.random() > 0.4) {
      const skills = JSON.parse(candidate.extractedSkills) as string[];
      const companies = pickRandom(COMPANIES, randomBetween(1, 4));
      const eduDegrees = ["Bachelor's in Computer Science", "Master's in Computer Science", "Bachelor's in Information Technology", "Master's in Data Science", "PhD in Computer Science", "Bachelor's in Electrical Engineering"];
      
      await prisma.resume.create({
        data: {
          candidateId: candidate.id,
          originalFile: `resume_${candidate.name.toLowerCase().replace(/\s+/g, '_')}.pdf`,
          parsedText: `Professional Summary: Experienced professional with ${candidate.experienceYears} years in software development and technology.`,
          extractedSkills: candidate.extractedSkills,
          education: JSON.stringify(pickRandom(eduDegrees, randomBetween(1, 2)).map(d => ({
            institution: randomFrom(COMPANIES).includes("Tech") ? randomFrom(COMPANIES) + " University" : randomFrom(COMPANIES) + " University",
            degree: d,
            year: String(2020 - randomBetween(0, 15)),
          }))),
          experience: JSON.stringify(companies.map((c, idx) => ({
            company: c,
            title: idx === 0 ? `Senior ${randomFrom(["Software Engineer", "Developer", "Engineer", "Architect"])}` : randomFrom(["Software Engineer", "Developer", "Junior Developer"]),
            duration: `${randomBetween(1, 4)} years`,
            description: `Worked on ${pickRandom(skills, 2).join(" and ")} projects`,
          }))),
        },
      });
      resumeCount++;
    }
  }
  console.log(`Created ${resumeCount} resumes`);

  console.log("Creating job-candidate matches...");
  let matchCount = 0;
  for (const demand of demands.slice(0, 50)) {
    const demandSkills = JSON.parse(demand.requiredSkills) as string[];
    const relevantCandidates = candidates.filter(c => {
      const candidateSkills = JSON.parse(c.extractedSkills) as string[];
      return candidateSkills.some(skill =>
        demandSkills.some(ds => ds.toLowerCase() === skill.toLowerCase())
      );
    });

    for (const candidate of relevantCandidates.slice(0, randomBetween(3, 12))) {
      const candidateSkills = JSON.parse(candidate.extractedSkills) as string[];
      const skillOverlap = candidateSkills.filter(s =>
        demandSkills.some(ds => ds.toLowerCase() === s.toLowerCase())
      ).length;
      const expScore = Math.max(0, 1 - Math.abs(candidate.experienceYears - 5) / 15);
      const score = Math.min(98, Math.round(
        (skillOverlap / Math.max(demandSkills.length, 1)) * 50 +
        expScore * 30 +
        Math.random() * 20 +
        5
      ));
      const scoreBucket = score >= 85 ? "SHORTLISTED" : score >= 70 ? "SHORTLISTED" : score >= 50 ? "PENDING" : "REJECTED";
      const reasons = [
        `${skillOverlap}/${demandSkills.length} skills matched, ${candidate.experienceYears}yrs exp`,
        `Skill overlap: ${skillOverlap} mutual skills. ${candidate.experienceYears} years of relevant experience.`,
        `${Math.round((skillOverlap / demandSkills.length) * 100)}% skill match rate. ${candidate.experienceYears}yrs total experience.`,
      ];

      await prisma.jobCandidateMatch.create({
        data: {
          demandId: demand.id,
          candidateId: candidate.id,
          matchScore: score,
          matchReason: randomFrom(reasons),
          status: scoreBucket,
        },
      });
      matchCount++;
    }
  }
  console.log(`Created ${matchCount} matches`);

  console.log("Creating hires...");
  let hireCount = 0;
  const hireStatusWeights = ["ACTIVE", "ACTIVE", "ACTIVE", "ACTIVE", "COMPLETED", "COMPLETED"];
  const usedPairs = new Set<string>();

  for (let i = 0; i < 25; i++) {
    const demand = demands[randomBetween(0, demands.length - 1)];
    const candidate = candidates[randomBetween(0, candidates.length - 1)];
    const pairKey = `${demand.id}-${candidate.id}`;
    if (usedPairs.has(pairKey)) continue;
    usedPairs.add(pairKey);

    const rate = demand.rateMin + randomBetween(10, 40);
    const hiringCost = randomBetween(3000, 15000);
    const monthlyMargin = (rate * 1.4 - rate * 0.7) * 160 - (hiringCost / 12);
    const daysAgo = randomBetween(1, 365);

    await prisma.hire.create({
      data: {
        demandId: demand.id,
        candidateId: candidate.id,
        vendorId: Math.random() > 0.4 ? randomFrom(vendors).id : null,
        hiredRate: rate,
        hiringCost,
        startDate: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
        projectedMargin12m: Math.round(monthlyMargin * 12 * 100) / 100,
        status: randomFrom(hireStatusWeights),
      },
    });
    hireCount++;
  }
  console.log(`Created ${hireCount} hires`);

  const stats = {
    vendors: vendors.length,
    demands: demands.length,
    candidates: candidates.length,
    resumes: resumeCount,
    matches: matchCount,
    hires: hireCount,
  };

  const total = Object.values(stats).reduce((a, b) => a + b, 0);

  console.log("\n╔══════════════════════════════╗");
  console.log("║     Seed Complete!           ║");
  console.log("╠══════════════════════════════╣");
  console.log(`║ Vendors:    ${String(stats.vendors).padStart(5)}           ║`);
  console.log(`║ Demands:    ${String(stats.demands).padStart(5)}           ║`);
  console.log(`║ Candidates: ${String(stats.candidates).padStart(5)}           ║`);
  console.log(`║ Resumes:    ${String(stats.resumes).padStart(5)}           ║`);
  console.log(`║ Matches:    ${String(stats.matches).padStart(5)}           ║`);
  console.log(`║ Hires:      ${String(stats.hires).padStart(5)}           ║`);
  console.log("╠══════════════════════════════╣");
  console.log(`║ Total:      ${String(total).padStart(5)}           ║`);
  console.log("╚══════════════════════════════╝");
}

seed()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
