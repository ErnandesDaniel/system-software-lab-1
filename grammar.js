module.exports = grammar({
    name: 'mylang',

    extras: $ => [
        /\s/,
        $.comment,
    ],

    // Формат conflicts изменился - теперь это массив массивов конфликтующих правил
    // Для "висячего else" конфликт происходит внутри одного правила (if_stmt),
    // но формат требует массив массивов. Обернем в массив.
    conflicts: $ => [
        [$.if_stmt] // Массив, содержащий один элемент - массив с if_stmt
    ],

    rules: ($, { seq, repeat, optional, choice, alias, prec, token }) => { // Импортируем все нужные функции

        const commaSep1 = (rule) => seq(rule, repeat(seq(',', rule)));
        const commaSep = (rule) => optional(commaSep1(rule));

        return {
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
                commaSep($.arg), // Используем commaSep, которая может быть пустой
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

            // Правило if_stmt с optional else
            if_stmt: $ => seq('if', $._expr, 'then', $._statement, optional(seq('else', $._statement))),

            loop_stmt: $ => seq(choice('while', 'until'), $._expr, repeat($._statement), 'end'),
            repeat_stmt: $ => prec(1, seq($._statement, choice('while', 'until'), $._expr, ';')),
            break_stmt: $ => seq('break', ';'),
            expr_stmt: $ => seq($._expr, ';'),
            block_stmt: $ => seq(choice('begin', '{'), repeat(choice($._statement, $._source_item)), choice('end', '}')),

            // === Выражения: иерархия по приоритету ===
            _expr: $ => choice(
                $.binary_expr,
                $.unary_expr,
                $.call_expr,
                $.slice_expr,
                $.primary_expr
            ),

            // Бинарные операторы с явными приоритетами и левой ассоциативностью
            binary_expr: $ => choice(
                prec.left(1, seq($._expr, alias('||', $.bin_op), $._expr)),
                prec.left(2, seq($._expr, alias('&&', $.bin_op), $._expr)),
                prec.left(3, seq($._expr, alias('|', $.bin_op), $._expr)),
                prec.left(4, seq($._expr, alias('^', $.bin_op), $._expr)),
                prec.left(5, seq($._expr, alias('&', $.bin_op), $._expr)),
                prec.left(6, seq($._expr, alias(choice('==', '!='), $.bin_op), $._expr)),
                prec.left(7, seq($._expr, alias(choice('<', '<=', '>', '>='), $.bin_op), $._expr)),
                prec.left(8, seq($._expr, alias(choice('<<', '>>'), $.bin_op), $._expr)),
                prec.left(9, seq($._expr, alias(choice('+', '-'), $.bin_op), $._expr)),
                prec.left(10, seq($._expr, alias(choice('*', '/', '%'), $.bin_op), $._expr))
            ),


            // Унарные операторы — приоритет выше всех бинарных
            unary_expr: $ => prec.left(11, seq(alias(choice('!', '-', '~'), $.un_op), $._expr)),

            // Вызовы функций и индексация/срезы - приоритет выше primary, но ниже unary
            call_expr: $ => prec(12, seq($._expr, '(', commaSep($._expr), ')')),
            slice_expr: $ => prec(12, seq($._expr, '[', commaSep($.range), ']')),

            // Группировка
            parenthesized_expr: $ => seq('(', $._expr, ')'),

            // Первичные выражения (атомарные элементы)
            primary_expr: $ => choice(
                $.parenthesized_expr,
                $.identifier,
                $.literal
            ),

            // Диапазон для срезов
            range: $ => seq($._expr, optional(seq('..', $._expr))),

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
        };
    }
});