const prompt = require('prompt-sync')();
const PacienteService = require('./services/PacienteService');
const AgendamentoService = require('./services/AgendamentoService');
const sequelize = require('./models/index').sequelize;
const { Paciente, Agendamento } = require('./models');
const { DateTime } = require('luxon');

const pacienteService = new PacienteService();
const agendamentoService = new AgendamentoService();

async function menuPrincipal() {
    console.log('-----------------------------------------');
    console.log('Bem-vindo à Clínica Odontológica!');
    console.log('1- Gerenciar Pacientes');
    console.log('2- Gerenciar Agendamentos');
    console.log('3- Sair');
    console.log('-----------------------------------------');

    const opcao = prompt('Escolha uma opção: ');

    switch (opcao) {
        case '1':
            await menuPacientes();
            break;
        case '2':
            await menuAgendamentos();
            break;
        case '3':
            console.log('Saindo...');
            process.exit();
        default:
            console.log('Opção inválida. Tente novamente.');
    }

    await menuPrincipal();
}

async function menuPacientes() {
    console.log('-----------------------------------------');
    console.log('1- Cadastrar Paciente');
    console.log('2- Listar Pacientes');
    console.log('3- Excluir Paciente');
    console.log('4- Voltar ao Menu Principal');
    console.log('-----------------------------------------');

    const opcao = prompt('Escolha uma opção: ');

    switch (opcao) {
        case '1':
            await cadastrarPaciente();
            break;
        case '2':
            await listarPacientes();
            break;
        case '3':
            await excluirPaciente();
            break;
        case '4':
            return;
        default:
            console.log('Opção inválida. Tente novamente.');
    }

    await menuPacientes();
}

async function menuAgendamentos() {
    console.log('-----------------------------------------');
    console.log('1- Agendar Consulta');
    console.log('2- Cancelar Agendamento');
    console.log('3- Listar Agendamentos');
    console.log('4- Voltar ao Menu Principal');
    console.log('-----------------------------------------');

    const opcao = prompt('Escolha uma opção: ');

    switch (opcao) {
        case '1':
            await agendarConsulta();
            break;
        case '2':
            await cancelarAgendamento();
            break;
        case '3':
            await listarAgendamentos();
            break;
        case '4':
            return;
        default:
            console.log('Opção inválida. Tente novamente.');
    }

    await menuAgendamentos();
}

async function cadastrarPaciente() {
    try {
        const cpf = prompt('CPF: ');
        const nome = prompt('Nome: ');
        const dataNascimento = prompt('Data de Nascimento (dd/MM/yyyy): ');

        const paciente = await pacienteService.cadastrarPaciente(cpf, nome, dataNascimento);
        console.log('Paciente cadastrado com sucesso:', paciente);
    } catch (error) {
        console.error('Erro ao cadastrar paciente:', error.message);
    }
}

async function listarPacientes() {
    try {
        const criterio = prompt('Ordenar por (nome/cpf): ') || 'nome';
        const pacientes = await pacienteService.listarPacientesComAgendamentos(criterio);

        console.log('-----------------------------------------');
        console.log('Lista de Pacientes:');
        pacientes.forEach(paciente => {
            console.log(`- CPF: ${paciente.cpf}, Nome: ${paciente.nome}, Data de Nascimento: ${paciente.dataNascimento}`);
            if (paciente.agendamentos && paciente.agendamentos.length > 0) {
                console.log('  Agendamentos:');
                paciente.agendamentos.forEach(agendamento => {
                    console.log(`    - Data: ${agendamento.dataConsulta}, Horário: ${agendamento.horaInicial} às ${agendamento.horaFinal}`);
                });
            } else {
                console.log('  Sem agendamentos.');
            }
        });
        console.log('-----------------------------------------');
    } catch (error) {
        console.error('Erro ao listar pacientes:', error.message);
    }
}

async function excluirPaciente() {
    try {
        const cpf = prompt('CPF do Paciente a excluir: ');
        const paciente = await Paciente.findOne({ where: { cpf } });

        if (!paciente) {
            console.log('Paciente não encontrado.');
            return;
        }

        const resultado = await pacienteService.excluirPaciente(paciente.id);
        console.log(resultado.mensagem);
    } catch (error) {
        console.error('Erro ao excluir paciente:', error.message);
    }
}

async function agendarConsulta() {
    try {
        const cpf = prompt('CPF do Paciente: ');
        const dataConsulta = prompt('Data da Consulta (DD/MM/yyyy): ');
        const horaInicial = prompt('Hora Inicial (HH:mm): ');
        const horaFinal = prompt('Hora Final (HH:mm): ');

        const dataISO = dataConsulta.split('/').reverse().join('-');

        const paciente = await Paciente.findOne({ where: { cpf } });
        if (!paciente) {
            console.log('Erro: Paciente não encontrado.');
            return;
        }

        const novoAgendamento = await agendamentoService.criarAgendamento(
            paciente.id,
            dataISO,
            horaInicial,
            horaFinal
        );
        console.log('Agendamento realizado com sucesso:', novoAgendamento);
    } catch (error) {
        console.log('Erro ao agendar consulta:', error.message);
    }
}

async function cancelarAgendamento() {
    try {
        const cpf = prompt('CPF do Paciente: ');
        const dataConsulta = prompt('Data da Consulta (DD/MM/yyyy): ');
        const horaInicial = prompt('Hora Inicial (HH:mm): ');

        const dataISO = dataConsulta.split('/').reverse().join('-');
        const paciente = await Paciente.findOne({ where: { cpf } });

        if (!paciente) {
            console.log('Erro: Paciente não encontrado.');
            return;
        }

        const agendamento = await Agendamento.findOne({
            where: {
                pacienteId: paciente.id,
                dataConsulta: dataISO,
                horaInicial,
            },
        });

        if (!agendamento) {
            console.log('Erro: Agendamento não encontrado.');
            return;
        }

        const agora = DateTime.now();
        const dataHoraAgendamento = DateTime.fromISO(`${dataISO}T${horaInicial}`);
        if (dataHoraAgendamento <= agora) {
            console.log('Erro: Somente agendamentos futuros podem ser cancelados.');
            return;
        }

        await agendamento.destroy();
        console.log('Agendamento cancelado com sucesso!');
    } catch (error) {
        console.error('Erro ao cancelar agendamento:', error.message);
    }
}

async function listarAgendamentos() {
    try {
        const cpf = prompt('Filtrar por CPF do Paciente (opcional): ') || null;
        const dataInicial = prompt('Data Inicial (DD/MM/yyyy, opcional): ');
        const dataFinal = prompt('Data Final (DD/MM/yyyy, opcional): ');

        const dataInicialISO = dataInicial ? dataInicial.split('/').reverse().join('-') : null;
        const dataFinalISO = dataFinal ? dataFinal.split('/').reverse().join('-') : null;

        let pacienteId = null;
        if (cpf) {
            const paciente = await Paciente.findOne({ where: { cpf } });
            if (!paciente) {
                console.log('Erro: Paciente não encontrado.');
                return;
            }
            pacienteId = paciente.id;
        }

        const agendamentos = await agendamentoService.listarAgendamentos(
            pacienteId || null,
            dataInicialISO || null,
            dataFinalISO || null
        );

        console.log('-----------------------------------------');
        console.log('Lista de Agendamentos:');
        agendamentos.forEach(agendamento => {
            console.log(`- Data: ${agendamento.dataConsulta}, Horário: ${agendamento.horaInicial} às ${agendamento.horaFinal}, Paciente: ${agendamento.paciente.nome}`);
        });
        console.log('-----------------------------------------');
    } catch (error) {
        console.error('Erro ao listar agendamentos:', error.message);
    }
}

(async () => {
    try {
        await sequelize.authenticate();
        console.log('Conexão com o banco de dados estabelecida com sucesso!');
        await menuPrincipal();
    } catch (error) {
        console.error('Erro ao iniciar o aplicativo:', error.message);
    }
})();
