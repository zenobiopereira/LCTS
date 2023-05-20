import type { AF, NormalizeExtendedObj } from './utils'

declare const _name: unique symbol;
declare const INVALID_ENV: unique symbol;


export type Def<Name extends string, FN extends AF | string> = {
  readonly [_name]: Name,
  def: FN
}

type UnwrapDef<Df extends unknown> = Df extends Def<string, AF | string>
  ? { [K in Uppercase<Df[typeof _name]>]: Lambda<Df['def']> }
  : {};

type UniqueDef<Env extends unknown, Df extends unknown> = keyof Exclude<UnwrapDef<Df>, AF> extends keyof Env
  ? typeof INVALID_ENV
  : Env & UnwrapDef<Df>;

/** Usage:
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
