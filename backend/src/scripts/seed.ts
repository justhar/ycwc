import { db } from "../db/db.js";
import {
  universities,
  scholarships,
  universityScholarships,
} from "../db/schema.js";

// Sample universities data
const universitiesData = [
  {
    name: "Harvard University",
    location: "Cambridge, Massachusetts",
    country: "United States",
    ranking: 1,
    studentCount: 23000,
    establishedYear: 1636,
    type: "private" as const,
    tuitionRange: "$57,000 - $60,000",
    acceptanceRate: "3.43",
    description:
      "Harvard University is a private Ivy League research university in Cambridge, Massachusetts. Established in 1636, Harvard is the oldest institution of higher education in the United States and among the most prestigious in the world.",
    website: "https://www.harvard.edu",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/en/thumb/2/29/Harvard_shield_wreath.svg/1200px-Harvard_shield_wreath.svg.png",
    specialties: ["Law", "Medicine", "Business", "Engineering", "Liberal Arts"],
    campusSize: "209 acres",
    roomBoardCost: "$19,000",
    booksSuppliesCost: "$1,200",
    personalExpensesCost: "$3,500",
    facilitiesInfo: {
      library:
        "Widener Library - One of the world's largest academic libraries",
      recreationCenter: "Malkin Athletic Center with Olympic-size pool",
      researchLabs:
        "State-of-the-art research facilities across all disciplines",
      healthServices: "Harvard University Health Services",
    },
    housingOptions: [
      "Freshman dormitories",
      "Upper-class Houses",
      "Graduate student housing",
    ],
    studentOrganizations: [
      "Harvard Crimson",
      "Harvard Model Congress",
      "Phillips Brooks House Association",
      "Harvard International Review",
    ],
    diningOptions: [
      "Harvard University Dining Services",
      "Student cafeterias",
      "Kosher dining",
      "Halal options",
    ],
    transportationInfo: [
      "Harvard shuttle",
      "MBTA Red Line",
      "Bike sharing program",
      "Walking paths",
    ],
  },
  {
    name: "Stanford University",
    location: "Stanford, California",
    country: "United States",
    ranking: 3,
    studentCount: 17000,
    establishedYear: 1885,
    type: "private" as const,
    tuitionRange: "$56,000 - $59,000",
    acceptanceRate: "4.34",
    description:
      "Stanford University is a private research university located in Stanford, California. Known for its academic achievement, wealth, and proximity to Silicon Valley, Stanford is among the world's leading teaching and research institutions.",
    website: "https://www.stanford.edu",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/en/thumb/b/b7/Stanford_University_seal_2003.svg/1200px-Stanford_University_seal_2003.svg.png",
    specialties: [
      "Computer Science",
      "Engineering",
      "Business",
      "Medicine",
      "Psychology",
    ],
    campusSize: "8,180 acres",
    roomBoardCost: "$17,500",
    booksSuppliesCost: "$1,245",
    personalExpensesCost: "$2,130",
    facilitiesInfo: {
      library: "Cecil H. Green Library with over 9 million volumes",
      recreationCenter: "Ford Family Recreation Center",
      researchLabs: "Stanford Research Institute and numerous specialized labs",
      healthServices: "Vaden Health Center",
    },
    housingOptions: [
      "Undergraduate residences",
      "Graduate housing",
      "Row houses",
      "Co-ops",
    ],
    studentOrganizations: [
      "Stanford Daily",
      "Stanford Review",
      "ASSU",
      "Stanford Entrepreneurship Club",
    ],
    diningOptions: [
      "Residential dining",
      "CoHo Cafe",
      "Arrillaga Family Dining Commons",
      "Food trucks",
    ],
    transportationInfo: [
      "Marguerite shuttle",
      "Caltrain",
      "Bike rental",
      "Campus bike paths",
    ],
  },
  {
    name: "University of Oxford",
    location: "Oxford, England",
    country: "United Kingdom",
    ranking: 5,
    studentCount: 24000,
    establishedYear: 1096,
    type: "public" as const,
    tuitionRange: "£9,250 - £37,000",
    acceptanceRate: "17.50",
    description:
      "The University of Oxford is a collegiate research university in Oxford, England. There is evidence of teaching as early as 1096, making it the oldest university in the English-speaking world and the world's second-oldest university in continuous operation.",
    website: "https://www.ox.ac.uk",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/en/thumb/f/ff/Oxford-University-Circlet.svg/1200px-Oxford-University-Circlet.svg.png",
    specialties: ["Philosophy", "Literature", "History", "Medicine", "Law"],
    campusSize: "City campus",
    roomBoardCost: "£3,000 - £7,000",
    booksSuppliesCost: "£750",
    personalExpensesCost: "£1,500",
    facilitiesInfo: {
      library: "Bodleian Library - One of Europe's oldest libraries",
      recreationCenter: "Iffley Road Sports Complex",
      researchLabs: "Numerous research institutes and centers",
      healthServices: "Oxford University Student Health Service",
    },
    housingOptions: [
      "College accommodation",
      "University housing",
      "Private accommodation",
    ],
    studentOrganizations: [
      "Oxford Union",
      "Oxford University Student Union",
      "Oxford Review",
      "Various college societies",
    ],
    diningOptions: [
      "College dining halls",
      "University cafes",
      "Oxford restaurants",
      "Formal hall dinners",
    ],
    transportationInfo: [
      "Oxford Bus Company",
      "City cycling",
      "Walking",
      "Park and Ride",
    ],
  },
  {
    name: "University of Tokyo",
    location: "Tokyo, Japan",
    country: "Japan",
    ranking: 23,
    studentCount: 28000,
    establishedYear: 1877,
    type: "public" as const,
    tuitionRange: "¥535,800 (approx $4,000)",
    acceptanceRate: "10.00",
    description:
      "The University of Tokyo, abbreviated as Todai, is a public research university located in Bunkyō, Tokyo, Japan. Established in 1877, it was the first imperial university and is considered the most prestigious university in Japan.",
    website: "https://www.u-tokyo.ac.jp/en/",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/University_of_Tokyo_logo.svg/1200px-University_of_Tokyo_logo.svg.png",
    specialties: [
      "Engineering",
      "Natural Sciences",
      "Economics",
      "Law",
      "Medicine",
    ],
    campusSize: "Multiple campuses",
    roomBoardCost: "¥30,000 - ¥50,000",
    booksSuppliesCost: "¥50,000",
    personalExpensesCost: "¥80,000",
    facilitiesInfo: {
      library: "University of Tokyo Library System",
      recreationCenter: "Komaba Sports Hall",
      researchLabs: "Advanced research institutes across multiple disciplines",
      healthServices: "University Health Service Center",
    },
    housingOptions: [
      "University dormitories",
      "International houses",
      "Private apartments",
    ],
    studentOrganizations: [
      "University Festival Committee",
      "Student council",
      "International student association",
      "Research societies",
    ],
    diningOptions: [
      "University cafeterias",
      "Student cooperatives",
      "Local restaurants",
      "Convenience stores",
    ],
    transportationInfo: [
      "Tokyo Metro",
      "JR lines",
      "University buses",
      "Bicycle parking",
    ],
  },
  {
    name: "University of Melbourne",
    location: "Melbourne, Victoria",
    country: "Australia",
    ranking: 33,
    studentCount: 47000,
    establishedYear: 1853,
    type: "public" as const,
    tuitionRange: "AUD $32,000 - $45,000",
    acceptanceRate: "70.00",
    description:
      "The University of Melbourne is a public research university located in Melbourne, Australia. Founded in 1853, it is Australia's second oldest university and the oldest in Victoria.",
    website: "https://www.unimelb.edu.au",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/en/thumb/8/8a/University_of_Melbourne_Logo.svg/1200px-University_of_Melbourne_Logo.svg.png",
    specialties: ["Medicine", "Engineering", "Law", "Business", "Arts"],
    campusSize: "Parkville campus - 35 hectares",
    roomBoardCost: "AUD $12,000 - $18,000",
    booksSuppliesCost: "AUD $1,500",
    personalExpensesCost: "AUD $4,000",
    facilitiesInfo: {
      library: "University of Melbourne Library with 13 branches",
      recreationCenter: "Melbourne University Sport facilities",
      researchLabs: "Bio21 Institute and numerous research centers",
      healthServices: "Melbourne University Health Service",
    },
    housingOptions: [
      "Residential colleges",
      "University apartments",
      "Student housing",
      "Homestay programs",
    ],
    studentOrganizations: [
      "University of Melbourne Student Union",
      "Graduate Student Association",
      "Cultural clubs",
      "Academic societies",
    ],
    diningOptions: [
      "Residential college dining",
      "Campus cafes",
      "Food courts",
      "Melbourne CBD restaurants",
    ],
    transportationInfo: [
      "Melbourne trams",
      "University shuttle",
      "Cycling paths",
      "Walking campus",
    ],
  },
  {
    name: "University of Toronto",
    location: "Toronto, Ontario",
    country: "Canada",
    ranking: 21,
    studentCount: 97000,
    establishedYear: 1827,
    type: "public" as const,
    tuitionRange: "CAD $14,180 - $58,680",
    acceptanceRate: "43.00",
    description:
      "The University of Toronto is a public research university in Toronto, Ontario, Canada, located on the grounds that surround Queen's Park. It was founded by royal charter in 1827 as King's College, the oldest university in the province of Ontario.",
    website: "https://www.utoronto.ca",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/en/thumb/0/04/University_of_Toronto_Logo.svg/1200px-University_of_Toronto_Logo.svg.png",
    specialties: [
      "Medicine",
      "Engineering",
      "Business",
      "Computer Science",
      "Research",
    ],
    campusSize: "Multiple campuses - St. George, Mississauga, Scarborough",
    roomBoardCost: "CAD $8,000 - $15,000",
    booksSuppliesCost: "CAD $1,000",
    personalExpensesCost: "CAD $2,500",
    facilitiesInfo: {
      library:
        "University of Toronto Libraries - largest academic library system in Canada",
      recreationCenter: "Athletic Centre and multiple sports facilities",
      researchLabs:
        "Vector Institute, MaRS Discovery District, research hospitals",
      healthServices: "Health & Wellness Centre",
    },
    housingOptions: [
      "University residences",
      "Graduate housing",
      "College residences",
      "Off-campus housing",
    ],
    studentOrganizations: [
      "University of Toronto Students' Union",
      "Graduate Students' Union",
      "College student societies",
      "Professional associations",
    ],
    diningOptions: [
      "Residence dining halls",
      "Campus restaurants",
      "Food services",
      "Toronto dining scene",
    ],
    transportationInfo: [
      "TTC subway and buses",
      "GO Transit",
      "Campus shuttle",
      "Bike Share Toronto",
    ],
  },
];

// Sample scholarships data
const scholarshipsData = [
  {
    name: "Presidential Excellence Scholarship",
    type: "fully-funded" as const,
    amount: "$60,000 per year",
    description:
      "A prestigious full-ride scholarship awarded to exceptional students demonstrating outstanding academic achievement, leadership potential, and community service commitment.",
    requirements: [
      "GPA of 3.8 or higher",
      "SAT score of 1450+ or ACT score of 32+",
      "Demonstrated leadership experience",
      "Community service involvement",
      "Strong personal statement",
    ],
    deadline: "December 1, 2024",
    provider: "University Foundation",
    country: "United States",
    applicationUrl: "https://scholarships.university.edu/presidential",
    eligiblePrograms: ["All undergraduate programs"],
    maxRecipients: 25,
  },
  {
    name: "Dean's Excellence Award",
    type: "partially-funded" as const,
    amount: "$25,000 per year",
    description:
      "Merit-based scholarship recognizing academic excellence and potential for contribution to the university community.",
    requirements: [
      "GPA of 3.5 or higher",
      "Strong academic record",
      "Extracurricular involvement",
      "Two letters of recommendation",
    ],
    deadline: "January 15, 2025",
    provider: "Academic Affairs Office",
    country: "United States",
    applicationUrl: "https://scholarships.university.edu/deans",
    eligiblePrograms: ["All undergraduate programs", "Graduate programs"],
    maxRecipients: 100,
  },
  {
    name: "International Student Excellence Grant",
    type: "partially-funded" as const,
    amount: "$15,000 per year",
    description:
      "Supporting outstanding international students in their pursuit of higher education and fostering global diversity on campus.",
    requirements: [
      "International student status",
      "GPA of 3.2 or higher",
      "English proficiency test scores",
      "Financial need demonstration",
      "Cultural contribution essay",
    ],
    deadline: "March 1, 2025",
    provider: "International Student Services",
    country: "Multiple",
    applicationUrl: "https://international.university.edu/scholarships",
    eligiblePrograms: ["All programs for international students"],
    maxRecipients: 150,
  },
  {
    name: "STEM Innovation Scholarship",
    type: "fully-funded" as const,
    amount: "$45,000 per year",
    description:
      "Full scholarship for students pursuing Science, Technology, Engineering, and Mathematics programs with demonstrated innovation and research potential.",
    requirements: [
      "STEM program enrollment",
      "GPA of 3.7 or higher",
      "Research experience or project portfolio",
      "STEM competition participation",
      "Innovation project proposal",
    ],
    deadline: "November 30, 2024",
    provider: "STEM Education Foundation",
    country: "United States",
    applicationUrl: "https://stem.university.edu/scholarships",
    eligiblePrograms: [
      "Engineering",
      "Computer Science",
      "Mathematics",
      "Physics",
      "Chemistry",
      "Biology",
    ],
    maxRecipients: 40,
  },
  {
    name: "Need-Based Financial Aid Grant",
    type: "partially-funded" as const,
    amount: "$10,000 - $30,000",
    description:
      "Financial assistance program designed to help students from low-income families access quality higher education.",
    requirements: [
      "Demonstrated financial need",
      "FAFSA completion",
      "GPA of 2.5 or higher",
      "Satisfactory academic progress",
      "Income verification documents",
    ],
    deadline: "April 1, 2025",
    provider: "Financial Aid Office",
    country: "United States",
    applicationUrl: "https://financialaid.university.edu/grants",
    eligiblePrograms: ["All undergraduate programs"],
    maxRecipients: 500,
  },
  {
    name: "Commonwealth Scholarship",
    type: "fully-funded" as const,
    amount: "Full tuition + living allowance",
    description:
      "Prestigious scholarship for students from Commonwealth countries pursuing graduate studies, promoting academic collaboration and cultural exchange.",
    requirements: [
      "Commonwealth country citizenship",
      "First-class honors degree or equivalent",
      "Research proposal",
      "Two academic references",
      "English language proficiency",
    ],
    deadline: "October 15, 2024",
    provider: "Commonwealth Scholarship Commission",
    country: "United Kingdom",
    applicationUrl: "https://www.gov.uk/commonwealth-scholarships",
    eligiblePrograms: ["Master's programs", "PhD programs"],
    maxRecipients: 800,
  },
  {
    name: "MEXT Japanese Government Scholarship",
    type: "fully-funded" as const,
    amount: "¥143,000 per month + tuition waiver",
    description:
      "Government scholarship for international students to study in Japan, promoting international understanding and academic excellence.",
    requirements: [
      "Non-Japanese nationality",
      "Bachelor's degree for graduate programs",
      "Japanese language proficiency (preferred)",
      "Research plan",
      "Good health condition",
    ],
    deadline: "May 31, 2024",
    provider: "Ministry of Education, Culture, Sports, Science and Technology",
    country: "Japan",
    applicationUrl:
      "https://www.mext.go.jp/en/policy/education/highered/title02/detail02/sdetail02/1373897.htm",
    eligiblePrograms: ["Graduate programs", "Research programs"],
    maxRecipients: 1200,
  },
  {
    name: "Australia Awards Scholarship",
    type: "fully-funded" as const,
    amount: "Full tuition + living allowance + travel",
    description:
      "Australian government scholarship program developing skills and knowledge in priority development areas, strengthening ties between Australia and partner countries.",
    requirements: [
      "Citizenship of eligible country",
      "Minimum work experience",
      "Academic qualifications",
      "English language proficiency",
      "Leadership potential",
    ],
    deadline: "April 30, 2024",
    provider: "Australian Government",
    country: "Australia",
    applicationUrl: "https://www.dfat.gov.au/people-to-people/australia-awards",
    eligiblePrograms: ["Master's programs", "PhD programs"],
    maxRecipients: 1000,
  },
];

async function seedDatabase() {
  try {
    console.log("🌱 Starting database seeding...");

    // Clear existing data
    console.log("🧹 Clearing existing data...");
    await db.delete(universityScholarships);
    await db.delete(scholarships);
    await db.delete(universities);

    // Insert universities
    console.log("🏫 Inserting universities...");
    const insertedUniversities = await db
      .insert(universities)
      .values(universitiesData)
      .returning();
    console.log(`✅ Inserted ${insertedUniversities.length} universities`);

    // Insert scholarships
    console.log("🎓 Inserting scholarships...");
    const insertedScholarships = await db
      .insert(scholarships)
      .values(scholarshipsData)
      .returning();
    console.log(`✅ Inserted ${insertedScholarships.length} scholarships`);

    // Create university-scholarship relationships
    console.log("🔗 Creating university-scholarship relationships...");
    const relationships = [];

    // Harvard relationships
    const harvard = insertedUniversities.find(
      (u: any) => u.name === "Harvard University"
    );
    const presidential = insertedScholarships.find(
      (s: any) => s.name === "Presidential Excellence Scholarship"
    );
    const deans = insertedScholarships.find(
      (s: any) => s.name === "Dean's Excellence Award"
    );
    const needBased = insertedScholarships.find(
      (s: any) => s.name === "Need-Based Financial Aid Grant"
    );
    const stem = insertedScholarships.find(
      (s: any) => s.name === "STEM Innovation Scholarship"
    );

    if (harvard && presidential)
      relationships.push({
        universityId: harvard.id,
        scholarshipId: presidential.id,
      });
    if (harvard && deans)
      relationships.push({ universityId: harvard.id, scholarshipId: deans.id });
    if (harvard && needBased)
      relationships.push({
        universityId: harvard.id,
        scholarshipId: needBased.id,
      });
    if (harvard && stem)
      relationships.push({ universityId: harvard.id, scholarshipId: stem.id });

    // Stanford relationships
    const stanford = insertedUniversities.find(
      (u: any) => u.name === "Stanford University"
    );
    if (stanford && presidential)
      relationships.push({
        universityId: stanford.id,
        scholarshipId: presidential.id,
      });
    if (stanford && deans)
      relationships.push({
        universityId: stanford.id,
        scholarshipId: deans.id,
      });
    if (stanford && stem)
      relationships.push({ universityId: stanford.id, scholarshipId: stem.id });

    // Oxford relationships
    const oxford = insertedUniversities.find(
      (u: any) => u.name === "University of Oxford"
    );
    const commonwealth = insertedScholarships.find(
      (s: any) => s.name === "Commonwealth Scholarship"
    );
    const international = insertedScholarships.find(
      (s: any) => s.name === "International Student Excellence Grant"
    );

    if (oxford && commonwealth)
      relationships.push({
        universityId: oxford.id,
        scholarshipId: commonwealth.id,
      });
    if (oxford && international)
      relationships.push({
        universityId: oxford.id,
        scholarshipId: international.id,
      });

    // Tokyo relationships
    const tokyo = insertedUniversities.find(
      (u: any) => u.name === "University of Tokyo"
    );
    const mext = insertedScholarships.find(
      (s: any) => s.name === "MEXT Japanese Government Scholarship"
    );

    if (tokyo && mext)
      relationships.push({ universityId: tokyo.id, scholarshipId: mext.id });
    if (tokyo && international)
      relationships.push({
        universityId: tokyo.id,
        scholarshipId: international.id,
      });

    // Melbourne relationships
    const melbourne = insertedUniversities.find(
      (u: any) => u.name === "University of Melbourne"
    );
    const australia = insertedScholarships.find(
      (s: any) => s.name === "Australia Awards Scholarship"
    );

    if (melbourne && australia)
      relationships.push({
        universityId: melbourne.id,
        scholarshipId: australia.id,
      });
    if (melbourne && international)
      relationships.push({
        universityId: melbourne.id,
        scholarshipId: international.id,
      });

    // Toronto relationships
    const toronto = insertedUniversities.find(
      (u: any) => u.name === "University of Toronto"
    );
    if (toronto && international)
      relationships.push({
        universityId: toronto.id,
        scholarshipId: international.id,
      });
    if (toronto && deans)
      relationships.push({ universityId: toronto.id, scholarshipId: deans.id });

    if (relationships.length > 0) {
      await db.insert(universityScholarships).values(relationships);
      console.log(
        `✅ Created ${relationships.length} university-scholarship relationships`
      );
    }

    console.log("🎉 Database seeding completed successfully!");
    console.log(`
📊 Summary:
- Universities: ${insertedUniversities.length}
- Scholarships: ${insertedScholarships.length}
- Relationships: ${relationships.length}
    `);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

// Run the seed function
seedDatabase().then(() => {
  console.log("✨ Seeding process completed!");
  process.exit(0);
});

export { seedDatabase };
