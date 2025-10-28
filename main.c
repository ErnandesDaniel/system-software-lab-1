#include <stdio.h>
#include <stdlib.h>
#include "lib/cJSON/cJSON.h"

// Простая функция для чтения всего файла в строку
char* read_file(const char* filename, long* size) {
    FILE* f = fopen(filename, "rb");
    if (!f) return NULL;

    fseek(f, 0, SEEK_END);
    *size = ftell(f);
    fseek(f, 0, SEEK_SET);

    char* buffer = malloc(*size + 1);
    if (!buffer) {
        fclose(f);
        return NULL;
    }

    fread(buffer, 1, *size, f);
    buffer[*size] = '\0';
    fclose(f);
    return buffer;
}

int main(int argc, char *argv[]) {
    if (argc != 3) {
        fprintf(stderr, "Usage: %s <input_file> <output_json>\n", argv[0]);
        return 1;
    }

    long file_size;
    char* content = read_file(argv[1], &file_size);
    if (!content) {
        perror("The input file could not be read");
        return 1;
    }

    // Создаём JSON-объект
    cJSON *root = cJSON_CreateObject();
    cJSON_AddStringToObject(root, "text_content", content);
    cJSON_AddNumberToObject(root, "text_length", (double)file_size);

    // Можно добавить больше полей по мере анализа
    // Например: cJSON_AddStringToObject(root, "language", "mylang");

    // Преобразуем в строку
    char *json_str = cJSON_Print(root);
    cJSON_Delete(root);
    free(content);

    if (!json_str) {
        fprintf(stderr, "JSON generation error\n");
        return 1;
    }

    // Записываем в выходной файл
    FILE *out = fopen(argv[2], "w");
    if (!out) {
        perror("Failed to create an output file");
        free(json_str);
        return 1;
    }
    fputs(json_str, out);
    fclose(out);
    free(json_str);

    return 0;
}