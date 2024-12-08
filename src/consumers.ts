import {Consumers} from './types';

/**
 * TODO: try tokenizer instead regex
 */
export const consumers: Consumers = {
    datetime: function (input) {
        const [, datetime, rest] = RegExp(/^(\w+\s+\d+\s\d+:\d+:\d+)(.*)/).exec(input);
        const [, monthStr, day, time] = RegExp(/^(\w+)\s+(\d+)\s+(.*?)$/).exec(datetime);

        const currentYear = new Date().getFullYear();
        const dateString = `${monthStr} ${day} ${currentYear} ${time}`;

        return [
            rest.trim(),
            new Date(dateString),
        ];
    },
    string: function (input) {
        const {args} = this;
        const [, match, rest] = RegExp(/^(.*?)\s(.*)/).exec(input);

        let string = match;
        if (args?.every((arg) => typeof arg === 'number')) {
            string = string.slice(...args as Array<number>);
        }

        return [
            rest?.trim(),
            string,
        ];
    },
    tuple: function (input) {
        const matches = RegExp(/^(\w+)=((?:"[^"]*")?|.*?)(?:, (.*)|$)/).exec(input);
        if (!matches) {
            return [input, null];
        }

        const [, key, value, rest] = matches;

        return [
            rest?.trim(),
            [key, value],
        ];
    },
    skip: (input) => {
        const [, string, rest] = RegExp(/^(\w+)(.*)/).exec(input);

        return [
            rest?.trim(),
            string,
        ];
    },
};

