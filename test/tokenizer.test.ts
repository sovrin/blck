import {describe} from 'mocha';
import {assert} from 'chai';
import tokenizer, {parse} from '../src/tokenizer';

describe('blck', () => {
    describe('tokenizer', () => {
        const {
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
        } = tokenizer();

        it('should return digit', () => {
            assert.equal(parse<any>('000', digit), '0');
            assert.equal(parse<any>('123', digit), '1');
            assert.equal(parse<any>('-123', digit), '-1');
            assert.throws(() => (
                parse<any>('foo', digit)
            ), "[Parser regex](digit)");
        });

        it('should return digits', () => {
            assert.equal(parse<any>('0', digits), 0);
            assert.equal(parse<any>('-1', digits), -1);
            assert.equal(parse<any>('123', digits), 123);
            assert.equal(parse<any>('123f', digits), 123);
            assert.isNaN(parse<any>('foo', digits));
            assert.isNaN(parse<any>('f1f', digits));
        });

        it('should return letter', () => {
            assert.equal(parse<any>('foo', letter), 'f');
            assert.throws(() => (
                parse<any>('123', letter)
            ), "[Parser regex](letter)");
        });

        it('should return character', () => {
            assert.equal(parse<any>('foo', character), 'f');
            assert.equal(parse<any>('123', character), 1);
            assert.throws(() => (
                parse<any>('!@#', character)
            ), "[Parser any](character)");
        });

        it('should return key', () => {
            assert.equal(parse<any>('foo', key), 'foo');
            assert.equal(parse<any>('f123', key), 'f123');
            assert.throws(() => (
                parse<any>('!@#', key)
            ), "[Parser regex](letter)");
        });

        it('should return value', () => {
            assert.equal(parse<any>('foo', value), 'foo');
            assert.equal(parse<any>('"foo"', value), 'foo');
            assert.equal(parse<any>('"foo bar"', value), 'foo bar');
            assert.equal(parse<any>('123f', value), '123f');
            assert.equal(parse<any>('!@#', value), null);
            assert.equal(parse<any>('"!@#"', value), '!@#');
        });

        it('should return literal', () => {
            assert.equal(parse<any>('"foo"', literal), 'foo');
            assert.equal(parse<any>('"foo"', literal), 'foo');
            assert.equal(parse<any>('"foo bar"', literal), 'foo bar');
            assert.equal(parse<any>('"123f"', literal), '123f');
            assert.equal(parse<any>('"!@#"', literal), '!@#');
            assert.throws(() => (
                parse<any>('   "foo"   ', literal)
            ), "[Parser map](literal, [Parser regex](literal))");
        });

        it('should return space', () => {
            assert.equal(parse<any>(' ', space), null);
            assert.equal(parse<any>('   ', space), null);
        });

        it('should return quantifier', () => {
            assert.equal(parse<any>('*', quantifier), '*');
            assert.throws(() => (
                parse<any>('', quantifier)
            ), "[Parser alpha](quantifier)");
            assert.throws(() => (
                parse<any>('foo*bar', quantifier)
            ), "[Parser alpha](quantifier)");
        });

        it('should return alias', () => {
            assert.equal(parse<any>(':', alias), ':');
            assert.throws(() => (
                parse<any>('', alias)
            ), "[Parser alpha](alias)");
            assert.throws(() => (
                parse<any>('foo:bar', alias)
            ), "[Parser alpha](alias)");
        });

        it('should return args', () => {
            assert.deepEqual(parse<any>('()', args), []);
            assert.deepEqual(parse<any>('(foo)', args), ['foo']);
            assert.deepEqual(parse<any>('("foo bar")', args), ['foo bar']);
            assert.deepEqual(parse<any>('(foo,bar)', args), ['foo', 'bar']);
            assert.deepEqual(parse<any>('(foo,bar,da12)', args), ['foo', 'bar', 'da12']);
            assert.deepEqual(parse<any>('(0)', args), [0]);
            assert.deepEqual(parse<any>('(, 1)', args), [null, 1]);
            assert.deepEqual(parse<any>('(0 , 1)', args), [0, 1]);
            assert.deepEqual(parse<any>('(1)', args), [1]);
            assert.deepEqual(parse<any>('(1,2)', args), [1, 2]);
            assert.deepEqual(parse<any>('(1 , 2)', args), [1, 2]);
            assert.deepEqual(parse<any>('(    1    , 2)', args), [1, 2]);
            assert.deepEqual(parse<any>('(1.23)', args), [1.23]);
            assert.deepEqual(parse<any>('(1.23, 333.333)', args), [1.23, 333.333]);
            assert.deepEqual(parse<any>('(   1.23   ,   333.333   )', args), [1.23, 333.333]);
            assert.deepEqual(parse<any>('(foo,   bar)', args), ['foo', 'bar']);
            assert.deepEqual(parse<any>('(   foo,   bar)', args), ['foo', 'bar']);
            assert.deepEqual(parse<any>('(   foo,   bar   )', args), ['foo', 'bar']);
            assert.deepEqual(parse<any>('(   foo   ,   bar   )', args), ['foo', 'bar']);
            assert.deepEqual(parse<any>('("_")', args), ['_']);
            assert.deepEqual(parse<any>('(" ")', args), [' ']);
            assert.throws(() => (
                parse<any>('   (foo,bar)   ', args)
            ), "[Parser map](args, [Parser sequence]([Parser alpha](open)))");
        });

        it('should return func', () => {
            assert.deepEqual(parse<any>('foo', func), {
                'alias': null,
                'name': 'foo',
                'params': null,
                'quantifier': false,
            });
            assert.deepEqual(parse<any>('foo(bar)', func), {
                'alias': null,
                'name': 'foo',
                'params': ['bar'],
                'quantifier': false,
            });
            assert.deepEqual(parse<any>('foo("foo bar")', func), {
                'alias': null,
                'name': 'foo',
                'params': ['foo bar'],
                'quantifier': false,
            });
            assert.deepEqual(parse<any>('foo(   bar)', func), {
                'alias': null,
                'name': 'foo',
                'params': ['bar'],
                'quantifier': false,
            });
            assert.deepEqual(parse<any>('foo(   bar   )', func), {
                'alias': null,
                'name': 'foo',
                'params': ['bar'],
                'quantifier': false,
            });
            assert.deepEqual(parse<any>('foo(bar,123)', func), {
                'alias': null,
                'name': 'foo',
                'params': ['bar', 123],
                'quantifier': false,
            });
            assert.deepEqual(parse<any>('foo(  bar  ,  123  )', func), {
                'alias': null,
                'name': 'foo',
                'params': ['bar', 123],
                'quantifier': false,
            });
            assert.deepEqual(parse<any>('foo  (bar)', func), {
                'alias': null,
                'name': 'foo',
                'params': null,
                'quantifier': false,
            });
            assert.deepEqual(parse<any>('foo:bar', func), {
                'alias': 'bar',
                'name': 'foo',
                'params': null,
                'quantifier': false,
            });
            assert.deepEqual(parse<any>('foo():bar', func), {
                'alias': 'bar',
                'name': 'foo',
                'params': [],
                'quantifier': false,
            });
            assert.throws(() => (
                parse<any>('foo()  :bar', args)
            ), "[Parser map](args, [Parser sequence]([Parser alpha](open)))");
            assert.throws(() => (
                parse<any>('foo(biz)  :bar', args)
            ), "[Parser map](args, [Parser sequence]([Parser alpha](open)))");
            assert.throws(() => (
                parse<any>('foo():   bar', args)
            ), "[Parser map](args, [Parser sequence]([Parser alpha](open)))");
            assert.throws(() => (
                parse<any>('foo(biz):   bar', args)
            ), "[Parser map](args, [Parser sequence]([Parser alpha](open)))");
            assert.deepEqual(parse<any>('foo*', func), {
                'alias': null,
                'name': 'foo',
                'params': null,
                'quantifier': true,
            });
            assert.deepEqual(parse<any>('foo(bar)*', func), {
                'alias': null,
                'name': 'foo',
                'params': ['bar'],
                'quantifier': true,
            });
            assert.deepEqual(parse<any>('foo(foo,bar,123)*', func), {
                'alias': null,
                'name': 'foo',
                'params': ['foo', 'bar', 123],
                'quantifier': true,
            });
            assert.deepEqual(parse<any>('foo(foo,bar,123):baz*', func), {
                'alias': 'baz',
                'name': 'foo',
                'params': ['foo', 'bar', 123],
                'quantifier': true,
            });
        });

        it('should return rule', () => {
            const result = parse<any>('date(month, day, time) string:machine string:app message tuple*', rules);

            assert.deepEqual(result, [
                    {
                        'alias': null,
                        'name': 'date',
                        'params': [
                            'month',
                            'day',
                            'time',
                        ],
                        'quantifier': false,
                    },
                    {
                        'alias': 'machine',
                        'name': 'string',
                        'params': null,
                        'quantifier': false,
                    },
                    {
                        'alias': 'app',
                        'name': 'string',
                        'params': null,
                        'quantifier': false,
                    },
                    {
                        'alias': null,
                        'name': 'message',
                        'params': null,
                        'quantifier': false,
                    },
                    {
                        'alias': null,
                        'name': 'tuple',
                        'params': null,
                        'quantifier': true,
                    },
                ]
            );
        });

        it('should return expression', () => {
            const res = parse<any>('date(month, day, time) string:machine string:app message tuple* | foo | bar(fizz, 123, "_") thing thing | foo', expression);

            assert.deepEqual(res, {
                "instructions": [
                    {
                        "alias": null,
                        "name": "date",
                        "params": [
                            "month",
                            "day",
                            "time"
                        ],
                        "quantifier": false
                    },
                    {
                        "alias": "machine",
                        "name": "string",
                        "params": null,
                        "quantifier": false
                    },
                    {
                        "alias": "app",
                        "name": "string",
                        "params": null,
                        "quantifier": false
                    },
                    {
                        "alias": null,
                        "name": "message",
                        "params": null,
                        "quantifier": false
                    },
                    {
                        "alias": null,
                        "name": "tuple",
                        "params": null,
                        "quantifier": true
                    }
                ],
                "modifiers": [
                    [
                        {
                            "alias": null,
                            "name": "foo",
                            "params": null,
                            "quantifier": false
                        }
                    ],
                    [
                        {
                            "alias": null,
                            "name": "bar",
                            "params": [
                                "fizz",
                                123,
                                "_"
                            ],
                            "quantifier": false
                        },
                        {
                            "alias": null,
                            "name": "thing",
                            "params": null,
                            "quantifier": false
                        },
                        {
                            "alias": null,
                            "name": "thing",
                            "params": null,
                            "quantifier": false
                        }
                    ],
                    [
                        {
                            "alias": null,
                            "name": "foo",
                            "params": null,
                            "quantifier": false
                        }
                    ]
                ]
            });
        })
    });
});
