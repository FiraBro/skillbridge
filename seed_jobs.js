import { query } from "./apps/api/src/config/db.js";

async function seedJobs() {
  console.log("Seeding sample jobs...");

  // Get a client user (assuming the first user is a client/user)
  const { rows: users } = await query("SELECT id FROM users LIMIT 1");
  if (users.length === 0) {
    console.error(
      "No users found to assign as client. Please register a user first.",
    );
    return;
  }
  const clientId = users[0].id;

  const sampleJobs = [
    {
      title: "Senior React Developer - Fintech",
      description:
        "We are looking for an experienced React developer to build high-performance dashboards for our fintech platform. Experience with Framer Motion and state management is a plus.",
      budgetRange: "$5,000 - $8,000",
      requiredSkills: ["React", "JavaScript", "Tailwind CSS", "Framer Motion"],
    },
    {
      title: "Fullstack Engineer (Node.js/PostgreSQL)",
      description:
        "Join our greenfield project to build a skill-sharing marketplace. You will be responsible for designing the database schema and implementing the Reputation Engine.",
      budgetRange: "$4,000 - $6,000",
      requiredSkills: ["Node.js", "PostgreSQL", "JavaScript", "Express.js"],
    },
    {
      title: "UI/UX Designer & Frontend Dev",
      description:
        "Need someone who can design beautiful interfaces and implement them in React. Must have a strong eye for aesthetics and micro-animations.",
      budgetRange: "$3,000 - $5,000",
      requiredSkills: ["UI Design", "React", "CSS", "Aesthetics"],
    },
  ];

  for (const job of sampleJobs) {
    await query(
      `INSERT INTO jobs (client_id, title, description, budget_range, required_skills)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT DO NOTHING`,
      [
        clientId,
        job.title,
        job.description,
        job.budgetRange,
        JSON.stringify(job.required_skills),
      ],
    );
  }

  console.log("Seeding complete! 🚀");
  process.exit(0);
}

seedJobs().catch((err) => {
  console.error(err);
  process.exit(1);
});
