import { Relations } from "drizzle-orm"

export type ExtractDrizzleRelations<F> = F extends (config: infer C) => any
  ? C extends { with?: any }
  ? Pick<C, "with">
  : {}
  : {}