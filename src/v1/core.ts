import type {
  AF,
  Tail,
  Head,
  SplitBody,
  FunBody,
  DefOrSym,
  Irreducible,
  Flat,
  PickUnknowns,
  ReplaceBody,
  ASTStructure,
  Term,
  Lambda,
  Sym,
} from "./blocks";

declare const INVALID_EXPRESSION: unique symbol;

type EvalTermList<
  List extends Term[],
  Env extends Record<string, Lambda<AF>> = {},
  EvaluatedBody extends Term[] = []
> = List extends []
  ? EvaluatedBody
  : Head<List> extends infer H extends ASTStructure
  ? EvalTermList<
      Tail<List>,
      Env,
      [...EvaluatedBody, FromAST<BetaReduction<H, Env>>]
    >
  : EvalTermList<Tail<List>, Env, [...EvaluatedBody, Flat<Head<List>>]>;

/**
 *
 * Creates the AST given an Arrow Function and a list of Terms.
 */
type AST<
  F extends AF,
  Args extends Term[] = [],
  Vars extends [string, Term][] = []
> = F extends ((_: infer A extends string) => infer R extends AF)
  ? AST<
      R,
      Tail<Args>,
      Head<Args> extends infer H extends Term
        ? [...Vars, [Uppercase<A>, H]]
        : Vars
    >
  : F extends (_: infer A extends string) => string
  ? {
      vars: Head<Args> extends infer H extends Term
        ? [...Vars, [Uppercase<A>, H]]
        : Vars;
      body: SplitBody<FunBody<F>>;
      args: Tail<Args>;
    }
  : typeof INVALID_EXPRESSION;

/**
 *
 * Creates an Expression given a Lambda or a Symbol and a list of Terms which will be the arguments.
 *
 * It's also possible
 */
export type Exp<
  T extends Lambda<AF> | Sym<string>,
  Args extends Term[] = [],
  Env extends Record<string, Lambda<AF>> = {}
> = T extends Sym<string>
  ? DefOrSym<T, Env> extends infer R extends Lambda<AF>
    ? Exp<R, Args, Env>
    : Irreducible<[T, ...Flat<EvalTermList<Args, Env>>]>
  : T extends Lambda<AF>
  ? Args extends []
    ? Irreducible<T>
    : AST<T["exp"], Args>
  : typeof INVALID_EXPRESSION;

/**
 *
 * Interpret the Body of a given AST and return a list of terms or a new AST.
 */
export type FromAST<
  Ast extends ASTStructure,
  Env extends Record<string, Lambda<AF>> = {},
  Acc extends ASTStructure["body"] = []
> = Ast["body"] extends []
  ? Flat<[...Acc, ...Ast["args"]]>
  : Flat<Head<Ast["body"]>> extends infer Symb extends Sym<string>
  ? Acc extends []
    ? Exp<Symb, [...Tail<Ast["body"]>, ...Ast["args"]], Env>
    : FromAST<
        Pick<Ast, "args" | "vars"> & { body: Flat<Tail<Ast["body"]>> },
        Env,
        [...Acc, Flat<Head<Ast["body"]>>]
      >
  : FromAST<
      Pick<Ast, "args" | "vars"> & { body: Flat<Tail<Ast["body"]>> },
      Env,
      [...Acc, Flat<Head<Ast["body"]>>]
    >;

/**
 *
 * Turn a List of Terms in a new AST representation.
 *
 * Pretty much "Apply" but not quite because of my bad implementation.
 * A better implementation can mitigate any problem here but it is what it is...
 */
export type ToExp<
  Lst extends Term[],
  Env extends Record<string, Lambda<AF>> = {}
> = Head<Lst> extends Sym<string> | Lambda<AF>
  ? Exp<Head<Lst>, Tail<Lst>, Env>
  : Lst extends [infer H extends ASTStructure, ...infer _ extends []]
  ? H
  : never; // Not able to reproduce a reduction that hits this clause...

/**
 *
 * Replace the body with the known Bound variables and return the AST.
 *
 * Unknown bound variables will be kept on the body as "symbols" and on the "vars" list.
 */
export type BetaReduction<
  Ast extends unknown,
  Env extends Record<string, Lambda<AF>> = {}
> = Ast extends ASTStructure
  ? PickUnknowns<Ast["vars"]> extends infer Vars extends []
    ? {
        vars: Vars;
        body: Flat<
          EvalTermList<ReplaceBody<Ast["vars"], Ast["body"], Env>, Env>
        >;
        args: Ast["args"];
      }
    : Irreducible<{
        vars: PickUnknowns<Ast["vars"]>;
        body: Flat<
          EvalTermList<ReplaceBody<Ast["vars"], Ast["body"], Env>, Env>
        >;
        args: Ast["args"];
      }>
  : Ast;
