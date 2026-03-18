import { CONTACT_TEMPLATES } from './contactTemplates';
import { AUTH_TEMPLATES } from './authGeneralTemplate';
import { BOOK_CHAPTER_PUBLISHED_TEMPLATE } from './bookChapterPublishedTemplate';
import { PROJECT_TEMPLATES } from './projectTemplates';
import { RECRUITMENT_TEMPLATES } from './recruitmentTemplates';
import { TEXTBOOK_TEMPLATES } from './textbookTemplates';
import { BOOK_CHAPTER_TEMPLATES } from './bookChapterTemplates';

export const DEFAULT_TEMPLATES: Record<string, { subject: string; content: string; variables?: string[] }> = {
    ...CONTACT_TEMPLATES,
    ...AUTH_TEMPLATES,
    ...BOOK_CHAPTER_PUBLISHED_TEMPLATE,
    ...PROJECT_TEMPLATES,
    ...RECRUITMENT_TEMPLATES,
    ...TEXTBOOK_TEMPLATES,
    ...BOOK_CHAPTER_TEMPLATES
};
