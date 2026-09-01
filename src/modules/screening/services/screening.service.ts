import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm'
import { DataSource, Repository } from 'typeorm'

import { Vacancy } from 'src/modules/vacancies/entity/vacancy.entity'

import { ScoringRegistry } from '../scoring/scoring.registry'
import { round2 } from '../scoring/scoring.util'
import {
  CandidateScreeningDto,
  CriterionScoreDto,
  VacancyScreeningResultDto,
} from '../dto/screening-result.dto'

type VacancyCriterionRow = {
  sigla: string | null
  description: string
  weight: number
}

type CandidateRow = {
  id: number
  userId: number | null
  candidaturaId: number | null
}

@Injectable()
export class ScreeningService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,

    @InjectRepository(Vacancy)
    private readonly vacancyRepository: Repository<Vacancy>,

    private readonly scoringRegistry: ScoringRegistry,
  ) {}

  async screenByVacancyCode(
    vacancyCode: string,
  ): Promise<VacancyScreeningResultDto> {
    const vacancy = await this.vacancyRepository.findOne({
      where: { vacancyCode },
    })

    if (!vacancy) {
      throw new NotFoundException(
        `Vaga com o código ${vacancyCode} não encontrada`,
      )
    }

    const criteria = await this.loadVacancyCriteria(vacancy.code)

    if (!criteria.length) {
      throw new BadRequestException(
        'Nenhum critério de triagem configurado para esta vaga',
      )
    }

    const totalWeight = round2(
      criteria.reduce((sum, item) => sum + Number(item.weight), 0),
    )

    if (totalWeight !== 100) {
      throw new BadRequestException(
        `A soma dos pesos dos critérios da vaga deve ser 100 (atual: ${totalWeight})`,
      )
    }

    const candidates = await this.loadCandidates(vacancy.code)

    const scored = await Promise.all(
      candidates.map((candidate) => this.scoreCandidate(candidate, criteria)),
    )

    scored.sort((a, b) => b.finalScore - a.finalScore)

    return {
      vacancyId: vacancy.code,
      vacancyCode: vacancy.vacancyCode,
      totalWeight,
      candidates: scored,
    }
  }

  private async scoreCandidate(
    candidate: CandidateRow,
    criteria: VacancyCriterionRow[],
  ): Promise<CandidateScreeningDto> {
    const criterionScores: CriterionScoreDto[] = await Promise.all(
      criteria.map(async (criterion): Promise<CriterionScoreDto> => {
        const strategy = this.scoringRegistry.get(criterion.sigla)
        const score = strategy ? await strategy.score(candidate.id) : 0
        const weight = Number(criterion.weight)

        return {
          sigla: criterion.sigla ?? '',
          description: criterion.description,
          weight,
          score: round2(score),
          contribution: round2((score * weight) / 100),
          evaluated: strategy !== null,
        }
      }),
    )

    const finalScore = round2(
      criterionScores.reduce((sum, item) => sum + item.contribution, 0),
    )

    return {
      candidateId: candidate.id,
      userId: candidate.userId,
      candidaturaId: candidate.candidaturaId,
      finalScore,
      criteria: criterionScores,
    }
  }

  private loadVacancyCriteria(
    vacancyId: number,
  ): Promise<VacancyCriterionRow[]> {
    return this.dataSource.query<VacancyCriterionRow[]>(
      `
        SELECT c.SIGLA     AS "sigla",
               c.DESCRICAO AS "description",
               cv.PESO     AS "weight"
        FROM GP_CRITERIOS_VAGAS cv
        JOIN GP_CRITERIOS c ON c.CODIGO = cv.CRITERIO_ID
        WHERE cv.VAGA_ID = :1
          AND c.DELETADO_EM IS NULL
        ORDER BY cv.PESO DESC
      `,
      [vacancyId],
    )
  }

  private loadCandidates(vacancyId: number): Promise<CandidateRow[]> {
    return this.dataSource.query<CandidateRow[]>(
      `
        SELECT CODIGO         AS "id",
               CODIGO_USUARIO AS "userId",
               CANDIDATURA_ID AS "candidaturaId"
        FROM GP_CANDIDATOS
        WHERE CODIGO_VAGA = :1
      `,
      [vacancyId],
    )
  }
}
