import {Modifiers} from './types';

export const modifiers: Modifiers = {
    join: function (container) {
        const {args} = this;
        const delimiter = args[0] as string;

        const items = container.values().flat();
        container.pack('string', [items.join(delimiter)]);

        return container;
    },
    values: function (container) {
        const {args} = this;
        const found = container.find(args[0] as string);

        const detached = container.detach();
        detached.pack('values', found);

        return detached;
    },
};

