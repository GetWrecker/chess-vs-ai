var board = null;
var game = new Chess();
var $status = $('#status');

// Piece weights for AI evaluation
var weights = { p: 10, n: 30, b: 30, r: 50, q: 90, k: 900 };

function evaluateBoard(board) {
    let totalEvaluation = 0;
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            totalEvaluation += getPieceValue(board[i][j], i, j);
        }
    }
    return totalEvaluation;
}

function getPieceValue(piece, x, y) {
    if (piece === null) return 0;
    const absValue = weights[piece.type];
    return piece.color === 'w' ? absValue : -absValue;
}

// Minimax Algorithm
function minimax(game, depth, isMaximizingPlayer) {
    if (depth === 0) return -evaluateBoard(game.board());

    var moves = game.moves();
    if (isMaximizingPlayer) {
        let bestEval = -9999;
        for (let move of moves) {
            game.move(move);
            bestEval = Math.max(bestEval, minimax(game, depth - 1, !isMaximizingPlayer));
            game.undo();
        }
        return bestEval;
    } else {
        let bestEval = 9999;
        for (let move of moves) {
            game.move(move);
            bestEval = Math.min(bestEval, minimax(game, depth - 1, !isMaximizingPlayer));
            game.undo();
        }
        return bestEval;
    }
}

function makeBestMove() {
    var moves = game.moves();
    if (moves.length === 0) return;

    var bestMove = null;
    var bestValue = 9999; // AI is Black (minimizing)

    for (let move of moves) {
        game.move(move);
        let boardValue = minimax(game, 2, true);
        game.undo();
        if (boardValue <= bestValue) {
            bestValue = boardValue;
            bestMove = move;
        }
    }

    game.move(bestMove);
    board.position(game.fen());
    updateStatus();
}

// Chessboard Hooks
function onDragStart(source, piece, position, orientation) {
    if (game.game_over()) return false;
    if (piece.search(/^b/) !== -1) return false;
}

function onDrop(source, target) {
    var move = game.move({
        from: source,
        to: target,
        promotion: 'q'
    });

    if (move === null) return 'snapback';

    updateStatus();
    window.setTimeout(makeBestMove, 250);
}

function onSnapEnd() {
    board.position(game.fen());
}

function updateStatus() {
    var status = '';
    var moveColor = game.turn() === 'b' ? 'Black' : 'White';

    if (game.in_checkmate()) status = 'Game over, ' + moveColor + ' is in checkmate.';
    else if (game.in_draw()) status = 'Game over, drawn position';
    else {
        status = moveColor + ' to move';
        if (game.in_check()) status += ', ' + moveColor + ' is in check';
    }
    $status.html(status);
}

var config = {
    draggable: true,
    position: 'start',
    onDragStart: onDragStart,
    onDrop: onDrop,
    onSnapEnd: onSnapEnd
};
board = ChessBoard('myBoard', config);
updateStatus();
      const engineSocket = new WebSocket('wss://ProtonnDev-engine.hf.space/rodent3-fischer');

// 1. Connection Logic
engineSocket.onopen = () => {
    console.log("Connected to Rodent III");
    // Initialize the engine
    engineSocket.send("uci");
};

// 2. Handling Engine Responses
engineSocket.onmessage = (event) => {
    const message = event.data;
    console.log("Engine says:", message);

    // Look for the "bestmove" command from the engine
    if (message.startsWith("bestmove")) {
        const move = message.split(" ")[1];
        console.log("Opponent's Move:", move);
        // Trigger your UI update function here
        // makeMoveOnBoard(move);
    }
};

// 3. Sending a Position & Requesting a Move
function askEngineForMove(fen) {
    // Tell the engine the current board state
    engineSocket.send(`position fen ${fen}`);
    
    // Tell the engine to think (e.g., for 1000ms)
    engineSocket.send("go movetime 1000");
        }
