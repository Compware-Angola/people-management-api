export const REQUISITION_HISTORY_ACTION = {
  CREATE: 'CRIACAO',
  SEND: 'ENVIO',
  CANCEL: 'CANCELAMENTO',
  RH_ANALYSIS: 'ANALISE_RH',
  FINANCIAL_ANALYSIS: 'ANALISE_FINANCEIRA',
} as const

export const REQUISITION_RELATIONS = {
  department: true,
  costCenter: true,
  position: true,
  hiringType: true,
  vacancyRequestType: true,
  requester: true,
  state: true,
} as const

export enum RhDecision {
  APPROVE = 'APROVAR',
  REJECT = 'REJEITAR',
}
export const MAX_CODE_GENERATION_ATTEMPTS = 5
