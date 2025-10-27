module.exports = grammar({
    name: 'mylang',

    extras: $ => [
        /\s/,
    ],

    rules: {
        source: $ => repeat($.func_def),

        func_def: $ => seq('def', $.identifier, 'end'),

        identifier: $ => /[a-zA-Z_][a-zA-Z_0-9]*/
    }
});