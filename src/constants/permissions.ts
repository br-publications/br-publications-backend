/**
 * Permission System Constants
 * 
 * SECURITY NOTICE:
 * This file contains all permission definitions and MUST NEVER be exposed to the frontend.
 * Only permission IDs, display names, and descriptions should be sent to the client.
 * The actual permission logic and validation happens server-side only.
 */

import { UserRole } from '../models/user';

// Permission Categories
export const PERMISSION_CATEGORIES = {
    USER_MANAGEMENT: 'user_management',
    TEXTBOOK_SUBMISSIONS: 'textbook_submissions',
    BOOK_CHAPTER_SUBMISSIONS: 'book_chapter_submissions',
    CHAPTER_REVIEWS: 'chapter_reviews',
    RECRUITMENT: 'recruitment',
    PROJECTS_INTERNSHIPS: 'projects_internships',
    NOTIFICATIONS: 'notifications',
    CONTENT_MANAGEMENT: 'content_management',
    SYSTEM_ADMINISTRATION: 'system_administration',
    FILE_MANAGEMENT: 'file_management',
    DISCUSSION_COMMUNICATION: 'discussion_communication',
    PROFILE_MANAGEMENT: 'profile_management',
} as const;

export const CATEGORY_DISPLAY_NAMES: Record<string, string> = {
    [PERMISSION_CATEGORIES.USER_MANAGEMENT]: 'User Management',
    [PERMISSION_CATEGORIES.TEXTBOOK_SUBMISSIONS]: 'Text Book Submissions',
    [PERMISSION_CATEGORIES.BOOK_CHAPTER_SUBMISSIONS]: 'Book Chapter Submissions',
    [PERMISSION_CATEGORIES.CHAPTER_REVIEWS]: 'Chapter Reviews',
    [PERMISSION_CATEGORIES.RECRUITMENT]: 'Recruitment',
    [PERMISSION_CATEGORIES.PROJECTS_INTERNSHIPS]: 'Projects & Internships',
    [PERMISSION_CATEGORIES.NOTIFICATIONS]: 'Notifications',
    [PERMISSION_CATEGORIES.CONTENT_MANAGEMENT]: 'Content Management',
    [PERMISSION_CATEGORIES.SYSTEM_ADMINISTRATION]: 'System & Administration',
    [PERMISSION_CATEGORIES.FILE_MANAGEMENT]: 'File Management',
    [PERMISSION_CATEGORIES.DISCUSSION_COMMUNICATION]: 'Discussion & Communication',
    [PERMISSION_CATEGORIES.PROFILE_MANAGEMENT]: 'Profile Management',
};

// Permission Definition Interface
export interface PermissionDefinition {
    id: string;
    displayName: string;
    description: string;
    category: string;
}

// All 95 Permissions with Metadata
export const PERMISSIONS: Record<string, PermissionDefinition> = {
    // USER MANAGEMENT (12 permissions)
    'user:create': {
        id: 'user:create',
        displayName: 'Create Users',
        description: 'Create new user accounts',
        category: PERMISSION_CATEGORIES.USER_MANAGEMENT,
    },
    'user:read': {
        id: 'user:read',
        displayName: 'View User Details',
        description: 'View user profile information',
        category: PERMISSION_CATEGORIES.USER_MANAGEMENT,
    },
    'user:update': {
        id: 'user:update',
        displayName: 'Update Users',
        description: 'Update user profile information',
        category: PERMISSION_CATEGORIES.USER_MANAGEMENT,
    },
    'user:delete': {
        id: 'user:delete',
        displayName: 'Deactivate Users',
        description: 'Deactivate user accounts (soft delete)',
        category: PERMISSION_CATEGORIES.USER_MANAGEMENT,
    },
    'user:permanent-delete': {
        id: 'user:permanent-delete',
        displayName: 'Permanently Delete Users',
        description: 'Permanently delete user accounts (hard delete)',
        category: PERMISSION_CATEGORIES.USER_MANAGEMENT,
    },
    'user:assign-roles': {
        id: 'user:assign-roles',
        displayName: 'Assign Roles',
        description: 'Assign or change user roles',
        category: PERMISSION_CATEGORIES.USER_MANAGEMENT,
    },
    'user:view-all': {
        id: 'user:view-all',
        displayName: 'View All Users',
        description: 'View all users with pagination and search',
        category: PERMISSION_CATEGORIES.USER_MANAGEMENT,
    },
    'user:reactivate': {
        id: 'user:reactivate',
        displayName: 'Reactivate Users',
        description: 'Reactivate deactivated user accounts',
        category: PERMISSION_CATEGORIES.USER_MANAGEMENT,
    },
    'user:impersonate': {
        id: 'user:impersonate',
        displayName: 'Impersonate Users',
        description: 'Login as another user',
        category: PERMISSION_CATEGORIES.USER_MANAGEMENT,
    },
    'user:email-user': {
        id: 'user:email-user',
        displayName: 'Email Users',
        description: 'Send emails to users',
        category: PERMISSION_CATEGORIES.USER_MANAGEMENT,
    },
    'user:view-stats': {
        id: 'user:view-stats',
        displayName: 'View User Statistics',
        description: 'View user and reviewer statistics',
        category: PERMISSION_CATEGORIES.USER_MANAGEMENT,
    },
    'user:manage-reviewers': {
        id: 'user:manage-reviewers',
        displayName: 'Manage Reviewers',
        description: 'Manage reviewer accounts',
        category: PERMISSION_CATEGORIES.USER_MANAGEMENT,
    },

    // TEXTBOOK SUBMISSIONS (15 permissions)
    'textbook:submit': {
        id: 'textbook:submit',
        displayName: 'Submit Text Books',
        description: 'Submit new text book proposals',
        category: PERMISSION_CATEGORIES.TEXTBOOK_SUBMISSIONS,
    },
    'textbook:view-own': {
        id: 'textbook:view-own',
        displayName: 'View Own Submissions',
        description: 'View own text book submissions',
        category: PERMISSION_CATEGORIES.TEXTBOOK_SUBMISSIONS,
    },
    'textbook:view-all': {
        id: 'textbook:view-all',
        displayName: 'View All Submissions',
        description: 'View all text book submissions',
        category: PERMISSION_CATEGORIES.TEXTBOOK_SUBMISSIONS,
    },
    'textbook:view-stats': {
        id: 'textbook:view-stats',
        displayName: 'View Submission Statistics',
        description: 'View text book submission statistics',
        category: PERMISSION_CATEGORIES.TEXTBOOK_SUBMISSIONS,
    },
    'textbook:update-own': {
        id: 'textbook:update-own',
        displayName: 'Update Own Submissions',
        description: 'Update own text book submission details',
        category: PERMISSION_CATEGORIES.TEXTBOOK_SUBMISSIONS,
    },
    'textbook:proposal-decision': {
        id: 'textbook:proposal-decision',
        displayName: 'Make Proposal Decisions',
        description: 'Accept or reject text book proposals',
        category: PERMISSION_CATEGORIES.TEXTBOOK_SUBMISSIONS,
    },
    'textbook:request-revision': {
        id: 'textbook:request-revision',
        displayName: 'Request Revisions',
        description: 'Request revisions from authors',
        category: PERMISSION_CATEGORIES.TEXTBOOK_SUBMISSIONS,
    },
    'textbook:submit-revision': {
        id: 'textbook:submit-revision',
        displayName: 'Submit Revisions',
        description: 'Submit revised text book content',
        category: PERMISSION_CATEGORIES.TEXTBOOK_SUBMISSIONS,
    },
    'textbook:final-decision': {
        id: 'textbook:final-decision',
        displayName: 'Make Final Decisions',
        description: 'Make final accept/reject decisions',
        category: PERMISSION_CATEGORIES.TEXTBOOK_SUBMISSIONS,
    },
    'textbook:apply-isbn': {
        id: 'textbook:apply-isbn',
        displayName: 'Apply for ISBN',
        description: 'Apply for ISBN numbers',
        category: PERMISSION_CATEGORIES.TEXTBOOK_SUBMISSIONS,
    },
    'textbook:receive-isbn': {
        id: 'textbook:receive-isbn',
        displayName: 'Record ISBN Receipt',
        description: 'Record ISBN receipt',
        category: PERMISSION_CATEGORIES.TEXTBOOK_SUBMISSIONS,
    },
    'textbook:start-publication': {
        id: 'textbook:start-publication',
        displayName: 'Start Publication',
        description: 'Start the publication process',
        category: PERMISSION_CATEGORIES.TEXTBOOK_SUBMISSIONS,
    },
    'textbook:publish': {
        id: 'textbook:publish',
        displayName: 'Publish Text Books',
        description: 'Publish text books with cover images',
        category: PERMISSION_CATEGORIES.TEXTBOOK_SUBMISSIONS,
    },
    'textbook:download-files': {
        id: 'textbook:download-files',
        displayName: 'Download Files',
        description: 'Download text book submission files',
        category: PERMISSION_CATEGORIES.TEXTBOOK_SUBMISSIONS,
    },
    'textbook:discussion': {
        id: 'textbook:discussion',
        displayName: 'Manage Discussions',
        description: 'Send and view discussion messages',
        category: PERMISSION_CATEGORIES.TEXTBOOK_SUBMISSIONS,
    },

    // BOOK CHAPTER SUBMISSIONS (19 permissions)
    'chapter:submit': {
        id: 'chapter:submit',
        displayName: 'Submit Chapters',
        description: 'Submit book chapter proposals',
        category: PERMISSION_CATEGORIES.BOOK_CHAPTER_SUBMISSIONS,
    },
    'chapter:view-own': {
        id: 'chapter:view-own',
        displayName: 'View Own Chapters',
        description: 'View own chapter submissions',
        category: PERMISSION_CATEGORIES.BOOK_CHAPTER_SUBMISSIONS,
    },
    'chapter:view-all': {
        id: 'chapter:view-all',
        displayName: 'View All Chapters',
        description: 'View all chapter submissions',
        category: PERMISSION_CATEGORIES.BOOK_CHAPTER_SUBMISSIONS,
    },
    'chapter:update-own': {
        id: 'chapter:update-own',
        displayName: 'Update Own Chapters',
        description: 'Update own chapter details',
        category: PERMISSION_CATEGORIES.BOOK_CHAPTER_SUBMISSIONS,
    },
    'chapter:delete-own': {
        id: 'chapter:delete-own',
        displayName: 'Delete Own Chapters',
        description: 'Delete own chapters (if initial submission)',
        category: PERMISSION_CATEGORIES.BOOK_CHAPTER_SUBMISSIONS,
    },
    'chapter:upload-full-chapter': {
        id: 'chapter:upload-full-chapter',
        displayName: 'Upload Full Chapter',
        description: 'Upload full chapter after acceptance',
        category: PERMISSION_CATEGORIES.BOOK_CHAPTER_SUBMISSIONS,
    },
    'chapter:upload-manuscript': {
        id: 'chapter:upload-manuscript',
        displayName: 'Upload Manuscript',
        description: 'Upload chapter manuscript',
        category: PERMISSION_CATEGORIES.BOOK_CHAPTER_SUBMISSIONS,
    },
    'chapter:submit-revision': {
        id: 'chapter:submit-revision',
        displayName: 'Submit Chapter Revisions',
        description: 'Submit revised chapter content',
        category: PERMISSION_CATEGORIES.BOOK_CHAPTER_SUBMISSIONS,
    },
    'chapter:view-history': {
        id: 'chapter:view-history',
        displayName: 'View Status History',
        description: 'View submission status history',
        category: PERMISSION_CATEGORIES.BOOK_CHAPTER_SUBMISSIONS,
    },
    'chapter:assign-editor': {
        id: 'chapter:assign-editor',
        displayName: 'Assign Editors',
        description: 'Assign editors to submissions',
        category: PERMISSION_CATEGORIES.BOOK_CHAPTER_SUBMISSIONS,
    },
    'chapter:editor-decision': {
        id: 'chapter:editor-decision',
        displayName: 'Make Editor Decisions',
        description: 'Accept or reject chapter submissions',
        category: PERMISSION_CATEGORIES.BOOK_CHAPTER_SUBMISSIONS,
    },
    'chapter:accept-abstract': {
        id: 'chapter:accept-abstract',
        displayName: 'Accept Abstracts',
        description: 'Accept chapter abstracts',
        category: PERMISSION_CATEGORIES.BOOK_CHAPTER_SUBMISSIONS,
    },
    'chapter:assign-reviewers': {
        id: 'chapter:assign-reviewers',
        displayName: 'Assign Reviewers',
        description: 'Assign reviewers to chapters',
        category: PERMISSION_CATEGORIES.BOOK_CHAPTER_SUBMISSIONS,
    },
    'chapter:reassign-reviewer': {
        id: 'chapter:reassign-reviewer',
        displayName: 'Reassign Reviewers',
        description: 'Reassign reviewers',
        category: PERMISSION_CATEGORIES.BOOK_CHAPTER_SUBMISSIONS,
    },
    'chapter:final-decision': {
        id: 'chapter:final-decision',
        displayName: 'Make Final Chapter Decisions',
        description: 'Make final approval or rejection',
        category: PERMISSION_CATEGORIES.BOOK_CHAPTER_SUBMISSIONS,
    },
    'chapter:publish': {
        id: 'chapter:publish',
        displayName: 'Publish Chapters',
        description: 'Publish approved chapters',
        category: PERMISSION_CATEGORIES.BOOK_CHAPTER_SUBMISSIONS,
    },
    'chapter:view-stats': {
        id: 'chapter:view-stats',
        displayName: 'View Chapter Statistics',
        description: 'View chapter submission statistics',
        category: PERMISSION_CATEGORIES.BOOK_CHAPTER_SUBMISSIONS,
    },
    'chapter:download-files': {
        id: 'chapter:download-files',
        displayName: 'Download Chapter Files',
        description: 'Download chapter files',
        category: PERMISSION_CATEGORIES.BOOK_CHAPTER_SUBMISSIONS,
    },
    'chapter:discussion': {
        id: 'chapter:discussion',
        displayName: 'Chapter Discussions',
        description: 'Post and view chapter discussion messages',
        category: PERMISSION_CATEGORIES.BOOK_CHAPTER_SUBMISSIONS,
    },

    // CHAPTER REVIEWS (8 permissions)
    'review:view-assignments': {
        id: 'review:view-assignments',
        displayName: 'View Review Assignments',
        description: 'View assigned reviews',
        category: PERMISSION_CATEGORIES.CHAPTER_REVIEWS,
    },
    'review:accept-assignment': {
        id: 'review:accept-assignment',
        displayName: 'Accept Assignments',
        description: 'Accept review assignments',
        category: PERMISSION_CATEGORIES.CHAPTER_REVIEWS,
    },
    'review:decline-assignment': {
        id: 'review:decline-assignment',
        displayName: 'Decline Assignments',
        description: 'Decline review assignments',
        category: PERMISSION_CATEGORIES.CHAPTER_REVIEWS,
    },
    'review:start-review': {
        id: 'review:start-review',
        displayName: 'Start Reviews',
        description: 'Start the review process',
        category: PERMISSION_CATEGORIES.CHAPTER_REVIEWS,
    },
    'review:save-draft': {
        id: 'review:save-draft',
        displayName: 'Save Review Drafts',
        description: 'Save review drafts',
        category: PERMISSION_CATEGORIES.CHAPTER_REVIEWS,
    },
    'review:submit-review': {
        id: 'review:submit-review',
        displayName: 'Submit Reviews',
        description: 'Submit completed reviews',
        category: PERMISSION_CATEGORIES.CHAPTER_REVIEWS,
    },
    'review:request-revision': {
        id: 'review:request-revision',
        displayName: 'Request Author Revisions',
        description: 'Request revisions from authors',
        category: PERMISSION_CATEGORIES.CHAPTER_REVIEWS,
    },
    'review:view-own': {
        id: 'review:view-own',
        displayName: 'View Own Reviews',
        description: 'View own review history',
        category: PERMISSION_CATEGORIES.CHAPTER_REVIEWS,
    },

    // RECRUITMENT (5 permissions)
    'recruitment:submit': {
        id: 'recruitment:submit',
        displayName: 'Submit Applications',
        description: 'Submit recruitment applications',
        category: PERMISSION_CATEGORIES.RECRUITMENT,
    },
    'recruitment:view-own': {
        id: 'recruitment:view-own',
        displayName: 'View Own Applications',
        description: 'View own recruitment applications',
        category: PERMISSION_CATEGORIES.RECRUITMENT,
    },
    'recruitment:view-all': {
        id: 'recruitment:view-all',
        displayName: 'View All Applications',
        description: 'View all recruitment applications',
        category: PERMISSION_CATEGORIES.RECRUITMENT,
    },
    'recruitment:update-status': {
        id: 'recruitment:update-status',
        displayName: 'Update Application Status',
        description: 'Accept or reject recruitment applications',
        category: PERMISSION_CATEGORIES.RECRUITMENT,
    },
    'recruitment:assign-role': {
        id: 'recruitment:assign-role',
        displayName: 'Assign Roles on Acceptance',
        description: 'Assign roles during application acceptance',
        category: PERMISSION_CATEGORIES.RECRUITMENT,
    },

    // PROJECTS & INTERNSHIPS (4 permissions)
    'project:submit': {
        id: 'project:submit',
        displayName: 'Submit Applications',
        description: 'Submit project/internship applications',
        category: PERMISSION_CATEGORIES.PROJECTS_INTERNSHIPS,
    },
    'project:view-own': {
        id: 'project:view-own',
        displayName: 'View Own Applications',
        description: 'View own project/internship submissions',
        category: PERMISSION_CATEGORIES.PROJECTS_INTERNSHIPS,
    },
    'project:view-all': {
        id: 'project:view-all',
        displayName: 'View All Applications',
        description: 'View all project/internship submissions',
        category: PERMISSION_CATEGORIES.PROJECTS_INTERNSHIPS,
    },
    'project:update-status': {
        id: 'project:update-status',
        displayName: 'Update Application Status',
        description: 'Accept or reject project/internship applications',
        category: PERMISSION_CATEGORIES.PROJECTS_INTERNSHIPS,
    },

    // NOTIFICATIONS (4 permissions)
    'notification:view-own': {
        id: 'notification:view-own',
        displayName: 'View Own Notifications',
        description: 'View own notifications',
        category: PERMISSION_CATEGORIES.NOTIFICATIONS,
    },
    'notification:mark-read': {
        id: 'notification:mark-read',
        displayName: 'Mark as Read',
        description: 'Mark notifications as read',
        category: PERMISSION_CATEGORIES.NOTIFICATIONS,
    },
    'notification:delete-own': {
        id: 'notification:delete-own',
        displayName: 'Delete Own Notifications',
        description: 'Delete own notifications',
        category: PERMISSION_CATEGORIES.NOTIFICATIONS,
    },
    'notification:create': {
        id: 'notification:create',
        displayName: 'Create Notifications',
        description: 'Create notifications for users',
        category: PERMISSION_CATEGORIES.NOTIFICATIONS,
    },

    // CONTENT MANAGEMENT (5 permissions)
    'content:view-contact': {
        id: 'content:view-contact',
        displayName: 'View Contact Details',
        description: 'View contact page details (public)',
        category: PERMISSION_CATEGORIES.CONTENT_MANAGEMENT,
    },
    'content:update-contact': {
        id: 'content:update-contact',
        displayName: 'Update Contact Details',
        description: 'Update contact page details',
        category: PERMISSION_CATEGORIES.CONTENT_MANAGEMENT,
    },
    'content:view-about': {
        id: 'content:view-about',
        displayName: 'View About Page',
        description: 'View about page content (public)',
        category: PERMISSION_CATEGORIES.CONTENT_MANAGEMENT,
    },
    'content:update-about': {
        id: 'content:update-about',
        displayName: 'Update About Page',
        description: 'Update about page content',
        category: PERMISSION_CATEGORIES.CONTENT_MANAGEMENT,
    },
    'content:view-published-books': {
        id: 'content:view-published-books',
        displayName: 'View Published Books',
        description: 'View published books (public)',
        category: PERMISSION_CATEGORIES.CONTENT_MANAGEMENT,
    },

    // SYSTEM & ADMINISTRATION (10 permissions)
    'system:view-logs': {
        id: 'system:view-logs',
        displayName: 'View System Logs',
        description: 'View system logs',
        category: PERMISSION_CATEGORIES.SYSTEM_ADMINISTRATION,
    },
    'system:view-metrics': {
        id: 'system:view-metrics',
        displayName: 'View System Metrics',
        description: 'View system metrics',
        category: PERMISSION_CATEGORIES.SYSTEM_ADMINISTRATION,
    },
    'debug:enable': {
        id: 'debug:enable',
        displayName: 'Enable Debug Mode',
        description: 'Enable debug mode',
        category: PERMISSION_CATEGORIES.SYSTEM_ADMINISTRATION,
    },
    'analytics:view-api-usage': {
        id: 'analytics:view-api-usage',
        displayName: 'View API Usage',
        description: 'View API usage analytics',
        category: PERMISSION_CATEGORIES.SYSTEM_ADMINISTRATION,
    },
    'bulk:import-users': {
        id: 'bulk:import-users',
        displayName: 'Bulk Import Users',
        description: 'Bulk import user accounts',
        category: PERMISSION_CATEGORIES.SYSTEM_ADMINISTRATION,
    },
    'database:view-schema': {
        id: 'database:view-schema',
        displayName: 'View Database Schema',
        description: 'View database schema',
        category: PERMISSION_CATEGORIES.SYSTEM_ADMINISTRATION,
    },
    'settings:read': {
        id: 'settings:read',
        displayName: 'View Settings',
        description: 'View system settings',
        category: PERMISSION_CATEGORIES.SYSTEM_ADMINISTRATION,
    },
    'settings:update': {
        id: 'settings:update',
        displayName: 'Update Settings',
        description: 'Update system settings',
        category: PERMISSION_CATEGORIES.SYSTEM_ADMINISTRATION,
    },
    'reports:generate': {
        id: 'reports:generate',
        displayName: 'Generate Reports',
        description: 'Generate system reports',
        category: PERMISSION_CATEGORIES.SYSTEM_ADMINISTRATION,
    },
    'reports:export': {
        id: 'reports:export',
        displayName: 'Export Reports',
        description: 'Export system reports',
        category: PERMISSION_CATEGORIES.SYSTEM_ADMINISTRATION,
    },

    // FILE MANAGEMENT (5 permissions)
    'file:upload': {
        id: 'file:upload',
        displayName: 'Upload Files',
        description: 'Upload files',
        category: PERMISSION_CATEGORIES.FILE_MANAGEMENT,
    },
    'file:view-own': {
        id: 'file:view-own',
        displayName: 'View Own Files',
        description: 'View own uploaded files',
        category: PERMISSION_CATEGORIES.FILE_MANAGEMENT,
    },
    'file:view-assigned': {
        id: 'file:view-assigned',
        displayName: 'View Assigned Files',
        description: 'View files for assigned reviews',
        category: PERMISSION_CATEGORIES.FILE_MANAGEMENT,
    },
    'file:delete-own': {
        id: 'file:delete-own',
        displayName: 'Delete Own Files',
        description: 'Delete own files',
        category: PERMISSION_CATEGORIES.FILE_MANAGEMENT,
    },
    'file:download': {
        id: 'file:download',
        displayName: 'Download Files',
        description: 'Download files',
        category: PERMISSION_CATEGORIES.FILE_MANAGEMENT,
    },

    // DISCUSSION & COMMUNICATION (5 permissions)
    'discussion:create': {
        id: 'discussion:create',
        displayName: 'Create Discussions',
        description: 'Create discussion messages',
        category: PERMISSION_CATEGORIES.DISCUSSION_COMMUNICATION,
    },
    'discussion:create-on-own': {
        id: 'discussion:create-on-own',
        displayName: 'Discuss Own Submissions',
        description: 'Create discussions on own submissions',
        category: PERMISSION_CATEGORIES.DISCUSSION_COMMUNICATION,
    },
    'discussion:read': {
        id: 'discussion:read',
        displayName: 'Read All Discussions',
        description: 'Read all discussion messages',
        category: PERMISSION_CATEGORIES.DISCUSSION_COMMUNICATION,
    },
    'discussion:read-own': {
        id: 'discussion:read-own',
        displayName: 'Read Own Discussions',
        description: 'Read discussions on own submissions',
        category: PERMISSION_CATEGORIES.DISCUSSION_COMMUNICATION,
    },
    'discussion:delete': {
        id: 'discussion:delete',
        displayName: 'Delete Discussions',
        description: 'Delete discussion messages',
        category: PERMISSION_CATEGORIES.DISCUSSION_COMMUNICATION,
    },

    // PROFILE MANAGEMENT (3 permissions)
    'profile:view-own': {
        id: 'profile:view-own',
        displayName: 'View Own Profile',
        description: 'View own user profile',
        category: PERMISSION_CATEGORIES.PROFILE_MANAGEMENT,
    },
    'profile:update-own': {
        id: 'profile:update-own',
        displayName: 'Update Own Profile',
        description: 'Update own user profile',
        category: PERMISSION_CATEGORIES.PROFILE_MANAGEMENT,
    },
    'profile:view-others': {
        id: 'profile:view-others',
        displayName: 'View Other Profiles',
        description: 'View other user profiles',
        category: PERMISSION_CATEGORIES.PROFILE_MANAGEMENT,
    },

    // Wildcard permissions for Super Admin
    'admin:all': {
        id: 'admin:all',
        displayName: 'All Admin Permissions',
        description: 'Grants all administrative permissions',
        category: PERMISSION_CATEGORIES.SYSTEM_ADMINISTRATION,
    },
    'user:all': {
        id: 'user:all',
        displayName: 'All User Permissions',
        description: 'Grants all user management permissions',
        category: PERMISSION_CATEGORIES.USER_MANAGEMENT,
    },
    'submission:all': {
        id: 'submission:all',
        displayName: 'All Submission Permissions',
        description: 'Grants all submission-related permissions',
        category: PERMISSION_CATEGORIES.TEXTBOOK_SUBMISSIONS,
    },
};

// Default Role Permission Mappings
export const DEFAULT_ROLE_PERMISSIONS: Record<UserRole, string[]> = {
    [UserRole.DEVELOPER]: [
        // Super Admin has ALL permissions
        ...Object.keys(PERMISSIONS),
    ],

    [UserRole.ADMIN]: [
        // User Management (11 of 12 - no permanent delete)
        'user:create',
        'user:read',
        'user:update',
        'user:delete',
        'user:assign-roles',
        'user:view-all',
        'user:reactivate',
        'user:impersonate',
        'user:email-user',
        'user:view-stats',
        'user:manage-reviewers',

        // Text Book Submissions (all 15)
        'textbook:submit',
        'textbook:view-own',
        'textbook:view-all',
        'textbook:view-stats',
        'textbook:update-own',
        'textbook:proposal-decision',
        'textbook:request-revision',
        'textbook:submit-revision',
        'textbook:final-decision',
        'textbook:apply-isbn',
        'textbook:receive-isbn',
        'textbook:start-publication',
        'textbook:publish',
        'textbook:download-files',
        'textbook:discussion',

        // Book Chapter Submissions (all 19)
        'chapter:submit',
        'chapter:view-own',
        'chapter:view-all',
        'chapter:update-own',
        'chapter:delete-own',
        'chapter:upload-full-chapter',
        'chapter:upload-manuscript',
        'chapter:submit-revision',
        'chapter:view-history',
        'chapter:assign-editor',
        'chapter:editor-decision',
        'chapter:accept-abstract',
        'chapter:assign-reviewers',
        'chapter:reassign-reviewer',
        'chapter:final-decision',
        'chapter:publish',
        'chapter:view-stats',
        'chapter:download-files',
        'chapter:discussion',

        // Recruitment (all 5)
        'recruitment:submit',
        'recruitment:view-own',
        'recruitment:view-all',
        'recruitment:update-status',
        'recruitment:assign-role',

        // Projects & Internships (all 4)
        'project:submit',
        'project:view-own',
        'project:view-all',
        'project:update-status',

        // Content Management (all 5)
        'content:view-contact',
        'content:update-contact',
        'content:view-about',
        'content:update-about',
        'content:view-published-books',

        // System & Administration (6 of 10)
        'settings:read',
        'settings:update',
        'reports:generate',
        'reports:export',

        // Notifications (all 4)
        'notification:view-own',
        'notification:mark-read',
        'notification:delete-own',
        'notification:create',

        // File Management (all 5)
        'file:upload',
        'file:view-own',
        'file:view-assigned',
        'file:delete-own',
        'file:download',

        // Discussion (all 5)
        'discussion:create',
        'discussion:create-on-own',
        'discussion:read',
        'discussion:read-own',
        'discussion:delete',

        // Profile (all 3)
        'profile:view-own',
        'profile:update-own',
        'profile:view-others',
    ],

    [UserRole.EDITOR]: [
        // Chapter Submissions (subset)
        'chapter:view-all',
        'chapter:editor-decision',
        'chapter:accept-abstract',
        'chapter:assign-reviewers',
        'chapter:reassign-reviewer',
        'chapter:final-decision',
        'chapter:view-stats',
        'chapter:download-files',
        'chapter:discussion',

        // Recruitment
        'recruitment:view-all',
        'recruitment:update-status',
        'recruitment:assign-role',

        // Projects
        'project:view-all',

        // User Management (limited)
        'user:view-all',
        'user:email-user',
        'user:impersonate',
        'user:view-stats',

        // Reviews
        'review:view-assignments',

        // Discussion
        'discussion:create',
        'discussion:read',

        // File Management
        'file:download',
        'file:view-assigned',

        // Notifications
        'notification:view-own',
        'notification:mark-read',
        'notification:delete-own',
        'notification:create',

        // Profile
        'profile:view-own',
        'profile:update-own',
        'profile:view-others',
    ],

    [UserRole.REVIEWER]: [
        // Reviews (all 8)
        'review:view-assignments',
        'review:accept-assignment',
        'review:decline-assignment',
        'review:start-review',
        'review:save-draft',
        'review:submit-review',
        'review:request-revision',
        'review:view-own',

        // Chapter Submissions (limited)
        'chapter:view-history',
        'chapter:discussion',

        // Discussion
        'discussion:create',
        'discussion:read',

        // File Management
        'file:view-assigned',
        'file:download',

        // Notifications
        'notification:view-own',
        'notification:mark-read',
        'notification:delete-own',

        // Profile
        'profile:view-own',
        'profile:update-own',
    ],

    [UserRole.AUTHOR]: [
        // Text Book Submissions
        'textbook:submit',
        'textbook:view-own',
        'textbook:view-stats',
        'textbook:update-own',
        'textbook:submit-revision',
        'textbook:download-files',
        'textbook:discussion',

        // Chapter Submissions
        'chapter:submit',
        'chapter:view-own',
        'chapter:update-own',
        'chapter:delete-own',
        'chapter:upload-full-chapter',
        'chapter:upload-manuscript',
        'chapter:submit-revision',
        'chapter:view-history',
        'chapter:download-files',
        'chapter:discussion',

        // File Management
        'file:upload',
        'file:view-own',
        'file:delete-own',
        'file:download',

        // Discussion
        'discussion:create-on-own',
        'discussion:read-own',

        // Notifications
        'notification:view-own',
        'notification:mark-read',
        'notification:delete-own',

        // Profile
        'profile:view-own',
        'profile:update-own',
    ],

    [UserRole.STUDENT]: [
        // Projects & Internships
        'project:submit',
        'project:view-own',

        // File Management
        'file:upload',
        'file:view-own',

        // Notifications
        'notification:view-own',
        'notification:mark-read',
        'notification:delete-own',

        // Profile
        'profile:view-own',
        'profile:update-own',

        // Recruitment
        'recruitment:submit',
        'recruitment:view-own',
    ],

    [UserRole.USER]: [
        // Profile
        'profile:view-own',
        'profile:update-own',

        // Notifications
        'notification:view-own',
        'notification:mark-read',
        'notification:delete-own',

        // Recruitment
        'recruitment:submit',
        'recruitment:view-own',

        // Content (public)
        'content:view-contact',
        'content:view-about',
        'content:view-published-books',
    ],
};

// Helper Functions

/**
 * Get all permissions grouped by category
 * Returns ONLY safe data for frontend (no permission logic)
 */
export function getPermissionsByCategory(): Record<string, PermissionDefinition[]> {
    const grouped: Record<string, PermissionDefinition[]> = {};

    Object.values(PERMISSIONS).forEach(permission => {
        if (!grouped[permission.category]) {
            grouped[permission.category] = [];
        }
        grouped[permission.category].push({
            id: permission.id,
            displayName: permission.displayName,
            description: permission.description,
            category: permission.category,
        });
    });

    return grouped;
}

/**
 * Get permissions for a specific role
 */
export function getPermissionsForRole(role: UserRole): string[] {
    return DEFAULT_ROLE_PERMISSIONS[role] || [];
}

/**
 * Validate if a permission exists
 */
export function isValidPermission(permissionId: string): boolean {
    return permissionId in PERMISSIONS;
}

/**
 * Get permission details (safe for frontend)
 */
export function getPermissionDetails(permissionId: string): PermissionDefinition | null {
    const permission = PERMISSIONS[permissionId];
    if (!permission) return null;

    return {
        id: permission.id,
        displayName: permission.displayName,
        description: permission.description,
        category: permission.category,
    };
}

/**
 * Get all permission IDs
 */
export function getAllPermissionIds(): string[] {
    return Object.keys(PERMISSIONS);
}

/**
 * Get category display name
 */
export function getCategoryDisplayName(category: string): string {
    return CATEGORY_DISPLAY_NAMES[category] || category;
}
