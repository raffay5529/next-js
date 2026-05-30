import connectDB from "../lib/db";
import { Board, Column, JobApplication } from "@/lib/models";

const USER_ID = "6a0c98f61e8a9d335815549e";

const SAMPLE_JOBS = [
  // Wish List
  {
    company: "Google",
    position: "Frontend Engineer",
    location: "Remote",
    tags: ["React", "TypeScript", "Next.js"],
    description: "Build user-facing products used by billions of people worldwide.",
    jobUrl: "https://example.com/jobs/1",
    salary: "$130k - $160k",
  },
  {
    company: "Stripe",
    position: "Full Stack Developer",
    location: "San Francisco, CA",
    tags: ["Node.js", "React", "PostgreSQL"],
    description: "Work on payment infrastructure and developer tools.",
    jobUrl: "https://example.com/jobs/2",
    salary: "$140k - $170k",
  },
  {
    company: "Vercel",
    position: "Developer Experience Engineer",
    location: "Remote",
    tags: ["Next.js", "TypeScript", "DevTools"],
    description: "Improve the developer experience for frontend teams globally.",
    jobUrl: "https://example.com/jobs/3",
    salary: "$120k - $150k",
  },

  // Applied
  {
    company: "Shopify",
    position: "React Developer",
    location: "Toronto, Canada",
    tags: ["React", "GraphQL", "Ruby"],
    description: "Build and scale e-commerce solutions for millions of merchants.",
    jobUrl: "https://example.com/jobs/4",
    salary: "$110k - $140k",
  },
  {
    company: "Notion",
    position: "Software Engineer",
    location: "New York, NY",
    tags: ["TypeScript", "React", "Node.js"],
    description: "Build collaborative productivity tools used by teams worldwide.",
    jobUrl: "https://example.com/jobs/5",
    salary: "$125k - $155k",
  },
  {
    company: "Linear",
    position: "Frontend Engineer",
    location: "Remote",
    tags: ["React", "TypeScript", "Tailwind"],
    description: "Build the fastest issue tracking tool for modern software teams.",
    jobUrl: "https://example.com/jobs/6",
    salary: "$115k - $145k",
  },

  // Interview
  {
    company: "Figma",
    position: "Software Engineer",
    location: "San Francisco, CA",
    tags: ["TypeScript", "WebGL", "React"],
    description: "Build collaborative design tools used by millions of designers.",
    jobUrl: "https://example.com/jobs/7",
    salary: "$135k - $165k",
  },
  {
    company: "Supabase",
    position: "Backend Engineer",
    location: "Remote",
    tags: ["PostgreSQL", "Node.js", "Go"],
    description: "Build open source Firebase alternative infrastructure.",
    jobUrl: "https://example.com/jobs/8",
    salary: "$120k - $150k",
  },

  // Offer
  {
    company: "Profan",
    position: "Software Developer",
    location: "Stockholm, Sweden",
    tags: ["Node.js", "PostgreSQL", "AWS"],
    description: "Develop backend services and APIs.",
    jobUrl: "https://example.com/jobs/11",
    salary: "$100k - $125k",
  },
  {
    company: "MUS Logistics",
    position: "UI Designer",
    location: "Amsterdam, Netherlands",
    tags: ["Figma", "Illustrator"],
    description: "Lead the UX process and workflow, and work closely with developers.",
    jobUrl: "https://example.com/jobs/12",
    salary: "$90k - $110k",
  },

  // Rejected
  {
    company: "Ultra Vouche",
    position: "Product Manager",
    location: "London, UK",
    tags: ["Agile", "Scrum", "Jira"],
    description: "Lead product strategy and roadmap for core platform features.",
    jobUrl: "https://example.com/jobs/13",
    salary: "$95k - $120k",
  },
  {
    company: "Meta",
    position: "React Native Developer",
    location: "Menlo Park, CA",
    tags: ["React Native", "JavaScript", "Mobile"],
    description: "Build cross-platform mobile apps for billions of users.",
    jobUrl: "https://example.com/jobs/14",
    salary: "$140k - $180k",
  },
];

async function seed() {
  if (!USER_ID) {
    console.error("❌ Error: USER_ID is required");
    process.exit(1);
  }

  try {
    console.log("🚀 Starting seed process...");
    console.log(`🔑 Seeding data for user ID: ${USER_ID}`);

    await connectDB();
    console.log("✅ Connected to database");

    // Find the user's board
    let board = await Board.findOne({ userId: USER_ID, name: "Job Hunt" });

    if (!board) {
      console.log("⚠️ Board not found. Creating board...");
      board = await Board.create({ userId: USER_ID, name: "Job Hunt" });

      // Create default columns
      const columnDefs = [
        { name: "Wish List", order: 0 },
        { name: "Applied",   order: 1 },
        { name: "Interview", order: 2 },
        { name: "Offer",     order: 3 },
        { name: "Rejected",  order: 4 },
      ];

      const columns = await Column.insertMany(
        columnDefs.map((c) => ({ ...c, boardId: board._id }))
      );

      await Board.findByIdAndUpdate(board._id, {
        $push: { columns: { $each: columns.map((c) => c._id) } },
      });

      console.log("✅ Board and columns created");
    } else {
      console.log("✅ Board found");
    }

    // Get all columns
    const columns = await Column.find({ boardId: board._id }).sort({ order: 1 });
    console.log(`✅ Found ${columns.length} columns`);

    // Map column names to IDs
    const columnMap: Record<string, string> = {};
    columns.forEach((col) => {
      columnMap[col.name] = col._id.toString();
    });

    // Clear existing job applications for this user
    const existingJobs = await JobApplication.find({ userId: USER_ID });
    if (existingJobs.length > 0) {
      console.log(`🗑️ Deleting ${existingJobs.length} existing job applications...`);
      await JobApplication.deleteMany({ userId: USER_ID });

      // Clear job refs from columns
      for (const column of columns) {
        column.jobApplications = [];
        await column.save();
      }
    }

    // Distribute jobs across columns
    const jobsByColumn: Record<string, typeof SAMPLE_JOBS> = {
      "Wish List": SAMPLE_JOBS.slice(0, 3),
      "Applied":   SAMPLE_JOBS.slice(3, 6),
      "Interview": SAMPLE_JOBS.slice(6, 8),
      "Offer":     SAMPLE_JOBS.slice(8, 10),
      "Rejected":  SAMPLE_JOBS.slice(10, 12),
    };

    let totalCreated = 0;

    for (const [columnName, jobs] of Object.entries(jobsByColumn)) {
      const columnId = columnMap[columnName];
      if (!columnId) {
        console.warn(`⚠️ Column "${columnName}" not found, skipping...`);
        continue;
      }

      const column = columns.find((c) => c.name === columnName);
      if (!column) continue;

      for (let i = 0; i < jobs.length; i++) {
        const jobData = jobs[i];
        const jobApplication = await JobApplication.create({
          company:     jobData.company,
          position:    jobData.position,
          location:    jobData.location,
          tags:        jobData.tags,
          description: jobData.description,
          jobUrl:      jobData.jobUrl,
          salary:      jobData.salary,
          columnId,
          boardId:     board._id,
          userId:      USER_ID,
          status:      columnName.toLowerCase().replace(" ", "-"),
          order:       i,
        });

        column.jobApplications.push(jobApplication._id);
        totalCreated++;
      }

      await column.save();
      console.log(`✅ Added ${jobs.length} jobs to "${columnName}" column`);
    }

    console.log(`\n🎉 Seed completed successfully!`);
    console.log(`📋 Created ${totalCreated} job applications`);
    console.log(`📌 Board: ${board.name}`);
    console.log(`🔑 User ID: ${USER_ID}`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

seed();