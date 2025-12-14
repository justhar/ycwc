import { db } from '../db/db.js';
import { sql } from 'drizzle-orm';
async function fixSubtaskCompleted() {
    try {
        console.log('Converting subtasks.completed column from JSON to boolean...');
        // Step 1: Drop the default value
        console.log('Step 1: Dropping default value...');
        await db.execute(sql `ALTER TABLE subtasks ALTER COLUMN completed DROP DEFAULT;`);
        // Step 2: Convert the column type
        console.log('Step 2: Converting column type...');
        await db.execute(sql `ALTER TABLE subtasks ALTER COLUMN completed SET DATA TYPE boolean USING (completed::text::boolean);`);
        // Step 3: Re-add the default value
        console.log('Step 3: Re-adding default value...');
        await db.execute(sql `ALTER TABLE subtasks ALTER COLUMN completed SET DEFAULT false;`);
        console.log('✓ Successfully converted completed column to boolean type');
        process.exit(0);
    }
    catch (error) {
        console.error('Error converting column:', error);
        process.exit(1);
    }
}
fixSubtaskCompleted();
