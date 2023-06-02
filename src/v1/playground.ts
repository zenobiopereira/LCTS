/**
 *
 * If you want to validate the tests, please feel free to copy and paste the types into the TS playground.
 * TS playground link with the following tests: https://tsplay.dev/WvxX4N
 *
 */

import type { Sym, Lambda } from "./blocks";
import type { DefEnv, Def } from "./env";
import type { ToExp, BetaReduction, FromAST, Exp } from "./core";

type Env = DefEnv<
  [
    Def<"ID", (_: "x") => "x">,
    Def<"ZERO", (_: "x") => "ID">,
    Def<"ONE", (_: "f") => (_: "x") => "f x">,
    Def<"TWO", (_: "f") => (_: "x") => "f ONE">,
    Def<"SUCC", (_: "n") => (_: "f") => (_: "x") => "f n f x">,
    Def<"true", (_: "a") => (_: "b") => "a">,
    Def<"false", (_: "a") => (_: "b") => "b">,
    Def<"TEST", (_: "a") => (_: "a") => "a">
  ]
>;

type ExpT = Exp<
  Lambda<(_: "x") => (_: "y") => "f x y">,
  [Lambda<(_: "g") => "h">, Lambda<(_: "x") => "x">]
>;
type ExpT2 = Exp<Lambda<(_: "x") => (_: "y") => "x y">, [Sym<"a">, Env["ID"]]>;
type ExpT3 = Exp<Sym<"Two">, [Exp<Lambda<(_: "g") => "h">, [Sym<"i">]>], Env>;
type ExpT4 = Exp<Lambda<(_: "y") => "x">, [Sym<"i">]>;
type ExpT5 = Exp<Lambda<(_: "y") => "x">, []>;
type ExpT6 = Exp<Lambda<(_: "x") => (_: "y") => "x y">, [Env["ID"]]>;
type ExpT7 = Exp<Lambda<(_: "x") => "ID x">, [Sym<"a">, Sym<"b">], Env>;

// Given: (λf.λx. 1 f(x) n)(λx.x) 1
// Expected: (λx.nx)
type T = Exp<
  Lambda<(_: "f") => (_: "x") => "one f(x) n">,
  [Env["ID"], Sym<"one">],
  Env
>;
type T2 = BetaReduction<T, Env>;
type T3 = FromAST<T2, Env>;
type T4 = ToExp<T3, Env>;
type T5 = BetaReduction<T4, Env>;
type T6 = FromAST<T5, Env>;
type T7 = ToExp<T6, Env>;
type T8 = BetaReduction<T7, Env>;
type T9 = FromAST<T8, Env>;
type T10 = ToExp<T9, Env>;
type T11 = BetaReduction<T10, Env>;

// Given: (λf.λx.f x) (λx.x) (λx.x)
// Expected: (λx.x)
type B = Exp<
  Lambda<(_: "f") => (_: "x") => "f x">,
  [Sym<"ID">, Lambda<(_: "x") => "x">],
  Env
>;
type B1 = BetaReduction<B, Env>;
type B2 = FromAST<B1, Env>;
type B3 = ToExp<B2, Env>;
type B4 = BetaReduction<B3, Env>;
type B5 = FromAST<B4, Env>;
type B6 = ToExp<B5, Env>;

// Given: (λf.λx.f x) a (λx.x)
// Expected: a (λx.x)
type C = Exp<
  Lambda<(_: "f") => (_: "x") => "f x">,
  [Sym<"A">, Lambda<(_: "a") => "a">]
>;
type C1 = BetaReduction<C, Env>;
type C2 = FromAST<C1, Env>;
type C3 = ToExp<C2, Env>;

// Given: (λf.λx.f x y) (λg.h) i
// Expected: f(λg.h)i
type D = Exp<
  Lambda<(_: "x") => (_: "y") => "f x y">,
  [Lambda<(_: "g") => "h">, Sym<"i">]
>;
type D1 = BetaReduction<D, Env>;
type D2 = FromAST<D1, Env>;
type D3 = ToExp<D2, Env>;

// Given: (λx.x)((λx.λy.f x y)(λg.h)(λx.x))
// Expected: f(λg.h)(λx.x)
type E = Exp<
  Env["ID"],
  [
    Exp<
      Lambda<(_: "x") => (_: "y") => "f x y">,
      [Lambda<(_: "g") => "h">, Lambda<(_: "x") => "x">]
    >
  ]
>;
type E1 = BetaReduction<E, Env>;
type E2 = FromAST<E1, Env>;
type E3 = ToExp<E2, Env>;
type E4 = BetaReduction<E3, Env>;

// Given: (λf.λx.λy. f x y)((λg.h) i)
// Expected: (λy.f h y)
type F = Exp<
  Lambda<(_: "x") => (_: "y") => "f x y">,
  [Exp<Lambda<(_: "g") => "h">, [Sym<"i">]>]
>;
type F1 = BetaReduction<F, Env>;

// Given: (λn.λf.λx.f (n f x))(λx.x)(λf.λx.f x)(λx.x)
// Expected: Reduces to (λx. (λx.x) x) which is the same as (λx.x)
type G = Exp<
  Env["SUCC"],
  [
    Lambda<(_: "x") => "x">,
    Lambda<(_: "f") => (_: "x") => "f x">,
    Lambda<(_: "x") => "x">
  ],
  Env
>;
type G1 = BetaReduction<G, Env>;
type G2 = FromAST<G1, Env>;
type G3 = ToExp<G2, Env>;
type G4 = BetaReduction<G3, Env>;
type G5 = FromAST<G4, Env>;
type G6 = ToExp<G5, Env>;
type G7 = BetaReduction<G6, Env>;
type G8 = FromAST<G7, Env>;
type G9 = ToExp<G8, Env>;
type G10 = BetaReduction<G9, Env>;

// IsZero: λn.n (λx.FALSE) TRUE
// It reduces to (ID TRUE) which is the same as (TRUE).
type ShouldBeTrue = ToExp<
  FromAST<
    BetaReduction<
      ToExp<
        FromAST<
          BetaReduction<
            Exp<
              Lambda<(_: "a") => (_: "n") => "n a true">,
              [Lambda<(_: "x") => "x False">, Env["ZERO"]],
              Env
            >,
            Env
          >,
          Env
        >
      >
    >
  >
>;

// IsZero: λn.n (λx.FALSE) TRUE
// Reduces to (λb.FALSE) which it's the same as CONSTANT of FALSE.
type ShouldBeFalse = BetaReduction<
  //   ^?
  ToExp<
    FromAST<
      BetaReduction<
        ToExp<
          FromAST<
            BetaReduction<
              ToExp<
                FromAST<
                  BetaReduction<
                    Exp<
                      Lambda<(_: "a") => (_: "n") => "n a true">,
                      [Lambda<(_: "x") => "x False">, Env["ONE"]],
                      Env
                    >,
                    Env
                  >,
                  Env
                >
              >
            >
          >
        >
      >
    >
  >
>;
