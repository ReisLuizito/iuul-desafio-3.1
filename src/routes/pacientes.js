const express = require('express');
const asyncHandler = require('express-async-handler');
const PacienteService = require('../services/PacienteService');

const router = express.Router();
const pacienteService = new PacienteService();

router.post(
    '/',
    asyncHandler(async (req, res) => {
        const { cpf, nome, dataNascimento } = req.body;
        const novoPaciente = await pacienteService.cadastrarPaciente(cpf, nome, dataNascimento);
        res.status(201).json(novoPaciente);
    })
);

router.get(
    '/',
    asyncHandler(async (req, res) => {
        const { criterio } = req.query;
        const pacientes = await pacienteService.listarPacientesComAgendamentos(criterio || 'nome');
        res.status(200).json(pacientes);
    })
);

router.delete(
    '/:id',
    asyncHandler(async (req, res) => {
        const { id } = req.params;
        const resultado = await pacienteService.excluirPaciente(id);
        res.status(200).json(resultado);
    })
);

module.exports = router;
