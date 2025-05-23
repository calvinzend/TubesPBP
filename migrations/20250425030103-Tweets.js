'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tweets', {
      tweet_id: {
        type: Sequelize.UUID,
        autoIncrement: false,
        primaryKey: true
      },
      user_id: {
        type: Sequelize.UUID,
        references: {
          model: 'users',
          key: 'user_id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        allowNull: false
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      image_path: {
        type: Sequelize.STRING,
        allowNull: true
      },
      reply_id: {
        type: Sequelize.UUID,
        references: {
          model: 'tweets',
          key: 'tweet_id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        allowNull: true
      },
      root_id: {
        type: Sequelize.UUID,
        references: {
          model: 'tweets',
          key: 'tweet_id'
        },

        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('tweets');
    await queryInterface.dropTable('likes');
  }
};
