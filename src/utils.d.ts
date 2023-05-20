export type AF = (_: any) => any;

export type NormalizeExtendedObj<Obj extends Record<any, any>> = { [K in keyof Obj]: Obj[K] };

export type PickUnknown<Obj extends Record<any, any>> =
  Omit<Obj, { [K in keyof Obj]: unknown extends Obj[K] ? never : K }[keyof Obj]>;

export type Head<L extends unknown[]> = L extends [infer H, ...infer _] ? H : unknown;

export type Tail<L extends unknown[]> = L extends [infer _, ...infer T extends unknown[]] ? T : [];

export type SymbolOrFN<T = unknown> = T extends string
  ? T
  : T extends (_: infer A) => infer R
  ? A extends string
  ? (_: A) => SymbolOrFN<R>
  : never
  : never;

/** Usage:
*  type A = UnwrapArgs<'f(x)'>
*       ^? ['f', 'x']
*  type B = UnwrapArgs<'f(g(x))'>
*       ^? ['f', 'g', 'x']
*  type C = UnwrapArgs<'f(g(x)'>
*       ^? ['f', 'g', 'x']
*  type D = UnwrapArgs<''>
*       ^? []
*/
export type UnwrapArgs<S extends string, Acc extends string[] = []> = S extends `${infer H}${"("}${infer T}${")"}`
  ? H extends ""
  ? UnwrapArgs<T, Acc>
  : UnwrapArgs<T, [...Acc, H]>
  : [...Acc, S];

export type ExpBody<Exp extends AF | string> = Exp extends string
  ? Exp
  : Exp extends (_: any) => infer R
  ? R extends AF
  ? ExpBody<R>
  : R : never;


export type SplitBody<S extends string, Acc extends string[] = []> =
  S extends `${infer H}${" "}${infer T}`
  ? H extends ""
  ? Acc
  : SplitBody<T, [...Acc, ...UnwrapArgs<H>]>
  : [...Acc, ...UnwrapArgs<S>];
