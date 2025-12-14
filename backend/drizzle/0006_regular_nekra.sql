ALTER TABLE "subtasks" ALTER COLUMN "completed" DROP DEFAULT;
ALTER TABLE "subtasks" ALTER COLUMN "completed" SET DATA TYPE boolean USING (completed::text::boolean);
ALTER TABLE "subtasks" ALTER COLUMN "completed" SET DEFAULT false;