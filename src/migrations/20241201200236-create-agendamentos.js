'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('agendamentos', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      dataConsulta: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      horaInicial: {
        type: Sequelize.TIME,
        allowNull: false,
        validate: {
          is: /^([01]\d|2[0-3]):([0-5]\d)$/,
        },
      },
      horaFinal: {
        type: Sequelize.TIME,
        allowNull: false,
        validate: {
          is: /^([01]\d|2[0-3]):([0-5]\d)$/,
        },
      },
      pacienteId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'pacientes',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      status: {
        type: Sequelize.STRING(20),
        allowNull: true,
        defaultValue: 'pendente',
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('agendamentos');
  },
};
