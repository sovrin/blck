import onia, {alpha, any, filter, flatten, int, join, many, map, optional, Parser, pipe, pop, regex, sequence} from 'onia';
import {Alias, Consumer} from './types';

export type Token = {
    alias?: Alias,
    name: string,
    params?: Array<string | number | boolean>,
    quantifier: boolean,
};

export type Instructions = Array<Token & {
    instructions?: Instructions,
    consumer?: Consumer,
}>;

export type Modifier = Array<Token & {
    consumer?: Consumer,
}>;

export type Modifiers = Array<Modifier>;

export type Expression = {
    instructions: Instructions,
    modifiers: Modifiers,
};

type ParserReturn<Type> = Type extends Parser<infer T> ? T : never;

const closure = () => {
    const packFunction = () => ([name, params, alias, quantifier]: readonly [string, ParserReturn<typeof args>, string, string]) => ({
        alias,
        name,
        params,
        quantifier: !!quantifier,
    });

    const packExpression = () => (input: [never, never]): Expression => {
        const [instructions, modifiers] = input;

        return {
            instructions,
            modifiers,
        };
    };

    const cast = () => (input: any): null | boolean | number | string => {
        if (input === '') {
            return null;
        }

        if (typeof input === 'string') {
            switch (input) {
            case 'true':
                return true;
            case 'false':
                return false;
            }

            if (/^-?\d+$/.test(input)) {
                return parseInt(input);
            }

            if (/^-?\d*\.\d+$/.test(input)) {
                return parseFloat(input);
            }
        }

        return input as string;
    };

    const digit = regex(/-?\d/g, 'digit');
    const digits = map(
        many(
            digit,
        ),
        pipe(
            join(),
            int(),
        ),
    );
    const letter = regex(/[a-z]/ig, 'letter');
    const punctuation = regex(/[.]/ig, 'punctuation');
    const character = any([
        letter,
        digit,
        punctuation,
    ], 'character');
    const delimiter = alpha(',', 'delimiter');
    const open = alpha('(', 'open');
    const close = alpha(')', 'close');
    const quantifier = alpha('*', 'quantifier');
    const splitter = alpha('|', 'splitter');
    const alias = alpha(':', 'alias');
    const space = optional(
        regex(/\s+/g, 'space'),
        false,
        'space'
    );
    const key = map(
        sequence([
            letter,
            map(
                many(
                    character,
                ),
                join(),
            ),
        ]),
        join(),
        'key'
    );
    const literal = map(
        regex(/"(.*?)"/ig, 'literal'),
        (string: string) => string.replace(/^"(.*?)"$/ig, '$1'),
        'literal'
    );
    const value = map(
        any([
            literal,
            map(
                sequence([
                    many(
                        character,
                    ),
                ]),
                pipe(
                    flatten(),
                    join(),
                ),
            ),
            alpha('true'),
            alpha('false'),
        ]),
        cast(),
        'value',
    );
    const args = map(
        sequence([
            open,
            space,
            optional(value),
            space,
            optional(
                many(
                    map(
                        sequence([
                            delimiter,
                            space,
                            value,
                            space,
                        ]),
                        pipe(
                            filter([delimiter]),
                            pop(),
                        ),
                    ),
                ),
            ),
            close,
        ]),
        pipe(
            filter([
                open,
                close,
            ]),
            flatten(),
        ),
        'args'
    );
    const func = map(
        sequence([
            // optional(anyDeli),
            key,
            optional(args),
            optional(
                map(
                    sequence([
                        alias,
                        key,
                    ] as const),
                    pop(),
                ),
            ),
            optional(quantifier),
        ] as const),
        packFunction(),
        'function'
    );
    const rules = map(
        sequence([
            func,
            optional(
                map(
                    many(
                        map(
                            sequence([
                                space,
                                func,
                            ]),
                            filter([]),
                        ),
                    ),
                    flatten(),
                ),
            ),
        ]),
        flatten(),
        'rule',
    );
    const expression = map(
        sequence([
            rules,
            optional(
                many(
                    map(
                        sequence([
                            space,
                            splitter,
                            space,
                            rules,
                        ]),
                        pipe(
                            filter([splitter]),
                            flatten(),
                        )
                    ),
                ),
            ),
        ]),
        packExpression(),
        'expression'
    );

    const tokenize = (input: string): ParserReturn<typeof expression> => {
        return parse(input, expression);
    };

    return {
        tokenize,
        digit,
        digits,
        letter,
        character,
        key,
        value,
        literal,
        space,
        quantifier,
        alias,
        args,
        func,
        rules,
        expression,
    };
};

export const parse = <T extends Parser<unknown>>(input: string, parser: T): ParserReturn<T> => {
    return onia(input, parser) as ParserReturn<T>;
};

/**
 * User: Oleg Kamlowski <oleg.kamlowski@thomann.de>
 * Date: 19.05.2022
 * Time: 16:31
 */
export default closure;
