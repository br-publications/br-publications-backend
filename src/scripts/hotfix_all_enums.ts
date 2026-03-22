import { Sequelize } from 'sequelize';

export async function fixEnums(sequelize: Sequelize) {
    try {
        console.log('Running fixEnums...');
        
        const typesToUpdate = [
            'enum_individual_chapters_status',
            'enum_chapter_status_history_previous_status',
            'enum_chapter_status_history_new_status'
        ];

        const valuesToAdd = [
            'MANUSCRIPTS_PENDING',
            'REVIEWER_ASSIGNMENT',
            'ADDITIONAL_REVISION_REQUESTED',
            'EDITORIAL_REVIEW'
        ];

        for (const typeName of typesToUpdate) {
            for (const val of valuesToAdd) {
                try {
                    await sequelize.query(`ALTER TYPE "${typeName}" ADD VALUE IF NOT EXISTS '${val}';`);
                    console.log(`Added ${val} to ${typeName}`);
                } catch (e: any) {
                    console.log(`Could not add ${val} to ${typeName} (might already exist or type missing)`);
                }
            }
        }

        console.log('Successfully patched all implicitly generated Enums!');
    } catch (e) {
        console.error('fixEnums failed', e);
        throw e;
    }
}
