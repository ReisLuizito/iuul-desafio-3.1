const Paciente = require('../models/Paciente');
const Agendamento = require('../models/Agendamento');
const Validacao = require('../utils/Validacao');

class PacienteService {
    async cadastrarPaciente(cpf, nome, dataNascimento) {
        if (!Validacao.validarCPF(cpf)) {
            throw new Error('CPF inválido.');
        }
    
        if (!Validacao.validarNome(nome)) {
            throw new Error('O nome deve ter pelo menos 5 caracteres.');
        }
    
        const dataNascimentoValida = Validacao.validarDataNascimento(dataNascimento);
    
        if (!Validacao.validarIdade(dataNascimentoValida)) {
            throw new Error('Paciente deve ter pelo menos 13 anos.');
        }
    
        const jaExiste = await Paciente.findOne({ where: { cpf } });
        if (jaExiste) {
            throw new Error('CPF já cadastrado.');
        }
    
        const novoPaciente = await Paciente.create({
            cpf,
            nome,
            dataNascimento: dataNascimentoValida.toISODate(),
        });
        return novoPaciente;
    }

    async listarPacientesComAgendamentos(criterio = 'nome') {
        const ordenacao = criterio === 'cpf' ? [['cpf', 'ASC']] : [['nome', 'ASC']];

        const pacientes = await Paciente.findAll({
            include: {
                model: Agendamento,
                as: 'agendamentos',
                required: false,
            },
            order: ordenacao,
        });

        return pacientes;
    }

    async excluirPaciente(pacienteId) {
        const paciente = await Paciente.findByPk(pacienteId, {
            include: { model: Agendamento, as: 'agendamentos' },
        });

        if (!paciente) {
            throw new Error('Paciente não encontrado.');
        }

        if (paciente.agendamentos.some(agendamento => new Date(agendamento.dataConsulta) >= new Date())) {
            throw new Error('Não é possível excluir um paciente com agendamentos futuros.');
        }

        await Paciente.destroy({ where: { id: pacienteId } });
        return { mensagem: 'Paciente excluído com sucesso.' };
    }
}

module.exports = PacienteService;
