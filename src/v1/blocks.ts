declare const INVALID_EXPRESSION: unique symbol;
declare const _kind: unique symbol;

export type ASTStructure = {
  vars: Array<[string, Term]>;
  body: Term[];
  args: unknown[];
};
export type Irreducible<T> = { readonly [_kind]: "Irreducible"; terms: T };
export type Term = Sym<string> | Lambda<AF> | ASTStructure | unknown;

/**
 *
 * It's a Arrow Function from never to AF or String.
 *
 * String like "x", "y", "test" and so on are not considered string type unless you ask TS to infer them.
 */
export type AF = (_: never) => AF | string;

/**
 *
 * Define a Lambda function which sould be a curried function where the argument is a string.
 */
export type Lambda<E extends AF> = {
  readonly [_kind]: "λ";
  readonly exp: CurriedFN<E> extends AF ? CurriedFN<E> : E;
};

/**
 *
 * Define a Symbol.
 */
export type Sym<N extends string> = {
  readonly [_kind]: "symbol";
  readonly name: N;
};

export type NormalizeExtendedObj<Obj extends Record<string, unknown>> = {
  [K in keyof Obj]: Obj[K];
};

/**
 *
 * Flatten any given list or return the given type within a list.
 *
 * type A = Flat<[1,2,3]>
 *      ^? [1,2,3]
 * type B = Flat<[[1],2,[[3]]]>
 *      ^? [1,2,3]
 * type C = Flat<[1,[[[[[2]]]]],[[3]]]>
 *      ^? [1,2,3]
 * type D = Flat<"test">
 *      ^? ["test"]
 * */
export type Flat<T extends unknown, Acc extends unknown[] = []> = T extends []
  ? Acc
  : T extends [infer H, ...infer Rest]
  ? Flat<Rest, Flat<H, Acc>>
  : [...Acc, T];

/**
 *
 * type A = CurriedFN<(_: "x") => "a b c">
 *      ^? (_: "x") => "a b c"
 *
 * type B = CurriedFN<(_: "x") => Sym<"a">>
 *      ^? (_: "x") => Sym<"a">
 *
 * type C = CurriedFN<Sym<"ID">>
 *      ^? { readonly name: "ID"; readonly [_kind]: 'symbol'; }
 *
 * */
export type CurriedFN<T = unknown> = T extends string | Sym<string>
  ? T
  : T extends (_: infer A extends string) => infer R
  ? (_: A) => CurriedFN<R>
  : typeof INVALID_EXPRESSION;

/**
 * type A = PickUnknowns<[["A", unknown], ["B", Sym<"a">]]>
 *      ^? [["A", unknown]]
 *
 * type B = PickUnknowns<[["B", Sym<"a">]]>
 *      ^? []
 *
 * type C = PickUnknowns<[]>
 *      ^? []
 * */
export type PickUnknowns<
  List extends ASTStructure["body"],
  Acc extends [string, unknown][] = []
> = List extends []
  ? Acc
  : Head<List> extends [infer Fst extends string, infer Snd]
  ? unknown extends Snd
    ? PickUnknowns<Tail<List>, [...Acc, [Fst, Snd]]>
    : PickUnknowns<Tail<List>, Acc>
  : PickUnknowns<Tail<List>, Acc>;

/**
 * type A = Head<[1,2,3]>
 *      ^? 1
 *
 * type B = Head<[1]>
 *      ^? 1
 *
 * type C = Head<[]>
 *      ^? unknown
 * */
export type Head<L extends unknown[]> = L extends [infer H, ...infer _]
  ? H
  : unknown;

/**
 * type A = Tail<[1,2,3]>
 *      ^? [2,3]
 *
 * type B = Tail<[1]>
 *      ^? []
 *
 * type C = Tail<[]>
 *      ^? []
 * */
export type Tail<L extends unknown[]> = L extends [
  infer _,
  ...infer T extends unknown[]
]
  ? T
  : [];

/**
 * type A = ExpBody<(_: "a") => (_: "b") => "a b c">
 *      ^? "a b c"
 * */
export type ExpBody<Exp extends AF | string> = Exp extends string
  ? Exp
  : Exp extends (_: any) => infer R
  ? R extends AF
    ? ExpBody<R>
    : R
  : never;

/**
 *
 *  type A = UnwrapArgs<'f(g(x))'>
 *       ^? [Sym<"F">, Sym<"G">, Sym<"X">]
 *
 *  type B = UnwrapArgs<'f'>
 *       ^? [Sym<"F">]
 *
 *  type C = UnwrapArgs<''>
 *       ^? []
 *
 */
type UnwrapArgs<S extends string, Acc extends Sym<string>[] = []> = S extends ""
  ? Acc
  : S extends `${infer H}${"("}${infer T}${")"}`
  ? H extends ""
    ? UnwrapArgs<T, Acc>
    : UnwrapArgs<T, [...Acc, Sym<H>]>
  : [...Acc, Sym<S>];

/**
 *
 *  type A = SplitBody<'f'>
 *       ^? [Sym<"F">]
 *
 *  type B = SplitBody<'f g(x)'>
 *       ^? [Sym<"F">, Sym<"G">, Sym<"X">]
 *
 *  type C = SplitBody<'a f(g(x))'>
 *       ^? [Sym<"A">, Sym<"F">, Sym<"G">, Sym<"X">]
 *
 *  type D = SplitBody<''>
 *       ^? []
 *
 *  type D = SplitBody<unknown>
 *       ^? unknown
 */
export type SplitBody<
  S extends unknown,
  Acc extends Sym<string>[] = []
> = S extends string
  ? S extends ""
    ? Acc
    : S extends `${infer H}${" "}${infer T}`
    ? H extends ""
      ? Acc
      : SplitBody<T, [...Acc, ...UnwrapArgs<Uppercase<H>>]>
    : [...Acc, ...UnwrapArgs<Uppercase<S>>]
  : S;

/**
 *
 *  type A = FunBody<(_: "a") => (_: "b") => "a b c">
 *       ^? "a b c"
 *
 *  type B = FunBody<(_: "a") => (_: "b") => Sym<"a">>
 *       ^? [Sym<"a">]
 *
 *  type C = FunBody<Sym<"a">>
 *       ^? Sym<"a">
 */
export type FunBody<Exp extends AF | Sym<string>> = Exp extends (
  _: any
) => infer R
  ? R extends AF
    ? FunBody<R>
    : R
  : Exp;

/**
 * type A = FindInEnv<["A", Sym<"ID">], { ID: lambda<(_: "a") => "a">}>
 *      ^? lambda<(_: "a") => "a">
 *
 * type B = FindInEnv<["A", Sym<"ID">]>
 *      ^? ["A", Sym<"ID">]
 * */
export type FindInEnv<
  Tuple extends unknown,
  Env extends Record<string, Lambda<AF>> = {}
> = Tuple extends [infer Key, infer Snd extends Sym<string>]
  ? Uppercase<Snd["name"]> extends infer SName extends keyof Env
    ? [Key, Env[SName]]
    : Tuple
  : Tuple;

/**
 * type A = FindTermInVars<Sym<"A">, [["A", Sym<"ID">]], Env>;
 *      ^? { readonly exp: (_: "x") => "x"; readonly [_kind]: 'λ'; }
 *
 * type B = FindTermInVars<Sym<"B">, [["A", Sym<"ID">]], Env>;
 *      ^? { readonly name: "B"; readonly [_kind]: 'symbol'; }
 *
 * type C = FindTermInVars<Lambda<(_: "x") => "x">, [["A", Sym<"ID">]], Env>;
 *      ^? { readonly exp: (_: "x") => "x"; readonly [_kind]: 'λ'; }
 *
 */
export type FindTermInVars<
  GTerm extends Term,
  Vars extends ASTStructure["vars"],
  Env extends Record<string, Lambda<AF>> = {}
> = GTerm extends Sym<string>
  ? Uppercase<GTerm["name"]> extends infer SName extends string
    ? Vars extends []
      ? GTerm
      : FindInEnv<Head<Vars>, Env> extends [
          infer _ extends Uppercase<SName>,
          infer Value
        ]
      ? unknown extends Value
        ? GTerm
        : Value
      : FindTermInVars<GTerm, Tail<Vars>>
    : GTerm
  : GTerm;

/**
 * type A = ReplaceBody<[["A", unknown]], [Sym<"A">], Env>;
 *      ^? [Sym<"A">]
 *
 * type B = ReplaceBody<[["A", Sym<"ID">]], [Sym<"A">], Env>;
 *      ^? [Lambda<(_: 'x') => 'x'>]
 *
 * type C = ReplaceBody<[], [Sym<"A">], Env>;
 *      ^? [Sym<"A">]
 *
 * type D = ReplaceBody<[], [Sym<"A">], Env>;
 *      ^? [Sym<"A">]
 * */
export type ReplaceBody<
  Vars extends ASTStructure["vars"],
  Body extends ASTStructure["body"],
  Env extends Record<string, Lambda<AF>> = {},
  Acc extends ASTStructure["body"] = []
> = Body extends []
  ? Acc
  : ReplaceBody<
      Vars,
      Tail<Body>,
      Env,
      [...Acc, FindTermInVars<Head<Body>, Vars, Env>]
    >;

/**
 * type A = DefOrSym<Sym<"A">>
 *      ^? Sym<"A">
 *
 * type B = DefOrSym<Sym<"A">, { A: Lambda<(_: "a") => "a"> }>
 *      ^? Lambda<(_: "a") => "a">
 * */
export type DefOrSym<
  S extends Sym<string>,
  Env extends Record<string, Lambda<AF>> = {}
> = Uppercase<S["name"]> extends infer K extends keyof Env ? Env[K] : S;
