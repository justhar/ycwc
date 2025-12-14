import {
  pgTable,
  serial,
  varchar,
  timestamp,
  date,
  text,
  integer,
  json,
  pgEnum,
  decimal,
  uuid,
  boolean,
} from "drizzle-orm/pg-core";

// Enums for user profile
export const targetLevelEnum = pgEnum("target_level", [
  "undergraduate",
  "master",
  "phd",
  "exchange",
]);
export const scoreScaleEnum = pgEnum("score_scale", [
  "gpa4",
  "percentage",
  "indo",
]);

// Enums for university
export const universityTypeEnum = pgEnum("university_type", [
  "public",
  "private",
]);

export const universitySourceEnum = pgEnum("university_source", [
  "manual",
  "ai_suggested",
]);

// Enums for scholarship
export const scholarshipTypeEnum = pgEnum("scholarship_type", [
  "fully-funded",
  "partially-funded",
  "tuition-only",
]);

// Enums for tracker
export const taskTypeEnum = pgEnum("task_type", [
  "GLOBAL",
  "UNIV_SPECIFIC",
  "GROUP",
]);

export const taskPriorityEnum = pgEnum("task_priority", [
  "MUST",
  "NEED",
  "NICE",
]);

export const taskStatusEnum = pgEnum("task_status", [
  "todo",
  "in_progress",
  "completed",
]);

export const subtaskPriorityEnum = pgEnum("subtask_priority", [
  "low",
  "medium",
  "high",
]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  fullName: varchar("fullName", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Separate profiles table for detailed user information
export const profiles = pgTable("profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull()
    .unique(),

  // Identity information
  dateOfBirth: date("date_of_birth"),
  nationality: varchar("nationality", { length: 100 }).default("Indonesia"),

  // Academic information
  targetLevel: targetLevelEnum("target_level"),
  intendedMajor: varchar("intended_major", { length: 255 }),
  intendedCountry: varchar("intended_country", { length: 100 }),
  budgetMin: integer("budget_min"),
  budgetMax: integer("budget_max"),
  institution: varchar("institution", { length: 255 }),
  graduationYear: integer("graduation_year"),
  academicScore: varchar("academic_score", { length: 10 }),
  scoreScale: scoreScaleEnum("score_scale").default("gpa4"),

  // JSON fields for arrays of related data
  englishTests: json("english_tests")
    .$type<
      Array<{
        id: string;
        type: string;
        customTestName?: string;
        score: string;
        date: string;
      }>
    >()
    .default([]),

  standardizedTests: json("standardized_tests")
    .$type<
      Array<{
        id: string;
        type: string;
        customTestName?: string;
        score: string;
        date: string;
      }>
    >()
    .default([]),

  awards: json("awards")
    .$type<
      Array<{
        id: string;
        title: string;
        year: string;
        level: string;
        description?: string;
      }>
    >()
    .default([]),

  extracurriculars: json("extracurriculars")
    .$type<
      Array<{
        id: string;
        activity: string;
        period: string;
        description?: string;
        role?: string;
      }>
    >()
    .default([]),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// Universities table
export const universities = pgTable("universities", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  location: varchar("location", { length: 255 }).notNull(),
  country: varchar("country", { length: 100 }).notNull(),
  ranking: integer("ranking").notNull(),
  studentCount: integer("student_count").notNull(),
  establishedYear: integer("established_year").notNull(),
  type: universityTypeEnum("type").notNull(),
  tuitionRange: varchar("tuition_range", { length: 255 }).notNull(),
  acceptanceRate: decimal("acceptance_rate", {
    precision: 5,
    scale: 2,
  }).notNull(),
  description: text("description").notNull(),
  website: varchar("website", { length: 500 }).notNull(),
  imageUrl: varchar("image_url", { length: 500 }),
  specialties: json("specialties").$type<string[]>().default([]),
  campusSize: varchar("campus_size", { length: 100 }),

  // UnivCard content fields
  roomBoardCost: varchar("room_board_cost", { length: 100 }),
  booksSuppliesCost: varchar("books_supplies_cost", { length: 100 }),
  personalExpensesCost: varchar("personal_expenses_cost", { length: 100 }),
  facilitiesInfo: json("facilities_info")
    .$type<{
      library?: string;
      recreationCenter?: string;
      researchLabs?: string;
      healthServices?: string;
      [key: string]: string | undefined;
    }>()
    .default({}),
  housingOptions: json("housing_options").$type<string[]>().default([]),
  studentOrganizations: json("student_organizations")
    .$type<string[]>()
    .default([]),
  diningOptions: json("dining_options").$type<string[]>().default([]),
  transportationInfo: json("transportation_info").$type<string[]>().default([]),

  source: universitySourceEnum("source").notNull().default("manual"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// Scholarships table
export const scholarships = pgTable("scholarships", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  type: scholarshipTypeEnum("type").notNull(),
  amount: varchar("amount", { length: 100 }).notNull(),
  description: text("description").notNull(),
  requirements: json("requirements").$type<string[]>().default([]),
  deadline: varchar("deadline", { length: 100 }).notNull(),
  provider: varchar("provider", { length: 255 }).notNull(),
  country: varchar("country", { length: 100 }).notNull(),
  applicationUrl: varchar("application_url", { length: 500 }),
  eligiblePrograms: json("eligible_programs").$type<string[]>().default([]),
  maxRecipients: integer("max_recipients"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// University-Scholarship relationship table (Many-to-Many)
export const universityScholarships = pgTable("university_scholarships", {
  id: uuid("id").defaultRandom().primaryKey(),
  universityId: uuid("university_id")
    .references(() => universities.id, { onDelete: "cascade" })
    .notNull(),
  scholarshipId: uuid("scholarship_id")
    .references(() => scholarships.id, { onDelete: "cascade" })
    .notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// User-University favorites relationship table (Many-to-Many)
export const userFavorites = pgTable("user_favorites", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: integer("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  universityId: uuid("university_id")
    .references(() => universities.id, { onDelete: "cascade" })
    .notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// User-Scholarship favorites relationship table (Many-to-Many)
export const userScholarshipFavorites = pgTable("user_scholarship_favorites", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: integer("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  scholarshipId: uuid("scholarship_id")
    .references(() => scholarships.id, { onDelete: "cascade" })
    .notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Task Groups table
export const taskGroups = pgTable("task_groups", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: integer("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  color: varchar("color", { length: 50 }).default("bg-blue-500"), // Tailwind CSS class
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// Tasks table
export const tasks = pgTable("tasks", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: integer("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  priority: taskPriorityEnum("priority").notNull(),
  dueDate: date("due_date"),
  status: taskStatusEnum("status").default("todo").notNull(),
  groupIds: json("group_ids").$type<string[]>().default([]), // array of task group IDs
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// Subtasks table
export const subtasks = pgTable("subtasks", {
  id: uuid("id").defaultRandom().primaryKey(),
  taskId: uuid("task_id")
    .references(() => tasks.id, { onDelete: "cascade" })
    .notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  priority: subtaskPriorityEnum("priority").default("medium").notNull(),
  completed: boolean("completed").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// Chat system tables
export const chats = pgTable("chats", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: integer("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  title: varchar("title", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const messages = pgTable("messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  chatId: uuid("chat_id")
    .references(() => chats.id, { onDelete: "cascade" })
    .notNull(),
  role: varchar("role", { length: 20 }).notNull(), // 'user' or 'assistant'
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});
