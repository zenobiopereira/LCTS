// https://github.com/gvergnaud/hotscript

declare const rawArgs: unique symbol;
type rawArgs = typeof rawArgs;
declare const _: unique symbol;
type _ = typeof _;

export type Equal<a, b> = (<T>() => T extends a ? 1 : 2) extends <
  T
>() => T extends b ? 1 : 2
  ? true
  : false;

export interface Fn {
  [rawArgs]: unknown;
  args: this[rawArgs] extends infer args extends unknown[] ? args : never;
  arg0: this[rawArgs] extends [infer arg, ...any] ? arg : never;
  arg1: this[rawArgs] extends [any, infer arg, ...any] ? arg : never;
  arg2: this[rawArgs] extends [any, any, infer arg, ...any] ? arg : never;
  arg3: this[rawArgs] extends [any, any, any, infer arg, ...any] ? arg : never;
  return: unknown;
}

export type ExcludePlaceholders<xs, output extends any[] = []> = xs extends [
  infer first,
  ...infer rest
]
  ? Equal<first, _> extends true
  ? ExcludePlaceholders<rest, output>
  : ExcludePlaceholders<rest, [...output, first]>
  : output;

/**
 * Call a HOTScript function with the given arguments.
 *
 * @param fn - The function to call.
 * @param args - The arguments to pass to the function.
 * @returns The result of the function.
 *
 * @example
 * ```ts
 * type T0 = Apply<Numbers.Add, [1, 2]>; // 3
 * ```
 */
export type Apply<fn extends Fn, args extends unknown[]> = (fn & {
  [rawArgs]: args;
})["return"];

export type Digits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
export type Digit = Digits[number];

export type FromDigits<T, Acc extends string = ""> = T extends [
  infer N extends Digit,
  ...infer R
]
  ? FromDigits<R, `${Acc}${N}`>
  : Acc;


type AddDigitTable = [
  [
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 0],
    [2, 3, 4, 5, 6, 7, 8, 9, 0, 1],
    [3, 4, 5, 6, 7, 8, 9, 0, 1, 2],
    [4, 5, 6, 7, 8, 9, 0, 1, 2, 3],
    [5, 6, 7, 8, 9, 0, 1, 2, 3, 4],
    [6, 7, 8, 9, 0, 1, 2, 3, 4, 5],
    [7, 8, 9, 0, 1, 2, 3, 4, 5, 6],
    [8, 9, 0, 1, 2, 3, 4, 5, 6, 7],
    [9, 0, 1, 2, 3, 4, 5, 6, 7, 8]
  ],
  [
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 0],
    [2, 3, 4, 5, 6, 7, 8, 9, 0, 1],
    [3, 4, 5, 6, 7, 8, 9, 0, 1, 2],
    [4, 5, 6, 7, 8, 9, 0, 1, 2, 3],
    [5, 6, 7, 8, 9, 0, 1, 2, 3, 4],
    [6, 7, 8, 9, 0, 1, 2, 3, 4, 5],
    [7, 8, 9, 0, 1, 2, 3, 4, 5, 6],
    [8, 9, 0, 1, 2, 3, 4, 5, 6, 7],
    [9, 0, 1, 2, 3, 4, 5, 6, 7, 8],
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
  ]
];

type AddDigitCarryTable = [
  [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 1, 1, 1],
    [0, 0, 0, 0, 0, 0, 1, 1, 1, 1],
    [0, 0, 0, 0, 0, 1, 1, 1, 1, 1],
    [0, 0, 0, 0, 1, 1, 1, 1, 1, 1],
    [0, 0, 0, 1, 1, 1, 1, 1, 1, 1],
    [0, 0, 1, 1, 1, 1, 1, 1, 1, 1],
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 1]
  ],
  [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 1, 1, 1],
    [0, 0, 0, 0, 0, 0, 1, 1, 1, 1],
    [0, 0, 0, 0, 0, 1, 1, 1, 1, 1],
    [0, 0, 0, 0, 1, 1, 1, 1, 1, 1],
    [0, 0, 0, 1, 1, 1, 1, 1, 1, 1],
    [0, 0, 1, 1, 1, 1, 1, 1, 1, 1],
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
  ]
];

type AddDigit<
  T extends Digit,
  U extends Digit,
  Carry extends 0 | 1 = 0
> = AddDigitTable[Carry][T][U];

type AddCarryDigit<
  T extends Digit,
  U extends Digit,
  Carry extends 0 | 1 = 0
> = AddDigitCarryTable[Carry][T][U];

export type AddDigits<
  T extends Digit[],
  U extends Digit[],
  Carry extends 0 | 1 = 0,
  Acc extends Digit[] = []
> = T extends [...infer R extends Digit[], infer N extends Digit]
  ? U extends [...infer S extends Digit[], infer M extends Digit]
  ? AddDigits<
    R,
    S,
    AddCarryDigit<N, M, Carry>,
    [AddDigit<N, M, Carry>, ...Acc]
  >
  : AddDigits<
    R,
    [],
    AddCarryDigit<N, 0, Carry>,
    [AddDigit<N, 0, Carry>, ...Acc]
  >
  : U extends [...infer S extends Digit[], infer M extends Digit]
  ? AddDigits<
    [],
    S,
    AddCarryDigit<0, M, Carry>,
    [AddDigit<0, M, Carry>, ...Acc]
  >
  : Carry extends 1
  ? [1, ...Acc]
  : Acc;

export type ToDigitNumber<T extends string> = T extends `-${infer R}`
  ? { sign: "-"; num: ToDigits<R> }
  : { sign: ""; num: ToDigits<T> };

export type ToDigits<
  T extends string,
  Acc extends Digit[] = []
> = T extends `${infer N extends Digit}${infer R}`
  ? ToDigits<R, [...Acc, N]>
  : Acc;

export type DigitNumber = { sign: "-" | ""; num: Digit[] };
export type MakeDigitNumber<S extends "-" | "", N extends Digit[]> = {
  sign: S;
  num: N;
};

export type Num<T extends DigitNumber> = T["num"];
export type Sign<T extends DigitNumber> = T["sign"];


// type A = AddDigit<3, 7> ---> 0

export type TrimZeros<T extends Digit[]> = T extends [0]
  ? [0]
  : T extends [0, ...infer R extends Digit[]]
  ? TrimZeros<R>
  : T;

export type Normalize<
  T extends DigitNumber,
  Trim extends Digit[] = TrimZeros<Num<T>>
> = Trim extends [0]
  ? MakeDigitNumber<"", Trim>
  : MakeDigitNumber<Sign<T>, Trim>;

export type FromDigitNumber<T extends DigitNumber> = `${Sign<T>}${FromDigits<
  Num<T>
>}`;

export type ToString<T extends number | bigint> = `${T}`;

export type Add<
  T extends number | bigint,
  U extends number | bigint
> =
  FromDigitNumber<
    Normalize<
      MakeDigitNumber<Sign<{ sign: "", num: [0] }>, AddDigits<Num<ToDigitNumber<ToString<T>>>, Num<ToDigitNumber<ToString<U>>>>>
    >
  >


interface AddFn extends Fn {
  return: this["args"] extends [
    infer a extends number | bigint,
    infer b extends number | bigint,
    ...any
  ]
  ? Add<a, b>
  : never;
}

export type Call<
  fn extends Fn,
  arg0 = _,
  arg1 = _,
  arg2 = _,
  arg3 = _
> = (fn & {
  [rawArgs]: ExcludePlaceholders<[arg0, arg1, arg2, arg3]>;
})

type A = AddDigits<Num<{ sign: "", num: [3] }>, Num<{ sign: "", num: [7] }>>
//   ^?
type B = MakeDigitNumber<Sign<{ sign: "", num: [0] }>, A>
//   ^?
type C = Normalize<B>
//   ^?
type D = FromDigitNumber<C>
//   ^?
type E = Add<1, 50>
//   ^?

type F = Apply<AddFn, [1, 2]>
//   ^?
