import EventEmitter from 'node:events';
import {Aliases, Consumers, Modifiers} from './types';
import composer from './composer';
import digester from './digester';

type Options = Partial<{
    aliases: Aliases,
    consumers: Consumers,
    modifiers: Modifiers,
}>

type Listener = Parameters<EventEmitter['on']>[1];

const closure = (options: Options) => {
    const {compose} = composer({
        aliases: options?.aliases,
        consumers: options?.consumers,
        modifiers: options?.modifiers,
    });

    const eventEmitter = new EventEmitter();

    const consume = (query: string) => {
        const composedTokens = compose(query);
        const digest = digester(composedTokens);

        return (input: string) => {
            try {
                const {ref: {items}} = digest(input);
                eventEmitter.emit('line', items);
            } catch (error) {
                eventEmitter.emit('error', error);
            }
        };
    };

    const on = (event: string, listener: Listener) => {
        eventEmitter.on(event, listener);
    };

    const emit = (event: string, ...args: Array<unknown>) => {
        eventEmitter.emit(event, ...args);
    };

    return {
        on,
        emit,
        consume,
    };
};

/**
 * User: Oleg Kamlowski <oleg.kamlowski@thomann.io>
 * Date: 08.12.24
 * Time: 14:46
 */
export default closure;
export type {
    Options,
    Aliases,
    Consumers,
    Modifiers,
};

