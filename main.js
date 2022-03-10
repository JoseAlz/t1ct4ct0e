const GameBoard = (() => {
  let gameBoard = Array(9);

  const init = () => {
    for (let i = 0; i < gameBoard.length; i++) {
      gameBoard[i] = 0;
    }
  };

  const updateBoard = (square, symbol) => {
    let pos = square.classList.value.slice(-1);
    if (gameBoard[pos] === 0) gameBoard[pos] = symbol;
    else return false;

    square.textContent = symbol;
    return true;
  };

  const getBoard = () => gameBoard;

  return {
    init,
    updateBoard,
    getBoard,
  };
})();

const player = (name, symbol) => {
  let _symbol = symbol;
  let _isActive = false;
  let _name = name;

  const $player = document.querySelector(`.player-${symbol}`);

  const getSymbol = () => _symbol;
  const getActive = () => _isActive;
  const getName = () => _name;
  const toggleActive = () => {
    _isActive ? setActive(false) : setActive(true);
  };

  const setActive = (active) => {
    _isActive = active;
    _isActive
      ? $player.classList.add("active")
      : $player.classList.remove("active");
  };

  const setWinner = () => {
    $player.classList.add("winner");
    $player.firstElementChild.textContent = "Winner";
  };

  const setDraw = () => {
    $player.classList.add("draw");
    $player.classList.remove("active");
    console.log($player.firstElementChild);
    $player.firstElementChild.textContent = "Draw";
  };

  const reset = () => {
    if ($player.classList.contains("winner")) {
      $player.classList.remove("winner");
    }
    if ($player.classList.contains("draw")) {
      $player.classList.remove("draw");
    }
    $player.firstElementChild.textContent = "";
  };

  return {
    getSymbol,
    getActive,
    getName,
    toggleActive,
    setActive,
    setWinner,
    setDraw,
    reset,
  };
};

const AIplayer = (() => {
  const move = () => {
    const $squares = document.querySelectorAll(".board div");
    const gameBoard = GameBoard.getBoard();
    const randoms = [];
    for (let i = 0; i < gameBoard.length; i++) {
      if (!gameBoard[i]) randoms.push(i);
    }

    const index = randoms[Math.floor(Math.random() * randoms.length)];
    console.log(index);

    setTimeout(() => {
      $squares.forEach((square) => {
        if (square.classList.contains(`index-${index}`)) {
          GameController.playTurn.bind(square)();
        }
      });
    }, Math.random() * 800 + 400);
  };

  return {
    move,
  };
})();

const GameController = (() => {
  const gridSize = 3;
  const player1 = player("Usuario", "X");
  const player2 = player("Bot", "O");

  const init = () => {
    player1.setActive(Math.random() > 0.5);
    player2.setActive(!player1.getActive());

    const activePLayer = player1.getActive() ? player1 : player2;

    GameBoard.init();
    DisplayController.renderModal(activePLayer.getName());
    DisplayController.renderGameBoard(gridSize);
    DisplayController.init();

    if (player2.getActive()) {
      AIplayer.move();
      DisplayController.disableClick();
    } else DisplayController.enableClick();
  };

  function playTurn() {
    const activePLayer = player1.getActive() ? player1 : player2;
    if (!GameBoard.updateBoard(this, activePLayer.getSymbol())) return;
    this.classList.add("active");
    if (checkWin()) return;

    player1.toggleActive();
    player2.toggleActive();

    if (player2.getActive()) {
      AIplayer.move();
      DisplayController.disableClick();
    } else DisplayController.enableClick();
  }

  const checkWin = () => {
    const gameBoard = GameBoard.getBoard();

    //Check rows
    let i = 0;
    while (i < gridSize * gridSize) {
      if (
        gameBoard[i + 1] == gameBoard[i] &&
        gameBoard[i + 2] == gameBoard[i + 1] &&
        gameBoard[i]
      ) {
        endGame(false, [i, i + 1, i + 2]);
        return true;
      }
      i += 3;
    }

    //Check cols
    i = 0;
    while (i < gridSize * gridSize) {
      if (
        gameBoard[i + 3] == gameBoard[i] &&
        gameBoard[i + 6] == gameBoard[i + 3] &&
        gameBoard[i]
      ) {
        endGame(false, [i, i + 3, i + 6]);
        return true;
      }
      i++;
    }

    //Check diag
    if (
      gameBoard[0] == gameBoard[4] &&
      gameBoard[4] == gameBoard[8] &&
      gameBoard[0]
    ) {
      endGame(false, [0, 4, 8]);
      return true;
    }

    //Check anti-diag
    else if (
      gameBoard[2] == gameBoard[4] &&
      gameBoard[4] == gameBoard[6] &&
      gameBoard[2]
    ) {
      endGame(false, [2, 4, 6]);
      return true;
    }

    //Check draw
    for (let i = 0; i < gameBoard.length; i++) {
      if (gameBoard[i] === 0) return false;
    }
    endGame(true, []);
    return false;
  };

  const endGame = (isDraw, winArray) => {
    const activePLayer = player1.getActive() ? player1 : player2;
    if (!isDraw) activePLayer.setWinner();
    else {
      activePLayer.setActive(false);
      player1.setDraw();
      player2.setDraw();
    }
    DisplayController.endGame(winArray);
  };

  const restartGame = () => {
    player1.reset();
    player2.reset();
    init();
  };

  return {
    playTurn,
    restartGame,
  };
})();

const DisplayController = (() => {
  const $board = document.querySelector(".board");
  const $modal = document.querySelector(".modal");
  const $restartBtn = document.querySelector(".restart.btn");

  const init = () => {
    const $squares = document.querySelectorAll(".board div");
    $squares.forEach((square) =>
      square.addEventListener("click", GameController.playTurn)
    );

    $restartBtn.addEventListener("click", GameController.restartGame);
  };

  const renderModal = (playerName) => {
    $modal.firstElementChild.firstElementChild.textContent = playerName;
    $modal.classList.add("active");
    setTimeout(() => {
      $modal.classList.remove("active");
    }, 1500);
  };

  const renderGameBoard = (gridSize) => {
    $board.innerHTML = "";
    for (let i = 0; i < gridSize * gridSize; i++) {
      const $div = document.createElement("div");
      $div.classList.add(`index-${i}`);
      $board.appendChild($div);
    }
  };

  const enableClick = () => {
    const $squares = $board.childNodes;
    $squares.forEach((square) =>
      square.addEventListener("click", GameController.playTurn)
    );
  };

  const disableClick = () => {
    const $squares = $board.childNodes;

    for (let i = 0; i < $squares.length; i++) {
      $squares[i].removeEventListener("click", GameController.playTurn);
    }
  };

  const endGame = (winArray) => {
    const $squares = $board.childNodes;

    for (let i = 0; i < $squares.length; i++) {
      $squares[i].removeEventListener("click", GameController.playTurn);
      if (winArray.includes(i)) $squares[i].classList.add("win");
    }
  };

  return {
    init,
    renderModal,
    renderGameBoard,
    enableClick,
    disableClick,
    endGame,
  };
})();

GameController.restartGame();
