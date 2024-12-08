export type Argument = string | number;

export type Arguments = Array<Argument>;

export type Alias = string;

export type Aliases = Record<string, Alias>;

export type Items = Array<Item>;

export type Consumer = (this: { args: Arguments }, string: string) => [
    string,
    unknown
];

export type Modifier = (this: { args: Arguments }, container: Container) => Container;

export type Consumers = Record<string, Consumer>;

export type Modifiers = Record<string, Modifier>;

export type Item = {
    name: string,
    values: Array<unknown>,
};

export type Container = {
    input: string,
    status: 'success' | 'failure' | 'pending',
    map: <T>(fn: (item: Item) => T) => Array<T>,
    values: () => Array<unknown>,
    unpack: () => Array<unknown>,
    pack: (name: string, values: Array<unknown>) => void,
    push: (name: string, values: Array<unknown>) => void,
    replace: (name: string, values: Array<unknown>) => void,
    find: (name: string) => Array<unknown>,
    detach: () => Container,
    attach: (container: Container) => void,
    ref: {
        subject: string,
        items: Items,
    }
}
