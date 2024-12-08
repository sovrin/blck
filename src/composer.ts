import {Aliases, Consumer, Consumers, Modifier, Modifiers} from './types';
import {consumers as internalConsumers} from './consumers';
import {modifiers as internalModifiers} from './modifiers';

import tokenizer, {Token} from './tokenizer';

type ModifierToken = Token & {
    modifier: Modifier,
}

export type Composed = {
    instructions: Array<InstructionToken>,
    modifiers: Array<Array<ModifierToken>>,
}

type InstructionToken = Token & {
    consumer: Consumer,
    tokens?: Composed,
}

type Options = {
    aliases: Aliases,
    consumers: Consumers,
    modifiers: Modifiers,
}

const closure = (options: Options) => {
    const {tokenize} = tokenizer();

    const {
        aliases,
        consumers: externalConsumers,
        modifiers: externalModifiers,
    } = options;

    const consumerSet: Consumers = {
        ...externalConsumers,
        ...internalConsumers,
    };

    const modifierSet: Modifiers = {
        ...externalModifiers,
        ...internalModifiers,
    };

    const mapModifiers = (token: Token): ModifierToken => {
        const modifier = modifierSet[token.name];
        if (!modifier) {
            throw Error(`No modifier found by the name "${token.name}".`);
        }

        return {
            ...token,
            modifier,
        };
    };

    const mapInstruction = (token: Token): InstructionToken => {
        const consumer = consumerSet[token.name];

        const instructionToken: InstructionToken = {
            ...token,
            consumer,
        };

        if (!consumer) {
            const alias = aliases[token.name];
            if (!alias) {
                throw Error(`No consumer found by name or alias "${token.name}".`);
            }

            instructionToken.tokens = compose(alias);
        }

        return instructionToken;
    };

    const compose = (query: string): Composed => {
        const tokens = tokenize(query);

        return {
            instructions: tokens.instructions.map(mapInstruction),
            modifiers: tokens.modifiers.map((value) => value.map(mapModifiers)),
        };
    };

    return {
        compose,
    };
};

export default closure;
