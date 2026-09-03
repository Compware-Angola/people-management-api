/** Garante que a nota fique entre 0 e 100. */
export function clampScore(value: number): number {
  if (!Number.isFinite(value) || value <= 0) {
    return 0
  }

  return value >= 100 ? 100 : value
}

/**
 * Normaliza uma quantidade/contagem em relação a um alvo:
 * `value >= target` vale 100; abaixo disso é proporcional.
 */
export function ratioScore(value: number, target: number): number {
  if (target <= 0) {
    return 0
  }

  return clampScore((value / target) * 100)
}

/** Arredonda para 2 casas decimais (evita ruído de ponto flutuante). */
export function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100
}
