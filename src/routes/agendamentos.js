const express = require('express');
const asyncHandler = require('express-async-handler');
const AgendamentoService = require('../services/AgendamentoService');

const router = express.Router();
const agendamentoService = new AgendamentoService();

router.post(
    '/',
    asyncHandler(async (req, res) => {
        const { pacienteId, dataConsulta, horaInicial, horaFinal } = req.body;
        const agendamento = await agendamentoService.criarAgendamento(
            pacienteId,
            dataConsulta,
            horaInicial,
            horaFinal
        );
        res.status(201).json(agendamento);
    })
);

router.delete(
    '/:id',
    asyncHandler(async (req, res) => {
        const { id } = req.params;
        const resultado = await agendamentoService.cancelarAgendamento(id);
        res.status(200).json(resultado);
    })
);

router.get(
    '/',
    asyncHandler(async (req, res) => {
        const { pacienteId, dataInicial, dataFinal } = req.query;
        const agendamentos = await agendamentoService.listarAgendamentos(
            pacienteId,
            dataInicial,
            dataFinal
        );
        res.status(200).json(agendamentos);
    })
);

module.exports = router;
