CREATE TYPE "public"."scholarship_type" AS ENUM('fully-funded', 'partially-funded', 'tuition-only');--> statement-breakpoint
CREATE TYPE "public"."score_scale" AS ENUM('gpa4', 'percentage', 'indo');--> statement-breakpoint
CREATE TYPE "public"."subtask_priority" AS ENUM('low', 'medium', 'high');--> statement-breakpoint
CREATE TYPE "public"."target_level" AS ENUM('undergraduate', 'master', 'phd', 'exchange');--> statement-breakpoint
CREATE TYPE "public"."task_priority" AS ENUM('MUST', 'NEED', 'NICE');--> statement-breakpoint
CREATE TYPE "public"."task_status" AS ENUM('todo', 'in_progress', 'completed');--> statement-breakpoint
CREATE TYPE "public"."task_type" AS ENUM('GLOBAL', 'UNIV_SPECIFIC', 'GROUP');--> statement-breakpoint
CREATE TYPE "public"."university_source" AS ENUM('manual', 'ai_suggested');--> statement-breakpoint
CREATE TYPE "public"."university_type" AS ENUM('public', 'private');--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"date_of_birth" date,
	"nationality" varchar(100) DEFAULT 'Indonesia',
	"target_level" "target_level",
	"intended_major" varchar(255),
	"institution" varchar(255),
	"graduation_year" integer,
	"academic_score" varchar(10),
	"score_scale" "score_scale" DEFAULT 'gpa4',
	"english_tests" json DEFAULT '[]'::json,
	"standardized_tests" json DEFAULT '[]'::json,
	"awards" json DEFAULT '[]'::json,
	"extracurriculars" json DEFAULT '[]'::json,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "scholarships" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"type" "scholarship_type" NOT NULL,
	"amount" varchar(100) NOT NULL,
	"description" text NOT NULL,
	"requirements" json DEFAULT '[]'::json,
	"deadline" varchar(100) NOT NULL,
	"provider" varchar(255) NOT NULL,
	"country" varchar(100) NOT NULL,
	"application_url" varchar(500),
	"eligible_programs" json DEFAULT '[]'::json,
	"max_recipients" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "subtasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"task_id" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"priority" "subtask_priority" DEFAULT 'medium' NOT NULL,
	"completed" json DEFAULT 'false'::json NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "task_groups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"color" varchar(7) DEFAULT '#3b82f6',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" integer NOT NULL,
	"title" varchar(255) NOT NULL,
	"type" "task_type" NOT NULL,
	"priority" "task_priority" NOT NULL,
	"due_date" date,
	"status" "task_status" DEFAULT 'todo' NOT NULL,
	"group_ids" json DEFAULT '[]'::json,
	"notes" text,
	"tags" json DEFAULT '[]'::json,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "universities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"location" varchar(255) NOT NULL,
	"country" varchar(100) NOT NULL,
	"ranking" integer NOT NULL,
	"student_count" integer NOT NULL,
	"established_year" integer NOT NULL,
	"type" "university_type" NOT NULL,
	"tuition_range" varchar(100) NOT NULL,
	"acceptance_rate" numeric(5, 2) NOT NULL,
	"description" text NOT NULL,
	"website" varchar(500) NOT NULL,
	"image_url" varchar(500),
	"specialties" json DEFAULT '[]'::json,
	"campus_size" varchar(100),
	"room_board_cost" varchar(50),
	"books_supplies_cost" varchar(50),
	"personal_expenses_cost" varchar(50),
	"facilities_info" json DEFAULT '{}'::json,
	"housing_options" json DEFAULT '[]'::json,
	"student_organizations" json DEFAULT '[]'::json,
	"dining_options" json DEFAULT '[]'::json,
	"transportation_info" json DEFAULT '[]'::json,
	"source" "university_source" DEFAULT 'manual' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "university_scholarships" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"university_id" uuid NOT NULL,
	"scholarship_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_favorites" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" integer NOT NULL,
	"university_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_scholarship_favorites" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" integer NOT NULL,
	"scholarship_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"fullName" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subtasks" ADD CONSTRAINT "subtasks_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_groups" ADD CONSTRAINT "task_groups_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "university_scholarships" ADD CONSTRAINT "university_scholarships_university_id_universities_id_fk" FOREIGN KEY ("university_id") REFERENCES "public"."universities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "university_scholarships" ADD CONSTRAINT "university_scholarships_scholarship_id_scholarships_id_fk" FOREIGN KEY ("scholarship_id") REFERENCES "public"."scholarships"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_favorites" ADD CONSTRAINT "user_favorites_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_favorites" ADD CONSTRAINT "user_favorites_university_id_universities_id_fk" FOREIGN KEY ("university_id") REFERENCES "public"."universities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_scholarship_favorites" ADD CONSTRAINT "user_scholarship_favorites_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_scholarship_favorites" ADD CONSTRAINT "user_scholarship_favorites_scholarship_id_scholarships_id_fk" FOREIGN KEY ("scholarship_id") REFERENCES "public"."scholarships"("id") ON DELETE cascade ON UPDATE no action;