import { Injectable } from '@nestjs/common'
import { InjectDataSource } from '@nestjs/typeorm'
import { DataSource } from 'typeorm'

export interface AcademicLinkStatus {
  hasSchedule: boolean
  hasSubject: boolean
  hasUcProgram: boolean
}

@Injectable()
export class AcademicService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async hasActiveAcademicLink(employeeId: number): Promise<boolean> {
    const status = await this.getAcademicLinkStatus(employeeId)

    return status.hasSchedule && status.hasSubject && status.hasUcProgram
  }

  async getAcademicLinkStatus(employeeId: number): Promise<AcademicLinkStatus> {
    const emptyStatus: AcademicLinkStatus = {
      hasSchedule: false,
      hasSubject: false,
      hasUcProgram: false,
    }

    const bi = await this.getEmployeeBi(employeeId)

    if (!bi) {
      return emptyStatus
    }

    const result = await this.dataSource.query(
      `WITH docente AS (
           SELECT td.CODIGO AS pk_docente
             FROM FK2_TB_PESSOA pe
             JOIN FK2_MCA_TB_UTILIZADOR tu
               ON JSON_VALUE(tu.REF_PESSOA, '$.pk') = pe.PK_PESSOA
             JOIN FK2_MGD_TB_DOCENTE td
               ON JSON_VALUE(td.CODIGO_UTILIZADOR, '$.pk') = tu.PK_UTILIZADOR
            WHERE pe.NUM_DOC_IDENTIFICACAO = :1
       ),
       ano_ativo AS (
           SELECT CODIGO FROM FK2_TB_ANO_LECTIVO WHERE ESTADO = 'Activo'
       )
       SELECT
           CASE WHEN EXISTS (
               SELECT 1
                 FROM FK2_MGH_TB_AULA A
                 JOIN FK2_MGH_TB_HORARIO H ON A.FK_HORARIO = H.PK_HORARIO
                 JOIN ano_ativo AL          ON H.FK_ANO_LECTIVO = AL.CODIGO
                WHERE A.ACTIVE_STATE <> 0
                  AND JSON_VALUE(A.REF_DOCENTE, '$.pkDocente' RETURNING NUMBER) = d.pk_docente
           ) THEN 'S' ELSE 'N' END AS "hasSchedule",

           CASE WHEN EXISTS (
               SELECT 1
                 FROM FK2_MGD_TB_DOCENTE_AFECTACAO AF
                 JOIN ano_ativo AL ON AF.FK_ANO_LECTIVO = AL.CODIGO
                WHERE AF.FK_DOCENTE = d.pk_docente
                  AND AF.ACTIVE_STATE = 1
           ) THEN 'S' ELSE 'N' END AS "hasSubject",

           CASE WHEN EXISTS (
               SELECT 1
                 FROM FK2_MGD_TB_PROGRAMA_UC PU
                 JOIN ano_ativo AL ON PU.FK_ANO_LECTIVO = AL.CODIGO
                WHERE PU.ACTIVE_STATE = 1
                  AND JSON_VALUE(PU.REF_DOCENTE, '$.pk' RETURNING NUMBER) = d.pk_docente
           ) THEN 'S' ELSE 'N' END AS "hasUcProgram"
       FROM docente d`,
      [bi],
    )

    const row = result[0]

    if (!row) {
      return emptyStatus
    }

    return {
      hasSchedule: row.hasSchedule === 'S',
      hasSubject: row.hasSubject === 'S',
      hasUcProgram: row.hasUcProgram === 'S',
    }
  }

  async getConfirmedPresenceHoursByDay(
    employeeId: number,
    startDate: Date,
    endDate: Date,
  ): Promise<Map<string, number>> {
    const bi = await this.getEmployeeBi(employeeId)

    if (!bi) {
      return new Map()
    }

    const rows = await this.dataSource.query(
      `SELECT
           TO_CHAR(TRUNC(aa.DATA_AULA), 'YYYY-MM-DD') AS "dia",
           ROUND(SUM(CASE
             WHEN est.PK_ESTADO_AGENDAMENTO = 3
             THEN (CAST(al.HORA_TERMINO AS DATE) - CAST(al.HORA_INICIO AS DATE)) * 24
             ELSE 0 END), 2)                           AS "horas"
         FROM FK2_MSA_TB_AGENDAMENTO_AULA aa
         INNER JOIN FK2_MGH_TB_AULA al
                 ON JSON_VALUE(aa.REF_AULA, '$.pkAula') = al.PK_AULA
         INNER JOIN FK2_MGD_TB_DOCENTE d2
                 ON JSON_VALUE(aa.REF_AULA, '$.pkDocente') = d2.CODIGO
         INNER JOIN FK2_MCA_TB_UTILIZADOR tu
                 ON JSON_VALUE(d2.CODIGO_UTILIZADOR, '$.pk') = tu.PK_UTILIZADOR
         INNER JOIN FK2_TB_PESSOA pe
                 ON JSON_VALUE(tu.REF_PESSOA, '$.pk') = pe.PK_PESSOA
         INNER JOIN FK2_MSA_TB_ESTADO_AGENDAMENTO est
                 ON aa.FK_ESTADO_AGENDAMENTO = est.PK_ESTADO_AGENDAMENTO
        WHERE aa.ACTIVE_STATE = 1
          AND aa.DATA_AULA BETWEEN TO_DATE(:1, 'YYYY-MM-DD') AND TO_DATE(:2, 'YYYY-MM-DD')
          AND pe.NUM_DOC_IDENTIFICACAO = :3
        GROUP BY TRUNC(aa.DATA_AULA)
        ORDER BY "dia"`,
      [this.formatDate(startDate), this.formatDate(endDate), bi],
    )

    return new Map(
      rows.map((row: { dia: string; horas: number }) => [
        row.dia,
        Number(row.horas ?? 0),
      ]),
    )
  }

  private async getEmployeeBi(employeeId: number): Promise<string | null> {
    const user = await this.dataSource.query(
      `SELECT U.BI AS "bi"
         FROM GP_COLABORADORES C
         JOIN GP_USUARIOS U ON C.CODIGO_USUARIO = U.CODIGO
        WHERE C.CODIGO = :1`,
      [employeeId],
    )

    return user[0]?.bi ?? null
  }

  private formatDate(date: Date): string {
    return new Date(date).toISOString().slice(0, 10)
  }
}
