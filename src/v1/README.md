## Idea.

The idea here it just to parse a given curried function `Lambda<(_: "x") => 'x'>` or a `Sym<"id">` that's already defined on a given `Env`, reduce this AST and show the AST representation of the reduction.

- `Lambda` functions are represented on this project in a way that intends to be easier for anyone that has enough knowledge of Javascript(ES6) arrow functions syntax.

- The way the types are implemented contains a bunch of validations that, given a better use of `Generics` and `MY BRAIN`, could be better implemented. But again, that would change the initial representation that I want to follow, and for now, that's my current point.

- [Tests and link to the monolith implementation on "src/v1/playground.ts"](/src/v1//playground.ts).
---

## How to Use.

The steps for reduction are the following

1. Create the `Expression`. `Exp<Lambda<AF> | Sym<string>, Arguments[], ?Env>`.
2. Check if the `Expression` is reducible.

```Typescript
// Reducible
type ExpA = Exp<Lambda<(_: 'y') => 'x'>, [Sym<'i'>]>
//    ^? { vars: [["Y", Sym<"i">]]; body: [Sym<"X">]; args: []; }

// Irreducible
type ExpB = Exp<Lambda<(_: 'y') => 'x'>, []>
//    ^? { terms: Lambda<(_: 'y') => 'x'>; readonly [_kind]: 'Irreducible'; }

// Irreducible
type ExpC = Exp<Sym<'Two'>, [Exp<Lambda<(_: 'g') => 'h'>, [Sym<'i'>]>]>
//    ^? { terms: [Sym<"Two">, Sym<"H">]; readonly [_kind]: 'Irreducible'; }

// Reducible
type ExpD = Exp<Sym<'Two'>, [Exp<Lambda<(_: 'g') => 'h'>, [Sym<'i'>]>], Env>
//    ^? {
//     	   vars: [["F", {
//     	         vars: [["G", Sym<"i">]];
//     	         body: [Sym<"H">];
//     	         args: [];
//     	       }],
//     	       ["X", unknown]];
//     	   body: [Sym<"F">, Sym<"ONE">];
//     	   args: [];
// 		 }
```

## **Reducing**

1. Call `BetaReduction<GENERATED_AST_FROM_EXP, ?YOUR_ENV>`.
	- Give your `Env` type as the second generic type parameter in order to make the reduction decide if it will be possible to find part of the body, or some argument, within the given `Env`.
2. Call `FromAST<BETA_REDUCED_AST, ?YOUR_ENV>`.
3. Call `ToEXP<FROM_AST_REPRESENTATION, ?YOUR_ENV>`.
4. Continue till you hit the `Irreducible` type.
```Typescript

type Env = DefEnv<[
	Def<"ID", (_: 'x') => 'x'>,
  Def<"ZERO", (_: 'x') => 'ID'>,
  Def<"true", (_: 'a') => (_: 'b') => 'a'>,
  Def<"false", (_: "a") => (_: "b") => "b">
]>

// IsZero: λn.n (λx.FALSE) TRUE
type IsZero = Exp<
	Lambda<(_: "a") => (_: "n") => "n a true">,
	[Lambda<(_: "x") => "x False">, Env['ZERO']],
	Env
>

type ShouldBeTrue = ToExp<
//   ^? { terms: [Sym<"TRUE">]; readonly [_kind]: 'Irreducible'; }
  FromAST<
    BetaReduction<
      ToExp<
        FromAST<
          BetaReduction<
            ToExp<
              FromAST<
                BetaReduction<
                  IsZero
                  , Env
                >
                , Env
              >
            >
          >
        >
			, Env
      >
    >
  >
>

```

## Env and reusable Definitions.

As one would expect, it's possible to define reusable Functions which will be stored within a type `Env`;

```Typescript
// DefEnv received a list of Def<string, Lambda<AF>>
type Env = DefEnv<[
//   ^? { ID: Lambda<(_: 'x') => 'x'>, TRUE: Lambda<(_: 'f') => (_: 'x') => 'f x'> }
    Def<"id", (_: 'x') => 'x'>,
    Def<"true", (_: 'a') => (_: 'b') => 'a'>
]>
```

## Expression to AST.

```TypeScript
type Expression = Exp<
        Lambda<(_: 'x') => (_: 'y') => 'f x y'>,
        [Lambda<(_: 'g') => 'h'>, Lambda<(_: 'x') => 'x'>]>
/**
 * Exp = (λx.(λy.f x y))(λg.h)(λx.x)
 *
 * SyntaxTree = {
 *    vars: [
        ["X", { exp: (_: "g") => "h"; readonly [lambda]: 'λ' }],
        ["Y", { exp: (_: "x") => "x"; readonly [lambda]: 'λ' }]
      ];
 *    body: [Sym<"F">, Sym<"X">, Sym<"Y">];
 *    args: [];
 * }
*/

type Expression2 = Exp<Lambda<(_: 'y') => 'x y'>, [Lambda<(_: 'g') => 'h'>, Lambda<(_: 'x') => 'x'>]>
/**
 * Exp = (λy.x y)(λg.h)(λx.x)
 *
 * SyntaxTree = {
 *   vars: [["Y", Lambda<(_: 'g') => 'h'>]];
 *   body: [Sym<"X">, Sym<"Y">];
 *   args: [Lambda<(_: 'x') => 'x'>];
 * }
*/

type Expression3 = Exp<Lambda<'f'>, [Exp<Lambda<(_: 'g') => 'h'>, ['i']>]>
/**
 * Exp = f(λg.h)i
 *
 * SyntaxTree = {
 *   terms: [Sym<"f">, { vars: [["G", "i"]]; *   body: [Sym<"H">];   args: [];
 *    }];
 *    readonly [_kind]: 'Irreducible';
 * }
*/
```

---

## References
1. [Hotscript.](https://github.com/gvergnaud/hotscript)
2. [Lambda Calculus](https://en.wikipedia.org/wiki/Lambda_calculus#Normal_forms_and_confluence)
3. ["LambdaCalc.io" for tests and assertions.](https://lambdacalc.io/)

---

## Assumptions and Progress.

Important assumptions for this version.

  1. `Lambda` definitions are curried as in λ-calculus and the argument needs to be a `string`.

  2. `Alpha-Reduction` it's not implemented mostly because it will evaluate recursively the arguments when possible and will hit the `irreducible` type if there's any `unknown` bound variable.

  3. Since `Alpha-Reduction` isn't implemented, it follows the assumption that whoever is using it will have different named arguments within the same `Lambda` definition. 
  ```TS
    // The following code will behave in a way which might not be what you expect;
    type ExpT = BetaReduction<Exp<Lambda<(_: "x") => (_: "x") => "x">, [Sym<"a">, Sym<"b">]>>
    //    ^? { vars: []; body: [Sym<"a">]; args: []; }

    // To prevent the above behavior, please use different names on the same Lambda definition.
    type ExpT = BetaReduction<Exp<Lambda<(_: "x") => (_: "xx") => "x xx">, [Sym<"a">, Sym<"b">]>>
    //    ^? { vars: []; body: [Sym<"a">, Sym<"b">]; args: []; }
  ```

  4. `Env` cannot have two definitions with the same name. The type will tell you.

  5. To use something already defined on `Env`, you can use the definition or the `Sym` with the name.
  ```TS
  type ID = Exp<Lambda<Env["ID"], [<...args>]>.
  type ID2 = Exp<Sym<"ID">, [<...args>]>.
  type ID3 = Exp<Sym<"iD">, [<...args>]>.
  type ID4 = Exp<Sym<"id">, [<...args>]>.
  type ID5 = Exp<Sym<"Id">, [<...args>]>.
  ```
  6. To use something defined on `Env` but on the body, refer to it by it's name.

  ```TS
  type IDOfx = Exp<Lambda<(_: 'x') => 'ID x'>, [<...args>]>.
  ```

  7. The idea is reducing following the `Normal Order`.

  8. All the code was made using the Typescript playground at first, TS v5.1.3.
