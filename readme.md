установить зависимости Node.js:
npm install

Запуск генерации грамматики:
npx tree-sitter generate

src- исходники парсера

Конвертировать файл на языке mylang в S-expression формате в файл через стандартный инструмент библиотеки:
tree-sitter parse input.mylang > ast.sexp

<-------Использование GCC компилятора----------->

Установить gcc комплиятор на свою среду

Проверить через gcc --version


Скомпилировать в исполняемый можно через:
gcc -o main main.c lib/cJSON/cJSON.c

Запустить можно через
./main input.mylang ast.sexp




