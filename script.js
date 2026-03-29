let board, game;
let playerColor = 'white';
let engineSocket = null;

function startGame(color) {
  playerColor = color;
  game = new Chess();

  if (engineSocket) engineSocket.close();

  engineSocket = new WebSocket("wss://ProtonnDev-engine.hf.space/rodent3-fischer");

  engineSocket.onopen = () => {
    console.log("Engine connected");

    if (playerColor === 'black') {
      makeEngineMove();
    }
  };

  board = Chessboard('board', {
    draggable: true,
    position: 'start',
    orientation: playerColor,
    onDrop: onDrop
  });

  updateStatus();
}

function onDrop(source, target) {
  const move = game.move({
    from: source,
    to: target,
    promotion: 'q'
  });

  if (move === null) return 'snapback';

  updateStatus();
  setTimeout(makeEngineMove, 300);
}

function makeEngineMove() {
  if (game.game_over()) return;

  const fen = game.fen();
  engineSocket.send(fen);

  engineSocket.onmessage = (event) => {
    const move = event.data.trim();

    if (move.length < 4) return;

    game.move({
      from: move.substring(0, 2),
      to: move.substring(2, 4),
      promotion: 'q'
    });

    board.position(game.fen());
    updateStatus();
  };
}

function updateStatus() {
  let status = '';

  if (game.in_checkmate()) {
    status = 'Checkmate!';
    setTimeout(resetGame, 2000);
  } else if (game.in_draw()) {
    status = 'Draw!';
    setTimeout(resetGame, 2000);
  } else {
    status = game.turn() === 'w' ? 'White to move' : 'Black to move';
  }

  document.getElementById('status').innerText = status;
}

function offerDraw() {
  alert("Draw offered (feature placeholder).");
}

function resign() {
  alert("You resigned.");
  resetGame();
}

function resetGame() {
  game.reset();
  board.start();
  document.getElementById('status').innerText = "Game reset. Choose side.";
}
