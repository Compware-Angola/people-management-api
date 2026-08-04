import { ApiProperty } from '@nestjs/swagger'

export class PaginationMetaDto {
  @ApiProperty({ description: 'Página atual', example: 1 })
  page: number

  @ApiProperty({ description: 'Quantidade de itens por página', example: 10 })
  limit: number

  @ApiProperty({ description: 'Total de itens encontrados', example: 100 })
  total: number

  @ApiProperty({ description: 'Total de páginas', example: 10 })
  totalPages: number

  constructor(page: number, limit: number, total: number) {
    this.page = page
    this.limit = limit
    this.total = total
    this.totalPages = limit > 0 ? Math.ceil(total / limit) : 0
  }
}

export class PaginatedResponseDto<T> {
  @ApiProperty({ isArray: true })
  data: T[]

  @ApiProperty({ type: PaginationMetaDto })
  meta: PaginationMetaDto

  constructor(data: T[], page: number, limit: number, total: number) {
    this.data = data
    this.meta = new PaginationMetaDto(page, limit, total)
  }

  static create<T>(
    data: T[],
    total: number,
    page: number,
    limit: number,
  ): PaginatedResponseDto<T> {
    return new PaginatedResponseDto<T>(data, page, limit, total)
  }
}
