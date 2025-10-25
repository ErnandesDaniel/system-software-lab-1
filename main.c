// main.c
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "src/tree_sitter/parser.h"

// Объявляем функцию, сгенерированную Tree-sitter
TSLanguage *tree_sitter_mylang();

int main(int argc, char **argv) {
    if (argc != 3) {
        fprintf(stderr, "Usage: %s <input_file> <output.json>\n", argv[0]);
        return 1;
    }

    // Читаем входной файл
    FILE *input_file = fopen(argv[1], "rb");
    if (!input_file) {
        perror("fopen input");
        return 1;
    }
    fseek(input_file, 0, SEEK_END);
    long size = ftell(input_file);
    fseek(input_file, 0, SEEK_SET);
    char *source_code = malloc(size + 1);
    fread(source_code, 1, size, input_file);
    source_code[size] = '\0';
    fclose(input_file);

    // Создаём парсер
    TSParser *parser = ts_parser_new();
    ts_parser_set_language(parser, tree_sitter_mylang());

    // Парсим
    TSTree *tree = ts_parser_parse_string(parser, NULL, source_code, size);

    // Проверяем ошибки
    if (ts_tree_root_node(tree) == NULL || ts_node_is_null(ts_tree_root_node(tree))) {
        fprintf(stderr, "Parsing failed\n");
        return 1;
    }

    // Экспортируем дерево в JSON
    char *json = ts_tree_to_json(tree);
    FILE *output_file = fopen(argv[2], "w");
    if (!output_file) {
        perror("fopen output");
        free(json);
        return 1;
    }
    fputs(json, output_file);
    fclose(output_file);
    free(json);
    free(source_code);
    ts_tree_delete(tree);
    ts_parser_delete(parser);
    return 0;
}