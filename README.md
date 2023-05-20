## LCTS (Lambda Calculus - Typescript)

- A naive implementation of Lambda Calculus on the type level.

- It will have multiple versions every time I think in a possible different way of encoding things.

## Expression to AST

```TypeScript
type Expression = Exp<Lambda<(_: 'x') => (_: 'y') => 'f x y'>, [Lambda<(_: 'g') => 'h'>, Lambda<(_: 'x') => 'x'>]>
/**
 * Exp = (λx.(λy.f x y))(λg.h)(λx.x)
 * 
 * SyntaxTree = {
 *   vars: {
 *     x: {
 *       exp: (_: "g") => "h";
 *       readonly [lambda]: 'λ';
 *       },
 *     y: {
 *       exp: (_: "x") => "x";
 *       readonly [lambda]: 'λ';
 *     };
 *   };
 *   body: ["f", "x", "y"];
 *   args: [];
 * }
*/

type Expression2 = Exp<Lambda<(_: 'y') => 'x y'>, [Lambda<(_: 'g') => 'h'>, Lambda<(_: 'x') => 'x'>]>
/**
 * Exp = (λy.x y)(λg.h)(λx.x)
 *
 * SyntaxTree = {
 *   vars: {
 *     y: {
 *         exp: (_: "g") => "h";
 *         readonly [lambda]: 'λ';
 *     };
 *   };
 *   body: ["x", "y"];
 *   args: [{
 *       exp: (_: "x") => "x";
 *       readonly [lambda]: 'λ';
 *   }];
 * }
*/

type Expression3 = Exp<Lambda<'f'>, [Exp<Lambda<(_: 'g') => 'h'>, ['i']>]>
/**
 * Exp = f(λg.h)i
 * SyntaxTree = {
 *   vars: {};
 *   body: ["f"];
 *   args: [{
 *       vars: NormalizeExtendedObj<{
 *           g: "i";
 *       }>;
 *       body: ["h"];
 *       args: [];
 *   }];
}
*/

```

## Assumptions and Progress

### Some assumptions and things to keep track.

---
1. `Lambda` definitions are curried as in λ-calculus and the argument needs to be a `string`.
2. `Exp`, for now, will not handle functions where multiple arguments have the same name.

    a. **TODO: Alpha-Reduction.**

3. `Env` cannot have two definitions with the same name.
4. To use something already defined on `Env`, do;
    ```Typescript
    type ID = Exp<Lambda<Env["ID"], [<...args>]>.
    ```
5. To use something defined on `Env` but on the body, refer to it by it's name.
    ```typescript
    type IDOfx = Exp<Lambda<(_: 'x') => 'ID x'>, [<...args>]>.
    ```
