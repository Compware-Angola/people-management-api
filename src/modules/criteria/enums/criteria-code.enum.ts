/**
 * Chave estável de máquina de um critério de triagem (coluna GP_CRITERIOS.SIGLA).
 *
 * Vocabulário controlado: cada valor corresponde a exatamente um ramo da função
 * de pontuação (uma ScoringStrategy). O texto exibido fica em GP_CRITERIOS.DESCRICAO
 * e pode ser renomeado pelo usuário sem afetar o cálculo.
 *
 * Regras: UPPER_SNAKE_CASE, sem acento, sem espaço, imutável depois de criado.
 */
export enum CriteriaCode {
  GRAU_ACADEMICO = 'GRAU_ACADEMICO',
  FORMACAO_ACADEMICA = 'FORMACAO_ACADEMICA',
  OUTRAS_FORMACOES = 'OUTRAS_FORMACOES',
  EXP_DOCENTE = 'EXP_DOCENTE',
  EXP_PROFISSIONAL = 'EXP_PROFISSIONAL',
}
