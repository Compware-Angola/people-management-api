import { Requisition } from '../entity/requisition.entity'
import {
  RequisitionHistoryResponseDto,
  RequisitionResponseDto,
} from '../dto/requisition-response.dto'

function mapHistory(
  history: Requisition['history'],
): RequisitionHistoryResponseDto[] {
  if (!history) {
    return []
  }
  return history.map((entry) => ({
    code: entry.code,
    action: entry.action,
    decision: entry.decision,
    opinion: entry.opinion,
    budgetAvailability: entry.budgetAvailability,
    authorizedQuantity: entry.authorizedQuantity,
    budgetExercise: entry.budgetExercise,
    observation: entry.observation,
    date: entry.date,
    state: {
      acronym: entry.state?.acronym,
      description: entry.state?.description,
    },
    responsible: {
      id: entry.responsible?.id,
      name: entry.responsible?.name,
    },
  }))
}

export function toRequisitionResponseDto(
  requisition: Requisition,
): RequisitionResponseDto {
  return {
    code: requisition.code,
    requisitionCode: requisition.requisitionCode,
    department: {
      code: requisition.department?.code,
      description: requisition.department?.description,
    },
    costCenter: {
      code: requisition.costCenter?.code,
      description: requisition.costCenter?.description,
    },
    position: {
      code: requisition.position?.code,
      description: requisition.position?.description,
    },
    quantity: requisition.quantity,
    justification: requisition.justification,
    hiringType: {
      code: requisition.hiringType?.code,
      acronym: requisition.hiringType?.acronym,
      description: requisition.hiringType?.description,
    },
    requester: {
      id: requisition.requester?.id,
      name: requisition.requester?.name,
    },
    state: {
      code: requisition.state?.code,
      acronym: requisition.state?.acronym,
      description: requisition.state?.description,
    },
    authorizedQuantity: requisition.authorizedQuantity,
    sentAt: requisition.sentAt,
    createdAt: requisition.createdAt,
    updatedAt: requisition.updatedAt,
    history: mapHistory(requisition.history),
  }
}

export function toRequisitionResponseDtoList(
  requisitions: Requisition[],
): RequisitionResponseDto[] {
  return requisitions.map(toRequisitionResponseDto)
}
