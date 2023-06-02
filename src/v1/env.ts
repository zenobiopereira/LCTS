import type { AF, NormalizeExtendedObj, Lambda } from './blocks'

declare const _name: unique symbol;
declare const INVALID_ENV: unique symbol;

/**
  * type A = Def<"id", (_: 'x') => 'x'>
  *      ^? { def: (_: 'x') => 'x'; readonly [_name]: "ID"; }
  * */
export type Def<Name extends string, FN extends AF> = {
  readonly [_name]: Name,
  def: FN
}

type UnwrapDef<Df extends unknown> = Df extends Def<string, AF>
  ? { [K in Uppercase<Df[typeof _name]>]: Lambda<Df['def']> }
  : {};

/** Validate that Env has only unique entries. */
type UniqueDef<Env extends unknown, Df extends unknown> = keyof Exclude<UnwrapDef<Df>, AF> extends keyof Env
  ? typeof INVALID_ENV
  : Env & UnwrapDef<Df>;

/**
 *  type Env = DefEnv<[ Def<"ID", (_: 'x') => 'x'> ]>
 *        ^? { ID: Lambda<(_: 'x') => 'x'> }
 *
 *  type Env = DefEnv<[
 *        ^? INVALID_ENV
 *     Def<"ID", (_: 'x') => 'x'>,
 *     Def<"ID", (_: 'a') => 'a'>
 *   ]>
*/
export type DefEnv<T extends Array<unknown>, BaseEnv = {}> = BaseEnv extends Record<any, unknown>
  ? T extends []
  ? NormalizeExtendedObj<BaseEnv>
  : T extends [infer Df, ...infer Rdf]
  ? DefEnv<Rdf, UniqueDef<BaseEnv, Df>>
  : never
  : BaseEnv;
