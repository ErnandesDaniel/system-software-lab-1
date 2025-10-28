установить зависимости Node.js:
npm install

Запуск генерации грамматики:
npx tree-sitter generate

src- исходники парсера

Конвертировать файл на языке mylang в S-expression формате в файл через стандартный инструмент библиотеки:
tree-sitter parse input.mylang > ast.sexp

Установить gcc комплиятор на свою среду

Проверить через gcc --version

Скомпилировать можно через:
gcc -o main.exe main.c


Запустить можно через
./main.exe input.mylang ast.sexp




