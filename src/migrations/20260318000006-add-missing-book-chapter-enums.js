'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const fullEnumValues = [
        'INITIAL_SUBMITTED',           
        'ASSIGNED_TO_EDITOR',          
        'EDITOR_REVIEWING',            
        'EDITOR_ACCEPTED',             
        'EDITOR_REJECTED',             
        'FULL_CHAPTER_PENDING',        
        'FULL_CHAPTER_SUBMITTED',      
        'REVIEWERS_ASSIGNED',          
        'REVIEWER_PENDING_ACCEPTANCE', 
        'UNDER_REVIEW',                
        'REVISION_REQUESTED',          
        'REVISION_SUBMITTED',          
        'REVIEW_COMPLETED',            
        'EDITOR_FINAL_REVIEW',         
        'APPROVED',                    
        'REJECTED',                    
        'PUBLISHED',
        'ABSTRACT_SUBMITTED',
        'MANUSCRIPTS_PENDING',
        'REVIEWER_ASSIGNMENT',
        'EDITORIAL_REVIEW',
        'ISBN_APPLIED',
        'PUBLICATION_IN_PROGRESS'
    ];

    try {
        await queryInterface.changeColumn('book_chapter_submissions', 'status', {
            type: Sequelize.ENUM(...fullEnumValues),
            allowNull: false,
            defaultValue: 'ABSTRACT_SUBMITTED' // the default in the model
        });
    } catch (error) {
        console.log('⚠️ book_chapter_submissions status ENUM update skipped:', error.message);
    }
  },

  down: async (queryInterface, Sequelize) => {
    console.log('MySQL ENUM removals are not done here safely without data loss. Leaving added values.');
  }
};
