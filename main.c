#include <stdio.h>
#include <stdlib.h>

int main(int argc, char *argv[]) {
    if (argc != 3) {
        fprintf(stderr, "Использование: %s <входной_файл> <выходной_файл>\n", argv[0]);
        return 1;
    }

    FILE *input = fopen(argv[1], "r");
    if (!input) {
        perror("Ошибка открытия входного файла");
        return 1;
    }

    FILE *output = fopen(argv[2], "w");
    if (!output) {
        perror("Ошибка создания выходного файла");
        fclose(input);
        return 1;
    }

    int ch;
    while ((ch = fgetc(input)) != EOF) {
        fputc(ch, output);
    }

    fclose(input);
    fclose(output);
    return 0;
}