// Импортируем модуль tree-sitter для получения вспомогательных функций
const {
    // Используется для определения повторяющихся последовательностей элементов (0 или более)
    repeat,

    // Используется для определения необязательных элементов
    optional,

    // Используется для определения альтернатив (один из)
    choice,

    // Используется для определения последовательностей элементов
    seq,

    // Используется для определения терминала, который не может быть частью другого терминала (например, идентификатор, не являющийся ключевым словом).
    // Требуется для разрешения конфликтов между идентификаторами и ключевыми словами.
    prec,

    // Используется для указания приоритета и ассоциативности операторов.
    // prec.left() - левоассоциативный оператор
    // prec.right() - правоассоциативный оператор
    // prec.dynamic() - динамический приоритет

    // Используется для определения регулярных выражений для лексем (токенов).
    // Обычно используется для идентификаторов, чисел, строк.
    token,

    // Используется для определения строковых литералов (ключевые слова).
    // Аналогично token(string), но часто используется для ключевых слов.
    // Мы будем использовать token() для ключевых слов.
    // field - позволяет задавать именованные поля в узлах AST для лучшего доступа к дочерним элементам.
    // field('name', rule) - добавляет поле 'name' к результату правила 'rule'.
    // Используется для улучшения структуры AST.
    field,

    // $ - псевдоним для объекта правил грамматики (GRAMMAR).
    // $ - это объект, в который добавляются все правила (start, rules, word, extras, conflicts, precedences).
    // Внутри функции grammar() $ - это аргумент, который нужно вернуть.
} = require('tree-sitter');


// Основная функция, определяющая грамматику.

// Она возвращает объект с конфигурацией грамматики.



// Правило списка соответствует: (item (',' item)*)?

module.exports = grammar({

    // Имя грамматики. Используется для идентификации.
    name: 'mylang',

    // Указывает начальный символ грамматики - точка входа в синтаксический анализ.
    // Все корректные программы должны соответствовать этому правилу.
    // В нашем случае - это source.
    start: $ => $.source,

    // Правила грамматики. Это основная часть, определяющая структуру языка.
    rules: {

        // Лексические правила - определяют, как распознаются отдельные элементы языка
        // identifier: "[a-zA-Z_][a-zA-Z_0-9]*";
        identifier: $ => token(/[a-zA-Z_][a-zA-Z0-9_]*/), // Регулярное выражение для идентификатора

        // str: "\"[^\"\\]*(?:\\.[^\"\\]*)*\"";
        str: $ => token(seq('"', /[^"\\]*(?:\\.[^"\\]*)*/, '"')), // Строковый литерал в двойных кавычках с экранированием

        // char: "'[^']'";
        char: $ => token(seq("'", /[^']/, "'")), // Символьный литерал в одинарных кавычках

        // hex: "0[xX][0-9A-Fa-f]+";
        hex: $ => token(/0[xX][0-9A-Fa-f]+/), // Шестнадцатеричный литерал

        // bits: "0[bB][01]+";
        bits: $ => token(/0[bB][01]+/), // Битовый литерал

        // dec: "[0-9]+";
        dec: $ => token(/[0-9]+/), // Десятичный литерал

        // bool: 'true'|'false';
        bool: $ => choice(token('true'), token('false')), // Булевский литерал

        // source: sourceItem*;
        // Корень программы. Состоит из нуля или более sourceItem (обычно это определения функций)
        source: $ => repeat($.source_item),

        // sourceItem: {
        // |funcDef: 'def' funcSignature statement* 'end';
        // };
        // Определение элемента исходного кода. В текущей грамматике только функции.
        // funcDef: 'def' funcSignature statement* 'end';
        source_item: $ => seq(
            // Ключевое слово 'def' как идентификатор объявления функции
            token('def'),
            // Далее следует сигнатура функции
            $.func_signature,

            // Ноль или более операторов внутри тела функции
            repeat($.statement),

            // Ключевое слово 'end', закрывающее тело функции
            token('end')
        ),

        // funcSignature: identifier '(' list<arg> ')' ('of' typeRef)?;
        // Сигнатура функции: имя, список аргументов, опционально - тип возвращаемого значения.
        func_signature: $ => seq(
            // Имя функции (идентификатор)
            $.identifier,
            // Открывающая скобка
            token('('),
            // Список аргументов, определенный как list<arg>
            $.list_arg,
            // Закрывающая скобка
            token(')'),
            // Необязательный тип возвращаемого значения, начинающийся с 'of'
            optional(seq(token('of'), $.type_ref))
        ),

        // list<item>: (item (',' item)*)?;
        // Общий шаблон для списка элементов, разделенных запятыми.
        // list<arg> для аргументов функции
        list_arg: $ => optional(
            seq(
                $.arg, // Первый элемент
                repeat( // Повторяющийся паттерн: запятая и следующий элемент
                    seq(token(','), $.arg)
                )
        )),

        // arg: identifier ('of' typeRef)?;
        // Определение аргумента функции: имя и опциональный тип.
        arg: $ => seq(
            // Имя аргумента (идентификатор)
            $.identifier,
            // Необязательная спецификация типа, начинающаяся с 'of'
            optional(seq(token('of'), $.type_ref))
        ),

        // typeRef: {
        // |builtin: 'bool'|'byte'|'int'|'uint'|'long'|'ulong'|'char'|'string';
        // |custom: identifier;
        // |array: typeRef 'array' '[' dec ']'; // число - размерность
        // };
        // Ссылка на тип данных.
        type_ref: $ => choice(
            // Встроенные (базовые) типы
            $.builtin_type,
            // Пользовательский (кастомный) тип - идентификатор
            $.identifier, // custom: identifier;
            // Массив заданного типа с фиксированным размером
            seq(
                // Базовый тип массива
                field('element_type', $.type_ref),
                // Ключевое слово 'array'
                token('array'),
                // Открывающая квадратная скобка
                token('['),
                // Размерность массива (десятичное число)
                field('size', $.dec),
                // Закрывающая квадратная скобка
                token(']')
            )
        ),

        // builtin: 'bool'|'byte'|'int'|'uint'|'long'|'ulong'|'char'|'string';
        // Встроенные типы данных. Выделены в отдельное правило для читаемости.
        builtin_type: $ => choice(
            token('bool'),
            token('byte'),
            token('int'),
            token('uint'),
            token('long'),
            token('ulong'),
            token('char'),
            token('string')
        ),

        // statement: { // присваивание через '='
        // |if: 'if' expr 'then' statement ('else' statement)?;
        // |loop: ('while'|'until') expr statement* 'end';
        // |repeat: statement ('while'|'until') expr ';';
        // |break: 'break' ';';
        // |expression: expr ';';
        // |block: ('begin'|'{') (statement|sourceItem)* ('end'|'}');
        // };
        // Определение оператора (statement).
        statement: $ => choice(

            // if: 'if' expr 'then' statement ('else' statement)?;
            seq(
                token('if'),
                $.expr,
                token('then'),
                $.statement,
                optional(seq(token('else'), $.statement))
            ),

            // loop: ('while'|'until') expr statement* 'end';
            seq(
                choice(token('while'), token('until')),
                $.expr,
                repeat($.statement),
                token('end')
            ),

            // repeat: statement ('while'|'until') expr ';';
            seq(
                $.statement,
                choice(token('while'), token('until')),
                $.expr,
                token(';')
            ),

            // break: 'break' ';';
            seq(token('break'), token(';')),

            // expression: expr ';';
            seq($.expr, token(';')),

            // block: ('begin'|'{') (statement|sourceItem)* ('end'|'}');
            seq(
                choice(token('begin'), token('{')),
                repeat(choice($.statement, $.source_item)), // Позволяет вложенные определения функций в блоке
                choice(token('end'), token('}'))
            )
        ),

        // expr: binary_expr
        //     | unary_expr
        //     | parenthesized_expr
        //     | call_expr
        //     | slice_expr
        //     | identifier
        //     | literal;
        // Корневое правило для выражений. Охватывает все возможные формы выражений
        // в языке: операции, вызовы, литералы и переменные.
        expr: $ => choice(
            $.binary_expr,
            $.unary_expr,
            $.parenthesized_expr,
            $.call_expr,
            $.slice_expr,
            $.identifier,
            $.literal
        ),


        // binary_expr: expr ('*' | '/' | '%') expr
        //             | expr ('+' | '-') expr
        //             | expr ('<' | '>' | '==' | '!=' | '<=' | '>=') expr
        //             | expr '&&' expr
        //             | expr '||' expr
        //             | expr '=' expr;
        // Бинарные операторы с явным указанием приоритетов и ассоциативности.
        // Приоритеты убывают сверху вниз; присваивание — правоассоциативное.
        binary_expr: $ => choice(
            prec.left(2, seq(
                field('left', $.expr),
                field('operator', choice('*', '/', '%')),
                field('right', $.expr)
            )),
            prec.left(1, seq(
                field('left', $.expr),
                field('operator', choice('+', '-')),
                field('right', $.expr)
            )),
            prec.left(0, seq(
                field('left', $.expr),
                field('operator', choice('<', '>', '==', '!=', '<=', '>=')),
                field('right', $.expr)
            )),
            prec.left(-1, seq(
                field('left', $.expr),
                field('operator', '&&'),
                field('right', $.expr)
            )),
            prec.left(-2, seq(
                field('left', $.expr),
                field('operator', '||'),
                field('right', $.expr)
            )),
            prec.right(-3, seq(
                field('left', $.expr),
                field('operator', '='),
                field('right', $.expr)
            ))
        ),

        // unary_expr: ('-' | '+' | '!' | '~') expr;
        // Унарные операторы. Правоассоциативны: -!x разбирается как -( !x ).
        unary_expr: $ => prec.right(1, seq(
            field('operator', choice('-', '+', '!', '~')),
            field('operand', $.expr)
        )),

        // parenthesized_expr: '(' expr ')';
        // Группировка подвыражения с помощью скобок для переопределения приоритета.
        parenthesized_expr: $ => seq('(', $.expr, ')'),

        // call_expr: expr '(' list_expr ')';
        // Вызов функции: выражение, за которым следует список аргументов в скобках.
        call_expr: $ => seq(
            field('function', $.expr),
            '(',
            field('arguments', $.list_expr),
            ')'
        ),

        // list<expr> для аргументов вызова функции
        list_expr: $ => optional(
            seq(
                $.expr, // Первое выражение
                repeat( // Повторяющийся паттерн: запятая и следующее выражение
                    seq(token(','), $.expr)
                )
            )
        ),

        // slice_expr: expr '[' list_range ']';
        // Доступ к элементам массива или срез: может содержать один или несколько
        // индексов или диапазонов, разделённых запятыми.
        slice_expr: $ => seq(
            field('array', $.expr),
            '[',
            field('ranges', $.list_range),
            ']'
        ),

        // list<range> для срезов массива
        list_range: $ => optional(
            seq(
                $.range, // Первый диапазон
                repeat( // Повторяющийся паттерн: запятая и следующий диапазон
                    seq(token(','), $.range)
                )
            )
        ),

        // range: expr ('..' expr)?;
        // Диапазон для среза массива: expr ('..' expr)? - начальный индекс и опциональный конечный индекс
        range: $ => seq(
            $.expr, // Начальный индекс
            optional(seq(token('..'), $.expr)) // Опциональный конечный индекс
        ),

        // literal: bool | str | char | hex | bits | dec;
        // Атомарные значения, не содержащие подвыражений.
        literal: $ => choice(
            $.bool,
            $.str,
            $.char,
            $.hex,
            $.bits,
            $.dec
        ),
    },
});