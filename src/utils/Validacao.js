const { DateTime } = require('luxon');

class Validacao {
    /**
     *
     * @param {string} cpf
     * @returns {boolean}
     */
    static validarCPF(cpf) {
        if (!/^\d{11}$/.test(cpf)) return false;

        if (/^(\d)\1{10}$/.test(cpf)) return false;

        const calcDigito = (cpf, pesoInicial) => {
            let soma = 0;
            for (let i = 0; i < pesoInicial - 1; i++) {
                soma += cpf[i] * (pesoInicial - i);
            }
            const resto = soma % 11;
            return resto < 2 ? 0 : 11 - resto;
        };

        const cpfNumeros = cpf.split('').map(Number);

        const primeiroDigito = calcDigito(cpfNumeros, 10);
        const segundoDigito = calcDigito(cpfNumeros, 11);

        return (
            primeiroDigito === cpfNumeros[9] &&
            segundoDigito === cpfNumeros[10]
        );
    }

    /**
     *
     * @param {string} nome
     * @returns {boolean}
     */
    static validarNome(nome) {
        return nome.trim().length >= 5;
    }

    /**
     *
     * @param {string} dataStr
     * @returns {DateTime|false}
     */
    static validarDataNascimento(dataStr) {
        const data = DateTime.fromFormat(dataStr, 'dd/MM/yyyy');
        if (!data.isValid) {
            throw new Error('Data de nascimento inválida.');
        }
        return data;
    }
    

    /**
     *
     * @param {DateTime} dataNascimento
     * @param {number} idadeMinima
     * @returns {boolean}
     */
    static validarIdade(dataNascimento, idadeMinima = 13) {
        const hoje = DateTime.now();
        const idade = Math.floor(hoje.diff(dataNascimento, 'years').years);
        return idade >= idadeMinima;
    }
    
}

module.exports = Validacao;
