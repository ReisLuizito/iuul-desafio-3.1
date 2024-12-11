const { Op } = require('sequelize');
const Agendamento = require('../models/Agendamento');
const Paciente = require('../models/Paciente');

class AgendamentoService {
    async criarAgendamento(pacienteId, dataConsulta, horaInicial, horaFinal) {
        const paciente = await Paciente.findByPk(pacienteId);

        if (!paciente) {
            throw new Error('Paciente não encontrado.');
        }

        const conflito = await Agendamento.findOne({
            where: {
                dataConsulta,
                [Op.or]: [
                    {
                        [Op.and]: [
                            { horaInicial: { [Op.lte]: horaFinal } },
                            { horaFinal: { [Op.gte]: horaInicial } },
                        ],
                    },
                ],
            },
        });

        if (conflito) {
            throw new Error('Já existe um agendamento nesse horário.');
        }

        const novoAgendamento = await Agendamento.create({
            pacienteId,
            dataConsulta,
            horaInicial,
            horaFinal,
        });

        return novoAgendamento;
    }

    async cancelarAgendamento(agendamentoId) {
        const agendamento = await Agendamento.findByPk(agendamentoId);

        if (!agendamento) {
            throw new Error('Agendamento não encontrado.');
        }

        const agora = new Date();
        if (new Date(agendamento.dataConsulta) < agora || 
            (agendamento.dataConsulta === agora.toISOString().split('T')[0] && agendamento.horaInicial <= agora.toTimeString().slice(0, 5))) {
            throw new Error('Somente agendamentos futuros podem ser cancelados.');
        }

        await agendamento.destroy();
        return { mensagem: 'Agendamento cancelado com sucesso.' };
    }

    async listarAgendamentos(pacienteId = null, dataInicial = null, dataFinal = null) {
        const query = {
            where: {},
            include: {
                model: Paciente,
                as: 'paciente',
                attributes: ['nome', 'cpf'],
            },
        };

        if (pacienteId) {
            query.where.pacienteId = pacienteId;
        }

        if (dataInicial && dataFinal) {
            query.where.dataConsulta = {
                [Op.between]: [dataInicial, dataFinal],
            };
        }

        const agendamentos = await Agendamento.findAll(query);

        return agendamentos;
    }
}

module.exports = AgendamentoService;
