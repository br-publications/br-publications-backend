import { Sequelize } from 'sequelize';

export async function fixEnum(sequelize: Sequelize) {
    try {
        console.log('Running fixEnum...');
        
        await sequelize.query(
            "ALTER TYPE \"chapter_status_enum\" ADD VALUE IF NOT EXISTS 'MANUSCRIPTS_PENDING';"
        ).catch(e => console.log('Enum chapter_status_enum already has it or does not exist'));
        
        await sequelize.query(
            "ALTER TYPE \"enum_ individual_chapters_status\" ADD VALUE IF NOT EXISTS 'MANUSCRIPTS_PENDING';"
        ).catch(e => console.log('Enum enum_ individual_chapters_status already has it or does not exist'));

        await sequelize.query(
            "ALTER TYPE \"enum_individual_chapters_status\" ADD VALUE IF NOT EXISTS 'MANUSCRIPTS_PENDING';"
        ).catch(e => console.log('Enum enum_individual_chapters_status already has it or does not exist'));

        await sequelize.query(
            "UPDATE individual_chapters SET status = 'MANUSCRIPTS_PENDING' WHERE status = 'MANUSCRIPT_PENDING';"
        ).catch(e => console.log('No rows updated'));

        console.log('Successfully patched Enum directly in the Database!');
    } catch (e) {
        console.error('fixEnum failed', e);
        throw e;
    }
}
