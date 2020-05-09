"use strict";
let memoryMatrix = (()=>{

    // --------------------------- view ---------------------------
    /**
     * Класс для управления отображением состояний игры
     */
    class View{
        constructor(className){ // принимает имя класса "контейнера" игры
            // "контейнер" игры
            this.gameBox = document.querySelector('.' + className);
            // кнопка "старт"
            this.startButton = this.gameBox.querySelector('.memory-box__start-button');
            // сообщение "следующий уровень"
            this.nextLevel = this.gameBox.querySelector('.memory-box__next-level');
            // сообщение game over
            this.gameOver = this.gameBox.querySelector('.memory-box__game-over');
            // информационный заголовок (tiles, trials, score)
            this.title = this.gameBox.querySelector('.memory-box__title');
            // матрица с плитками
            this.matrix = this.gameBox.querySelector('.memory-box__matrix');
            // время предварительного показа скрытых плиток в мс
            this.previewTime = 2000;

        }
        /**
         * Удаление блокировки интерфейса пользователя
         */
        removeBlockOperation(){
            if(this.gameBox.classList.contains('js-blocked-operation')){
                this.gameBox.classList.remove('js-blocked-operation');
            }
        }
        /**
         * Отобразить текущее состояние игры
         * @param {States} state текущее состояние игры
         */
        showState(state){ // отобразить состояние
            // состояния 
            switch(state.show){
                case 'init':
                    this.showInit(state);
                    break;
                case 'start':
                    this.showStart(state);
                    break;
                case 'open tile':
                    this.showOpenTile(state);
                    break;
                case 'level up':
                    this.showLevelUp(state);
                    break;
                case 'game over':
                    this.showGameOver(state);
                    break;
                case 'nothing':
                    this.removeBlockOperation();
                    // клик по уже открытым плиткам
                    break;
                case 'level one':
                    this.showLevelOne(state);
                    break;
                case 'level down':
                    this.showLevelDown(state);
                    break;

                    
                default:
                    break;

            }
        }
        /**
         * Показать начальное состояние игры
         * @param {States} state текущее состояние игры
         */
        showInit(state){ // показывает начальное состояние
            // кнопка "старт" - показать
            this.showElement(this.startButton, 'memory-box__start-button_not-active');

            // сообщение "следующий уровень" - скрыть
            this.hideElement(this.nextLevel, 'memory-box__next-level_not-active');
            
            // сообщение game over - скрыть
            this.hideElement(this.gameOver, 'memory-box__game-over_not-active');

            // информационный заголовок (tiles, trials, score) - скрыть
            this.hideElement(this.title, 'memory-box__title_not-active');

            // матрица с плитками - скрыть
            this.hideElement(this.matrix, 'memory-box__matrix_not-active');

            // удалить блокировку интерфейса
            this.removeBlockOperation();


        }
        /**
         * Состояние игры после нажатия на кнопку "start"
         * @param {States} state текущее состояние игры
         */
        showStart(state){ 
            // убрать кнопку «start»
            this.hideElement(this.startButton, 'memory-box__start-button_not-active');
            // показать основное окно игры 
            
            // заполняет заголовок игры
            this.writeTitle(state.totalTiles, state.trials, state.score);


            // показать заголовок игры
            this.showElement(this.title, 'memory-box__title_not-active');
            // убирает установленные классы у плиток матрицы
            this.clearTiles();
            // установка размеров матрицы в соответствии с текущим состоянием
            this.setMatrix(this.getMatrixSizeClass(state.rows, state.cols));
            // показать матрицу
            this.showElement(this.matrix, 'memory-box__matrix_not-active');

            let self = this;

            let timer = setTimeout(()=>{
                // через 2 секунды показать скрытые плитки 
                self.setTiles(state.tiles.getTilesArray(), {rows: state.rows, cols: state.cols});
                setTimeout(()=>{
                    // через 2 секунды скрыть плитки
                    self.clearTiles();
                    self.removeBlockOperation();
                }, self.previewTime);
            }, 2000);

        }
        /**
         * Состояние игры при правильном открытии плитки
         * @param {States} state текущее состояние игры
         */
        showOpenTile(state){ 
            // "координаты" плитки и размер матрицы
            let tileIndices = {row: state.action.row, col: state.action.col};
            let matrixSize = {rows: state.rows, cols: state.cols};

            // установка открытой плитки на поле
            this.setTileState(tileIndices, matrixSize, true);
            // изменить заголовок        
            this.writeTitle('', '', state.score);
            // снять блокировку интерфейса
            this.removeBlockOperation();

        }
        /**
         * Показать состояние "переход на следующий уровень"
         * @param {States} state текущее состояние игры
         */
        showLevelUp(state){ 
            // поменять значения в "шапке" игры (tiles, trials, score)
            this.writeTitle('', '', state.score-state.bonus);
            this.writeBonus(state.bonus);

            // открыть последнюю угаданную плитку
            let tileIndices = {row: state.action.row, col:state.action.col};
            let matrixSize = {rows: state.prevMatrixSize.rows, cols: state.prevMatrixSize.cols};
            this.setTileState(tileIndices, matrixSize, true);
            
            // заполнить поля сообщения о переходе на следующий уровень
            this.writeNextLevel(state.totalTiles, state.bonus);

            let self = this;
            // показать через 1 секунду сообщение перехода на следующий уровень
            setTimeout(() => {
                //показать бонус
                self.showBonus();
                // показать "level up"
                let bonusFild = self.nextLevel.querySelector('.memory-box__next-level-points');
                // открыть поле с бонусами в "level up" сообщении
                self.showElement(bonusFild, 'memory-box__next-level-points_not-active');
                // показать "level up" сообщение
                self.showElement(self.nextLevel, 'memory-box__next-level_not-active');
                // убрать поле с плитками
                self.hideElement(self.matrix, 'memory-box__matrix_not-active');
                // убрать сообщение через 2 секунды и вывести новое поле и шапку
                setTimeout(() => {
                    // обновить матрицу
                    self.clearTiles(); // спрятать все плитки
                    self.setMatrix(self.getMatrixSizeClass(state.rows, state.cols)); 
                    // обновить шапку
                    self.writeTitle(state.totalTiles, state.trials, state.score);

                    // убрать сообщение
                    self.hideElement(self.nextLevel, 'memory-box__next-level_not-active');
                    // убрать бонус
                    self.hideBonus();
                    // показать поле с плитками
                    self.showElement(self.matrix, 'memory-box__matrix_not-active');

                    // показать скрытые плитки через 1 секунду
                    setTimeout(() => {
                        let matrixSize = {rows: state.rows, cols: state.cols};
                        self.setTiles(state.tiles.tilesArray, matrixSize);
                        // спрятать плитки через 2 секунды, снять блокировку
                        setTimeout(() => {
                            self.clearTiles();
                            self.removeBlockOperation();
                        }, self.previewTime);
                    }, 1000);
                }, 2000);
            }, 1000);

        }
        /**
         * Показать "окончание игры"
         * @param {States} state текущее состояние игры
         */
        showGameOver(state){ 
            // обновление заголовка
            this.writeTitle(state.totalTiles, state.trials, state.score - state.bonus);
            if(state.bonus != 0){
                this.writeBonus(state.bonus);
            }
            
            let tileIndices = {row: state.action.row, col: state.action.col};
            let matrixSize = {rows: state.rows, cols: state.cols};
            // флаг "угадана ли последняя плитка"
            let isTile = (state.openTiles == state.totalTiles);

            let self = this;

            // заполнить поля сообщения game over
            this.writeGameOver(state.score, state.maxLevel);

            // показать плитку
            this.setTileState(tileIndices, matrixSize, isTile);

            // открыть все плитки (пост-показ)
            setTimeout(()=>{
                let matrixSize = {rows: state.rows, cols: state.cols};
                
                if(state.bonus != 0){
                    self.showBonus();
                }

                self.setTiles( state.tiles.getTilesArray(), matrixSize);

                // показать сообщение game over
                setTimeout(() => {
                    // варианты сообщений при окончании игры
                    let endMessage = self.gameOver.querySelector('.memory-box__game-over-end');
                    let upMessage = self.gameOver.querySelector('.memory-box__game-over-up');
                    // обновить "заголовок" игры
                    self.writeTitle('', '', state.score);
                    self.hideBonus();
                    // Выбрать нужный вариант сообщения
                    if(state.maxLevel == 15){ // пройдены все уровни
                        self.hideElement(upMessage, 'memory-box__game-over-up_not-active');
                        self.showElement(endMessage, 'memory-box__game-over-end_not-active');
                    } else { // пройдены не все уровни
                        self.hideElement(endMessage, 'memory-box__game-over-end_not-active');
                        self.showElement(upMessage, 'memory-box__game-over-up_not-active');
                    }

                    // убрать поле с плитками
                    self.hideElement(self.matrix, 'memory-box__matrix_not-active');

                    self.showElement(self.gameOver, 'memory-box__game-over_not-active');
                    self.removeBlockOperation();
                }, 2000);
            }, 700);
        }
        /**
         * Переход на нулевой уровень
         * @param {States} state текущее состояние игры
         */
        showLevelOne(state){ 
            
            // помечается ошибочная плитка на поле
            let tileIndices = {row: state.action.row, col: state.action.col};
            let matrixSize = {rows: state.rows, cols: state.cols};
            this.setTileState(tileIndices, matrixSize, false);
            // подготовить сообщение next-level
            this.writeNextLevel(state.totalTiles);

            let self = this;
            // открыть оставшиеся плитки (пост-показ)
            setTimeout(() => {
                self.setTiles(state.prevTilesArray, matrixSize);

                // показать сообщение next-level
                setTimeout(() => {
                    self.showElement(self.nextLevel, 'memory-box__next-level_not-active');

                    // убрать поле с плитками
                    self.hideElement(self.matrix, 'memory-box__matrix_not-active');

                    // скрыть сообщение next-level и показать игровое поле
                    setTimeout(() => {
                        
                        self.hideElement(self.nextLevel, 'memory-box__next-level_not-active');

                        // изменить значения полей score, trials, tiles в "шапке"
                        this.writeTitle(state.totalTiles, state.trials, state.score);
                        
                        self.clearTiles();
                        self.setMatrix(self.getMatrixSizeClass(state.rows, state.cols));

                        // показать поле с плитками
                        self.showElement(self.matrix, 'memory-box__matrix_not-active');

                        // показать плитки
                        setTimeout(() => {
                            // показывает новый набор плиток
                            self.setTiles(state.tiles.getTilesArray(), matrixSize);

                            // спрятать плитки
                            setTimeout(() => {
                                self.clearTiles();
                                self.removeBlockOperation();
                            }, self.previewTime);
                        }, 1000);

                    }, 2000);
                }, 1500);
            }, 500);
        }
        /**
         * Переход на уровень ниже
         * @param {States} state текущее состояние игры
         */
        showLevelDown(state){ 
            // помечается ошибочная плитка на поле
            let tileIndices = {row: state.action.row, col: state.action.col};
            this.setTileState(tileIndices, state.prevMatrixSize, false);
            // подготовить сообщение next-level
            this.writeNextLevel(state.totalTiles);
            let self = this;

            // показать скрытые плитки (пост-показ)
            setTimeout(() => {
                self.setTiles(state.prevTilesArray, state.prevMatrixSize);

                // сообщение next-level
                setTimeout(() => {
                    self.showElement(self.nextLevel, 'memory-box__next-level_not-active');
                    self.clearTiles();

                    // убрать поле с плитками
                    self.hideElement(self.matrix, 'memory-box__matrix_not-active');

                    // скрыть сообщение и показать новое поле
                    setTimeout(() => {
                        // изменить значения полей score, trials, tiles в "шапке"
                        this.writeTitle(state.totalTiles, state.trials, state.score);

                        self.hideElement(self.nextLevel, 'memory-box__next-level_not-active');
                        self.setMatrix(self.getMatrixSizeClass(state.rows, state.cols)); 
                        
                        // показать поле с плитками
                        self.showElement(self.matrix, 'memory-box__matrix_not-active');

                        // показать плитки (предпоказ)
                        setTimeout(() => { 
                            let matrixSize = {rows: state.rows, cols: state.cols};
                            self.setTiles(state.tiles.getTilesArray(), matrixSize);

                            // скрыть поля с плитками
                            setTimeout(() => {
                                self.clearTiles();
                                self.removeBlockOperation();

                            }, self.previewTime);

                        }, 1000);

                    }, 2000);
                }, 1500);
            }, 500);

        }
        /**
         * Показать начисленные бонусы
         */
        showBonus(){
            let bonusBlock = this.title.querySelector('.memory-box__score-val-bonus');
            this.showElement(bonusBlock, 'memory-box__score-val-bonus_not-active');
        }
        /**
         * Скрыть всплывающее сообщение с бонусами
         */
        hideBonus(){
            let bonusBlock = this.title.querySelector('.memory-box__score-val-bonus');
            this.hideElement(bonusBlock, 'memory-box__score-val-bonus_not-active');
        }
        
        /**
         * Получить наименование css класса для матрицы
         * @param {Number} rows количество строк матрицы
         * @param {Number} cols количество колонок матрицы
         * @returns {String} строка с css классом матрицы
         */
        getMatrixSizeClass(rows, cols){
            return 'memory-box__matrix_' + rows + 'x' + cols;
        }
        /**
         * Скрыть HTML элемент
         * @param {HTMLElement} el html элемент
         * @param {String} hideClass css класс, скрывающий элемент
         */
        hideElement(el, hideClass){ // скрыть элемент
            if(!el.classList.contains(hideClass))
                el.classList.add(hideClass);
        }
        /**
         * Показать HTML элемент
         * @param {HTMLElement} el html элемент
         * @param {String} hideClass css класс, скрывающий элемент
         */
        showElement(el, hideClass){ // показать элемент

            if(el.classList.contains(hideClass)){
                el.classList.remove(hideClass);
            }
        }
        /**
         * Записывает бонусы в html элемент с бонусами
         * @param {Number} bonus количество бонустных баллов
         */
        writeBonus(bonus){
            let bonusBlock = this.title.querySelector('.memory-box__score-val-bonus');
            if(bonus !== ''){
                bonusBlock.innerHTML = '+' + bonus;
            }
        }
        /**
         * 
         * @param {String} tiles количество показываемых плиток на уровне
         * @param {String} trials оставшееся количество попыток
         * @param {String} score текущий счет
         */
        writeTitle(tiles, trials, score){ // отобразить текущие результаты

            // поле "количество плиток"
            let tilesField = this.title.querySelector('.memory-box__tiles-val');
            // поле "количество попыток"
            let trialsField = this.title.querySelector('.memory-box__trials-val');
            // поле "количество очков"
            let scoreField = this.title.querySelector('.memory-box__score-val-score');
            
            if(tiles !== ''){
                tilesField.innerHTML = tiles;
            }
            if(trials !== ''){
                trialsField.innerHTML = trials;
            }
            if(score !== ''){
                scoreField.innerHTML = score;
            }
        }
        /**
         * Запись сообщения "game over"
         * @param {Number} score количество набранных очков
         * @param {Number} maxLevel максимальный уровень
         */
        writeGameOver(score, maxLevel){ // заполнить сообщение "game over"
            let scoreField = this.gameOver.querySelector('.memory-box__total-score');
            let maxLevelField = this.gameOver.querySelector('.memory-box__max-level');

            scoreField.innerHTML = score;
            maxLevelField.innerHTML = maxLevel;

        }
        /**
         * Запись сообщения "следующий уровень"
         * @param {String} nextTiles количество плиток на следующем уровне
         * @param {String} bonus количество бонусов за прохождение уровня
         */
        writeNextLevel(nextTiles, bonus = ''){ // заполнить сообщение "next level"
            let bonusField = this.nextLevel.querySelector('.memory-box__points-cnt');
            let tilesField = this.nextLevel.querySelector('.memory-box__tiles-cnt');
            let bonusRow = this.nextLevel.querySelector('.memory-box__next-level-points');
            if(bonus == ''){
                this.hideElement(bonusRow, 'memory-box__next-level-points_not-active');
            } else {
                this.showElement(bonusRow, 'memory-box__next-level-points_not-active');
                bonusField.innerHTML = bonus;
            }
            tilesField.innerHTML = nextTiles;
        }
        /**
         * Устанавливает размер матрицы
         * @param {String} setClass css класс с размером матрицы
         */
        setMatrix(setClass){ 
            // удалить установленный класс memory-box__matrix_3x3 или аналогичный
            let classList = this.matrix.classList;
            
            for(let i = 0; i < classList.length; i++){
                if((classList[i]).indexOf('memory-box__matrix_') != -1){
                    classList.remove(classList[i]);
                }            
            }

            classList.add(setClass);
        }
        /**
         * "Открыть" плитку
         * @param {Object} tileIndices "координаты" плитки {row:r, col:c} где r,c - строка и колонка с плиткой
         * @param {Object} matrixSize размер матрицы {rows:r, cols:c} где r,c - количество строк и колонок в матрице
         * @param {Boolean} exist true - плитка есть, false - плитки нет
         */
        setTileState(tileIndices, matrixSize, exist){ 
            // индекс искомой плитки
            let idx = tileIndices.row * matrixSize.cols + tileIndices.col;
            // плитки матрицы
            let tilesCells = this.matrix.querySelectorAll('.memory-box__matrix-cell');

            tilesCells[idx].classList.remove('memory-box__matrix-cell_no-tile');
            tilesCells[idx].classList.remove('memory-box__matrix-cell_tile');
            
            if(exist){
                tilesCells[idx].classList.add('memory-box__matrix-cell_tile');
            } else {
                tilesCells[idx].classList.add('memory-box__matrix-cell_no-tile');
            }
        }
        /**
         * Расстановка плиток для их предварительного или заключительного показа
         * @param {Array} tilesArray массив "плиток" с их состоянием [{state:'close'|'open', r:row, c:col}]
         * @param {Object} matrixSize размер матрицы {rows:r, cols:c} где r,c - количество строк и колонок в матрице
         */
        setTiles(tilesArray, matrixSize){ 
            let tilesCells = this.matrix.querySelectorAll('.memory-box__matrix-cell');
            for(let i in tilesArray){
                // определение "линейного" индекса по "координатам"
                let idx = tilesArray[i].r * matrixSize.cols + tilesArray[i].c;
                
                if( !tilesCells[idx].classList.contains('memory-box__matrix-cell_tile')   && 
                    !tilesCells[idx].classList.contains('memory-box__matrix-cell_no-tile') ) 
                    {
                        tilesCells[idx].classList.add('memory-box__matrix-cell_tile');
                    }
            }    
        }
        /**
         * Удаляет все установленные классы плиток в матрице ("закрывает" все плитки)
         */
        clearTiles(){ 
            let tilesCells = this.matrix.querySelectorAll('.memory-box__matrix-cell');
            for(let i = 0; i < tilesCells.length; i++){
                tilesCells[i].classList.remove('memory-box__matrix-cell_tile');
                tilesCells[i].classList.remove('memory-box__matrix-cell_no-tile');
            }
        }

    }

    // --------------------------- Model ---------------------------

    /**
     * Класс для управления и хранения состояниями плиток
     */
    class Tiles{
        // конструктор создает tilesCnt плиток для матрицы n x m
        constructor(tilesCnt = 3, rows = 3, cols = 3){ 

            // обработка ошибок введенных данных
            this.validate(arguments);

            this.total = tilesCnt; // количество плиток
            this.tilesArray = this.createTiles(tilesCnt, rows, cols);
        }
        /**
         * Получить массив плиток {state:'close'|'open', r: row, c: col};
         * где r - строка с плиткой c - колонка с плиткой
         * state - состояние плитки ('close' - закрыта, 'open' - открыта)
         */
        getTilesArray(){
            return this.tilesArray;
        }
        /**
         * Создает массив плиток со случайными "координатами"
         * @param {Number} tilesCnt количество плиток
         * @param {Number} n количество строк матрицы
         * @param {Number} m количество колонок матрицы
         * @returns {Array} массив плиток [{state:'close'|'open', r: row, c: col}]
         */
        createTiles(tilesCnt, n, m){ // создает tilesCnt плиток для матрицы n x m
            let tiles = []; // массив плиток
            // генератор случайных чисел от 0 до max, не включая max
            let rnd = ( (max) => { return Math.floor( Math.random() * max ); }  );

            this.validate(arguments);
            
            createTile: for(let i = 0; i < tilesCnt; i++){
                let tile = {state:'close', r: rnd(n), c: rnd(m)}; // новая плитка
                for(let arrTile of tiles){
                    if(this.isEqualTiles(arrTile,tile)){
                        i--;
                        continue createTile;
                    }
                }
                tiles.push(tile);
            }

            return tiles;
        }
        /**
         * Сравнение плиток
         * @param {Object} tile1 плитка {state:'close'|'open', r: row, c: col}
         * @param {Object} tile2 плитка {state:'close'|'open', r: row, c: col}
         * @returns {Boolean} true - если "координаты" плиток совпадают, false - в противном случае
         */
        isEqualTiles(tile1, tile2){ // сравнение плиток
            if(tile1.r == tile2.r && tile1.c == tile2.c)
                return true;
            return false;
        }
        /**
         * Проверка аргументов на допустимость
         * @param {Arrray} args массив аргументов
         */
        validate(args){ // проверка допустимости аргументов
            for(let i in args){
                if( !Number.isInteger(args[i]) || args[i]<0 ){
                    throw(new Error('Параметры должны быть неотрицательными целыми числами'));
                }
            }
        }
        /**
         * Возвращает плитку по указанным координатам
         * @param {Number} r строка с плиткой
         * @param {Number} c колонка с плиткой
         * @returns {Object} возвращяет плитку {state:'close'|'open', r: row, c: col} или null, если плитки нет
         */
        _getTile(r, c){ // возвращает плитку с координатами r,c или null, если плитки нет 
            for(let tile of this.tilesArray){
                if(tile.r == r && tile.c == c){
                    return tile;
                }
            }
            return null;
        }
        /**
         * Получить состояние плитки
         * @param {Number} r строка матрицы
         * @param {Number} c колонка матрицы
         * @returns {String} состояние плитки ('close'|'open') или пустая строка, если плитки нет
         */
        getTileState(r, c){
            this.validate(arguments);
            let tile = this._getTile(r, c);
            if(tile !== null){
                return tile.state;
            }
            return '';
        }
        /**
         * Изменить состояние плитки с 'close' на 'open'
         * @param {Number} r строка матрицы
         * @param {Number} c колонка матрицы
         * @returns {String} сообщение о изменении состояния 'open' или пустая строка, если плитки нет
         */
        changeTileState(r, c){
            this.validate(arguments);
            let tile = this._getTile(r, c);
            if(tile !== null){
                if(tile.state == 'close'){
                    tile.state = 'open';
                }
                return tile.state;
            }
            return '';
        }
        /**
         * Создает набор плиток для данного размера матрицы
         * @param {Number} tilesCnt количество плиток
         * @param {Number} rows количество строк матрицы
         * @param {Number} cols количество колонок матрицы
         */
        updateTiles(tilesCnt, rows, cols){ 
            this.validate(arguments);

            this.tilesArray = this.createTiles(tilesCnt, rows, cols);
            this.total = this.tilesArray.length;
        }
    }


    /**
     * Класс для хранения состояний игры
     */
    class States{ 
        constructor(){ // количество строк матрицы = 3, количество колонок матрицы = 3
            this.init(3, 3);
            this.tiles = new Tiles();
        }
        init(n, m){ // инициализация
            this.rows = n; // размер матрицы, количество строк
            this.cols = m; // размер матрицы, количесвто колонок
            this.totalTiles = 3; // количество плиток
            this.level = 0; // уровень
            this.bonus = 5 * this.level; // количество бонусных баллов

            this.trials = 15; // количество попыток
            this.score = 0; // количество очков
            this.openTiles = 0; // количество открытых плиток
            this.maxLevel = this.level; // максимальный достигнутый уровень
            this.show = 'start'; // текущий ответ для view
            this.action = null; // последнее выполненное действие
            this.prevMatrixSize = null; // размер матрицы для предыдущего состояния {rows: r, cols: c}
            this.prevTilesArray = null; // массив плиток для предыдущего состояния
        }

        reset(){ // возвращение к начальному состоянию
            this.init(3, 3);
            this.tiles.updateTiles(this.totalTiles, this.rows, this.cols);

        }

    }

    /**
     * Создает хранилище состояний
     * @param {Function} reducer функция переходов
     * @param {Object} initialState начальное состояние
     */
    function createStore(reducer, initialState){ // хранилище состояний
        let state = initialState;
        return {
            dispatch: (action) => { state = reducer(state, action); },
            getState: () => state,
        }
    }

    /**
     * Изменяет состояния игры в соответствии с действиями пользователя
     * @param {States} state состояние
     * @param {Object} action действия пользователя {name:'start'|'click'|'new game', row: rowIndex, col: colIndex, index: linearIndex}
     */
    function game(state, action){ 

        state.action = action;

        // преобразование action.index в action.row и action.col
        if(action.row < 0 || action.col < 0){
            state.action.row = Math.floor(state.action.index / state.cols);
            state.action.col = state.action.index % state.cols;
        }

        switch(action.name){
            case 'start':
                state.reset();
                state.show = 'start'; // текущий ответ для view
                
                return state;
            
            case 'click':
                let difScore = 10;
                let difBonus = 5;
                
                if(state.trials != 0){ // игра не окончена, количество попыток не 0

                    let tileState = state.tiles.getTileState(action.row, action.col); // состояние плитки

                    if(tileState != ''){ // есть такая плитка
                        if(tileState == 'close'){ // плитка закрыта
                            state.score += difScore; // прибавление очков за плитку
                            state.openTiles++; // увеличивает счетчик открытых плиток
                            state.show = 'open tile'; // ответ для view
                            
                            state.tiles.changeTileState(action.row, action.col); // изменить состояние плитки
            
                            if(state.openTiles == state.totalTiles){ // уровень пройден (открыты все плитки)
                                
                                state.trials--; // уменьшает попытки
                                state.level++; // новый уровень
                                state.maxLevel = Math.max(state.maxLevel, state.level); // максимальный уровень
                                state.bonus = difBonus * state.level; // бонус
                                state.score += state.bonus; // очки        

                                if(state.trials <= 0 ){ // игра закончена
                                    state.show = 'game over'; // ответ для view
                                    state.trials = 0; // количество попыток 0
                                } else {
                                    state.openTiles = 0; // обнуляет количество открытых плиток для нового уровня
                                    state.totalTiles++; // новое количество скрытых плиток

                                    // сохранить размер матрицы
                                    state.prevMatrixSize = {rows: state.rows, cols: state.cols};
                                    (state.rows == state.cols) ? (state.cols++): (state.rows++); // изменение размеров матрицы
                                    
                                    // сохранить массив плиток
                                    state.prevTilesArray = state.tiles.getTilesArray();
                                    // обновить массив плиток
                                    state.tiles.updateTiles(state.totalTiles, state.rows, state.cols); // обновление плиток
                                    state.show = 'level up'; // ответ для view
                                }
                            }
            
                        } else { // плитка уже открыта
                            state.show = 'nothing';
                        }
                    } else { // такой плитки нет
                        
                        state.trials--; // попытки
                        // state.openTiles = 0; // открыто плиток
                        state.bonus = 0;
                        
                        if(state.trials == 0){ // окончание игры,

                            state.show = 'game over';
            
                        } else {
                            state.openTiles = 0; // открыто плиток

                            if(state.level == 0){ // если это первый уровень
                                // сохранить массив плиток
                                state.prevTilesArray = state.tiles.getTilesArray();
                                // обновить набор плиток
                                state.tiles.updateTiles(state.totalTiles, state.rows, state.cols); 
                                state.show = 'level one'; // сообщение для view
        
                            } else {
                
                                state.level--; // уровень
                                state.totalTiles--; // количество плиток на уровне
                                
                                // сохранить размер матрицы 
                                state.prevMatrixSize = {rows: state.rows, cols: state.cols};
                                (state.rows == state.cols) ? (state.rows--): (state.cols--); // изменение размеров матрицы
                                // сохранить массив плиток
                                state.prevTilesArray = state.tiles.getTilesArray();
                                // обновить массив плиток
                                state.tiles.updateTiles(state.totalTiles, state.rows, state.cols); // обновление плиток
                
                                state.show = 'level down';// сообщение для view
                            }
                        }
                    }
                }
                return state;
            
            case 'new game': // нажатие на кнопку "Wake up, Neo"
                state.reset();
                state.show = 'init'; // текущий ответ для view        

                return state;
            
            default:
                throw(new Error('Неизвестное действие'));
        }
    }

    /**
     * Класс для создания модели игры
     */
    class Model{
        constructor(gameClass){
            this.init();
            this.view = new View(gameClass);
        }
        init(){
            let initState = new States();
            this.store = createStore(game, initState);
        }
        /**
         * Выполниет действия пользователя 
         * @param {Object} action действия пользователя {name:'start'|'click'|'new game', row: rowIndex, col: colIndex, index: linearIndex}
         */
        execute(action){
            // переход в новое состояние игры
            this.store.dispatch(action);
            // вызов отображения нового состояния
            this.view.showState(this.store.getState());
        }
    }

    // --------------------------- controller ---------------------------
    /**
     * Класс для обработки действий пользователя
     */
    class Control{
        constructor(gameClass){ // gameClass - css класс основного блока с интерфейсом игры
            this.box = document.querySelector('.' + gameClass);
            this.createHandlers();
            this.box.addEventListener('click', this.startHandler);
            this.box.addEventListener('click', this.restartHandler);
            this.box.addEventListener('click', this.clickTileHandler);
            this.gameModel = new Model(gameClass);
            
        }
        /**
         * Запуск игры
         */
        start(){
            this.gameModel.execute({name: 'new game', row:-1,col:-1});
        }
        /**
         * Установка css класса, "блокирующего" интерфейс
         */
        setBlockOperation(){
            if(!this.box.classList.contains('js-blocked-operation')){
                this.box.classList.add('js-blocked-operation');
            }
        }
        /**
         * Проверка на "блокировку" интерфеса
         * @returns {Boolean} true - интерфейс заблокирован, false - интерфейс открыт для использования
         */
        isBlocked(){
            return this.box.classList.contains('js-blocked-operation');
        }
        /**
         * Создание обработчиков событий интерфейса пользователя
         */
        createHandlers(){
            let self = this;

            /**
             * Восходящий поиск по DOM дереву элемента с классом targetClass
             * @param {HTMLElement} childEl "стартовый" элемент
             * @param {String} targetClass css класс целефого элемента
             * @returns {HTMLElement} целевой элемент или null, если элемента нет
             */
            let getTarget = (childEl, targetClass) => {
                let isTarget = false;
                let target = childEl;
                // 
                while(target != self.box){
                    if(target.classList.contains(targetClass)){
                        isTarget = true;
                        break;
                    }
                    target = target.parentElement;
                }

                if(isTarget){
                    return target;
                }
                return null;    
            };
            /**
             * Возвращает индекс элемента в HTMLCollection своего "родителя"
             * @param {HTMLElement} childe элемент HTMLCollection родительского элемента parent
             * @param {HTMLElement} parent родительский элемент
             * @returns {Number} индекс элемента в HTMLCollection его "родителя"
             */
            let getIndexOfChilde = (childe, parent) => {
                return [].indexOf.call(parent.children, childe);
            };

            /**
             * Обработчик 'click' по кнопке "start"
             * @param {Event} event событие
             */
            this.startHandler = function(event){ 
                    let target = event.target;
                    let startButton =  getTarget(target, 'memory-box__start-button');

                    if(startButton !== null){
                        self.setBlockOperation();
                        self.gameModel.execute({name: 'start', row:-1,col:-1});
                    }
            } 
            /**
             * Обработчик 'click' по кнопке "game over"
             * @param {Event} event событие
             */
            this.restartHandler = function(event){ 
                let target = event.target;
                let restartButton = getTarget(target, 'memory-box__restart-button');

                if(restartButton !== null){
                    self.setBlockOperation();
                    self.gameModel.execute({name: 'new game', row:-1, col:-1, index:0});
                }
            }
            /**
             * Обработчик 'click' по плитке матрицы
             * @param {Event} event событие
             */
            this.clickTileHandler = function(event){ 
                let target = event.target;
                
                // ячейка матрицы в которой может быть плитка
                let tileCell = getTarget(target, 'memory-box__matrix-cell');
                // матрица
                let tileMatrix = getTarget(target, 'memory-box__matrix');
                // индекс ячейки
                let tileCellIndex = -1;
                
                if(tileCell !== null && tileMatrix !== null && !self.isBlocked()){
                    self.setBlockOperation();    
                    tileCellIndex = getIndexOfChilde(tileCell, tileMatrix);

                    self.gameModel.execute({name: 'click', row:-1, col:-1, index: tileCellIndex});
                }
            } // end of clickTileHandler
        } // end of createHandlers
    }
// ---------------------------------------------------
    /**
     * Инициализация фона
     * @param {Number} maxWidth максимально допустимая ширина контейнера игры
     * @param {Number} maxHeight максимально допустимая высота контейнера игры
     * @param {HTMLElement} gameBox основной блок с интерфейсом игры
     */
    function initBackground(maxWidth, maxHeight, gameBox){
        // код для отрисовки фона был успешно натырин с просторов интернета и слегка допилин под свои нужды
        // источник: https://pastebin.com/3WyJD8Tc
        let maxW = maxWidth + 'px';
        let maxH = maxHeight + 'px';
        
        function setBackground(){
            //.memory-box__canvas
            let cnv = gameBox.querySelector('.memory-box__canvas');
            let ctx = cnv.getContext("2d");

            // размеры canvas определяем по контейнеру
            cnv.width = Number.parseFloat(gameBox.clientWidth);
            cnv.height = Number.parseFloat(gameBox.clientHeight);

            // китайские символы
            let chinese = "田由甲申甴电甶男甸甹町画甼甽甾甿畀畁畂畃畄畅畆畇畈畉畊畋界畍畎畏畐畑";
            //массив китайских символов
            chinese = chinese.split("");

            let font_size = 10;
            let columns = cnv.width/font_size; //количество колонок для организации потоков символов
            // массив "y" координат для отображения символов  (x == колонки, y == строки)
            let drops = [];
            // количество элементов массива соответствует числу колонок 
            // инициализация массива "y" координат для отображения символов (начальное значение y координат ==1)
            for(let x = 0; x < columns; x++)
                drops[x] = 1; 

            // нарисовать строку китайских символов
            function draw(){
                // черный полупрозрачный фон для холста, чтобы показать след
                ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
                ctx.fillRect(0, 0, cnv.width, cnv.height);
                
                // цвет текста
                ctx.fillStyle = "#1eed3d";
                ctx.font = font_size + "px arial";
                // рисует строку с китайскими символами
                // координату y (номер строки) берет из массива drops
                // координата x (колонка) == i
                for(let i = 0; i < drops.length; i++){
                    // случайный символ из набора символов
                    let text = chinese[Math.floor(Math.random()*chinese.length)];
                    //x = i*font_size, y = drops[i]*font_size
                    // "x" - колонка, "y" - строка 
                    ctx.fillText(text, i*font_size, drops[i]*font_size);
                    
                    // случайное обнуление "y" координаты после заполнения всей области просмотра
                    // каждый вызов функции draw увеличивает значение "у" координат внутри drops
                    if(drops[i]*font_size > cnv.height && Math.random() > 0.975)
                        drops[i] = 0;
                    
                    // инкремент "y" координаты
                    drops[i]++;
                }
            } // end of draw
            
            //Двойное заполнение экрана
            let boxHeight = Math.floor(cnv.height/font_size);
            for(let i = 0; i < 2*boxHeight; i++){
                draw();
            }

        } // end of initBackground

        // инициализирует фоновую картинку для максимально допустимого разрешения
        requestAnimationFrame(function(){
            gameBox.style.visibility = 'hidden';
            gameBox.style.width = maxW;
            gameBox.style.height = maxH;
            // блокирует интерфейс до полной отрисовки фона
            if(!gameBox.classList.contains('js-blocked-operation')){
                gameBox.classList.add('js-blocked-operation');
            }
            requestAnimationFrame(function(){
                setBackground();
                requestAnimationFrame(function(){
                    gameBox.style.width = '';
                    gameBox.style.height = '';
                    gameBox.style.visibility = '';
                    // снимает блокировку интерфейса
                    gameBox.classList.remove('js-blocked-operation');
                    gameBox.classList.remove('memory-box_loading');
                });
            });

        });
    } //end of initBackground

    return {
        init: function(gameClassName){ 
            this.game = new Control(gameClassName); 
            
            let style = window.getComputedStyle(this.game.box);
            let maxWidth = Number.parseFloat(style.maxWidth);
            let maxHeight = Number.parseFloat(style.maxHeight);

            maxWidth = isNaN(maxWidth) ? 660: maxWidth;
            maxHeight = isNaN(maxHeight) ? 720: maxHeight;

            initBackground(maxWidth, maxHeight, this.game.box);
        }
    };

})();

memoryMatrix.init('memory-box');
memoryMatrix.game.start();


