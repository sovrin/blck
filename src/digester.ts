import containerClosure from './container';
import {Container} from './types';
import {Composed} from './composer';

type ModifierToken = Composed['modifiers'][number][number];
type InstructionToken = Composed['instructions'][number];

const closure = (composed: Composed) => {
    const digestModifiers = (container: Container, tokens: Array<ModifierToken>) => {
        for (const token of tokens) {
            container = token.modifier
                .call({args: token.params}, container);
        }

        return container;
    };

    const digestInstructions = (container: Container, tokens: Array<InstructionToken>) => {
        for (const token of tokens) {
            let values = [];
            let value: unknown;

            if (token.tokens !== undefined) {
                const detached = container.detach();
                digest(detached, token.tokens);
                values = detached.unpack();
                container.attach(detached);
            } else {
                let output: string;

                do {
                    [output, value] = token.consumer
                        .call({args: token.params, context}, container.ref.subject);
                    if (!value) {
                        break;
                    }

                    container.ref.subject = output;
                    values.push(value);
                } while (token.quantifier && container.ref.subject);
            }

            container.push(
                token.alias || token.name,
                values,
            );
        }

        return container;
    };

    const digest = (container: Container, tokens: Composed) => {
        container = digestInstructions(container, tokens.instructions);
        for (const modifiersTokens of tokens.modifiers) {
            container = digestModifiers(container, modifiersTokens);
        }

        // not pretty at the moment
        if (container.ref.subject == undefined) {
            container.status = 'success';
        } else {
            container.status = 'failure';
        }

        return container;
    };

    return (line: string) => {
        const container = containerClosure(line);

        return digest(container, composed);
    };
};

export default closure;
