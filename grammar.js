// grammar.js
module.exports = grammar({
    name: 'mylang',

    extras: $ => [
        /\s/, // пробелы
        $.comment,
    ],

    rules: {
        source: $ => repeat($._source_item),

        _source_item: $ => choice(
            $.func_def
        ),

        // Типы
        type_ref: $ => choice(
            $.builtin_type,
            $.custom_type,
            $.array_type
        ),

        builtin_type: $ => choice('bool', 'byte', 'int', 'uint', 'long', 'ulong', 'char', 'string'),
        custom_type: $ => $.identifier,
        array_type: $ => seq($.type_ref, 'array', '[', $.dec, ']'),

        // Функции
        func_signature: $ => seq(
            $.identifier,
            '(',
            optional(commaSep1($.arg)),  // ← optional только здесь, не в отдельном правиле
            ')',
            optional(seq('of', $.type_ref))
        ),
        arg: $ => seq($.identifier, optional(seq('of', $.type_ref))),

        func_def: $ => seq(
            'def',
            $.func_signature,
            repeat($._statement),
            'end'
        ),

        // Операторы
        _statement: $ => choice(
            $.if_stmt,
            $.loop_stmt,
            $.repeat_stmt,
            $.break_stmt,
            $.expr_stmt,
            $.block_stmt
        ),

        if_stmt: $ => seq('if', $._expr, 'then', $._statement, optional(seq('else', $._statement))),
        loop_stmt: $ => seq(choice('while', 'until'), $._expr, repeat($._statement), 'end'),
        repeat_stmt: $ => prec(1, seq($._statement, choice('while', 'until'), $._expr, ';')),
        break_stmt: $ => seq('break', ';'),
        expr_stmt: $ => seq($._expr, ';'),
        block_stmt: $ => seq(choice('begin', '{'), repeat(choice($._statement, $._source_item)), choice('end', '}')),

        // Выражения
        _expr: $ => choice(
            $.binary_expr,
            $.unary_expr,
            $.parenthesized_expr,
            $.call_expr,
            $.slice_expr,
            $.identifier,
            $.literal
        ),
        binary_expr: $ => prec.left(10, seq($._expr, $.bin_op, $._expr)),
        unary_expr: $ => prec(20, seq($.un_op, $._expr)),
        parenthesized_expr: $ => seq('(', $._expr, ')'),
        call_expr: $ => seq($._expr, '(', optional(commaSep($._expr)), ')'),
        slice_expr: $ => seq($._expr, '[', commaSep($.range), ']'),
        range: $ => seq($._expr, optional(seq('..', $._expr))),

        bin_op: $ => choice(
            '+', '-', '*', '/', '%',
            '==', '!=', '<', '<=', '>', '>=',
            '&&', '||', '&', '|', '^', '<<', '>>'
        ),
        un_op: $ => choice('!', '-', '~'),

        // Литералы и идентификаторы
        identifier: $ => /[a-zA-Z_][a-zA-Z_0-9]*/,
        str: $ => /"[^"\\]*(?:\\.[^"\\]*)*"/,
        char: $ => /'[^']'/,
        hex: $ => /0[xX][0-9A-Fa-f]+/,
        bits: $ => /0[bB][01]+/,
        dec: $ => /[0-9]+/,
        literal: $ => choice(
            'true', 'false',
            $.str,
            $.char,
            $.hex,
            $.bits,
            $.dec
        ),

        comment: $ => token(seq('//', /.*/))
    }
});

// Вспомогательная функция для списков через запятую
function commaSep(rule) {
    return optional(commaSep1(rule));
}

function commaSep1(rule) {
    return seq(rule, repeat(seq(',', rule)));
}