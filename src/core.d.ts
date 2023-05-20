import type { SymbolOrFN } from "./utils"

declare const lambda: unique symbol;

export type Lambda<E extends string | AF> = E extends string
  ? { readonly [lambda]: 'λ', exp: E }
  : SymbolOrFN<E> extends AF
  ? { readonly [lambda]: 'λ', exp: SymbolOrFN<E> }
  : never
