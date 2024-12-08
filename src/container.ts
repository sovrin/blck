import {Container, Item} from './types';

const closure = (
    input: string
): Container => {
    const ref = {
        subject: input,
        items: [],
    };

    const status: 'pending' | 'complete' = 'pending';

    const map = <T>(fn: (item: Item) => T): Array<T> => {
        return ref.items.map(fn);
    };

    const values = () => {
        return ref.items.map(({values}) => values);
    };

    const find = <T>(name: string): Array<T> => {
        return (ref.items.find((entry) => name === entry.name)?.values as Array<T>);
    };

    const replace = (name: string, values: Array<unknown>) => {
        const index = ref.items.findIndex((entry) => name === entry.name);
        if (index === -1) {
            return;
        }

        ref.items[index].values = values;
    };

    const push = (name: string, values: Array<unknown>) => {
        ref.items.push({
            name,
            values,
        });
    };

    const unpack = () => {
        return ref.items.map(({values}) => values)
            .flat();
    };

    const pack = (name: string, values: Array<unknown>) => {
        ref.items = [
            {
                name,
                values,
            },
        ];
    };

    const detach = () => {
        return closure(ref.subject);
    };

    const attach = (container: Container) => {
        ref.subject = container.ref.subject;

        return;
    };

    return {
        push,
        map,
        values,
        replace,
        find,
        unpack,
        pack,
        detach,
        attach,
        status,
        input,
        ref,
    };
};

/**
 * User: Oleg Kamlowski <oleg.kamlowski@thomann.io>
 * Date: 08.12.24
 * Time: 14:46
 */
export default closure;
