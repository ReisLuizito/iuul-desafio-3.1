const { Model, DataTypes } = require('sequelize');

class Agendamento extends Model {
    static init(sequelize) {
        super.init(
            {
                dataConsulta: {
                    type: DataTypes.DATEONLY,
                    allowNull: false,
                },
                horaInicial: {
                    type: DataTypes.TIME,
                    allowNull: false,
                },
                horaFinal: {
                    type: DataTypes.TIME,
                    allowNull: false,
                },
            },
            {
                sequelize,
                modelName: 'Agendamento',
                tableName: 'agendamentos',
                timestamps: true,
            }
        );
        return this;
    }

    static associate(models) {
        this.belongsTo(models.Paciente, { foreignKey: 'pacienteId', as: 'paciente' });
    }
}

module.exports = Agendamento;
