const { Sequelize } = require('sequelize');
const dbConfig = require('../config/database');
const Paciente = require('./Paciente');
const Agendamento = require('./Agendamento');

const sequelize = new Sequelize(dbConfig);

const models = {
    Paciente: Paciente.init(sequelize),
    Agendamento: Agendamento.init(sequelize),
};

Object.values(models)
    .filter(model => typeof model.associate === 'function')
    .forEach(model => model.associate(models));

module.exports = {
    sequelize,
    ...models,
};
