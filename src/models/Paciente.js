const { Model, DataTypes } = require('sequelize');
const { DateTime } = require('luxon');

class Paciente extends Model {
    static init(sequelize) {
        super.init(
            {
                cpf: {
                    type: DataTypes.STRING(11),
                    allowNull: false,
                    unique: true,
                    validate: {
                        is: /^[0-9]{11}$/,
                    },
                },
                nome: {
                    type: DataTypes.STRING(100),
                    allowNull: false,
                    validate: {
                        len: [5, 100],
                    },
                },
                dataNascimento: {
                    type: DataTypes.DATEONLY,
                    allowNull: false,
                    validate: {
                        isDate: true,
                    },
                },
            },
            {
                sequelize,
                modelName: 'Paciente',
                tableName: 'pacientes',
                timestamps: true,
            }
        );

        return this;
    }

    get idade() {
        if (!this.dataNascimento) return null;
        const hoje = DateTime.now();
        const nascimento = DateTime.fromISO(this.dataNascimento);
        return Math.floor(hoje.diff(nascimento, 'years').years);
    }

    static associate(models) {
        this.hasMany(models.Agendamento, { foreignKey: 'pacienteId', as: 'agendamentos' });
    }
}

module.exports = Paciente;