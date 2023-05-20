## LCTS (Lambda Calculus - Typescript)

- A naive implementation of Lambda Calculus on the Typescript type level to see how much I do understand both TS and LC.

- It will have multiple versions every time I think in a possible different way of encoding.

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
