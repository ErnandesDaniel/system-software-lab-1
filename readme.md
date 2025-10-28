установить зависимости Node.js:
npm install

Запуск генерации грамматики:
npx tree-sitter generate

src- исходники парсера

Конвертировать файл на языке mylang в S-expression формате в файл через стандартный инструмент библиотеки:
npx tree-sitter parse input.mylang > ast.json

<-------Использование GCC компилятора----------->

Установить gcc комплиятор на свою среду

Проверить через gcc --version

Скомпилировать в исполняемый можно через:
gcc -o main main.c lib/cJSON/cJSON.c

Windows PowerShell:

gcc -std=c17 -Wall -Wextra `
  -Ilib/tree-sitter/lib/include `
-Ilib/tree-sitter/lib/src `
  -Ilib/cJSON `
-o main.exe `
  main.c `
lib/tree-sitter/lib/src/lib.c `
  src/parser.c `
lib/cJSON/cJSON.c

Запустить можно через
./main input.mylang ast.json


<-------Использование CMake системы сборки----------->

Скомпилировать в CLion

Далее можно запустить программу:
./cmake-build-debug/system_software_lab_1 input.mylang ast.json
