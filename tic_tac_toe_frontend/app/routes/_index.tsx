import type { MetaFunction } from "@remix-run/node";
import { useState } from "react";

// PUBLIC_INTERFACE
export const meta: MetaFunction = () => {
  return [
    { title: "Tic-Tac-Toe: Player vs Player Online" },
    { name: "description", content: "A modern, responsive Tic-Tac-Toe player-vs-player frontend." },
  ];
};

// Styles (Tailwind utility + some palette inline for non-Tailwind colors)
const COLORS = {
  primary: "#0d47a1",
  secondary: "#1976d2",
  accent: "#ffc107",
};

type Player = "X" | "O";
type Cell = Player | "";
type Board = Cell[][];

interface Scoreboard {
  X: number;
  O: number;
  Draws: number;
}

// PUBLIC_INTERFACE
function getEmptyBoard(): Board {
  return [
    ["", "", ""],
    ["", "", ""],
    ["", "", ""],
  ];
}

// PUBLIC_INTERFACE
function checkWinner(board: Board): Player | "draw" | null {
  // Rows, columns & diagonals
  for (let i = 0; i < 3; i++) {
    // Rows
    if (board[i][0] && board[i][0] === board[i][1] && board[i][1] === board[i][2]) {
      return board[i][0] as Player;
    }
    // Columns
    if (board[0][i] && board[0][i] === board[1][i] && board[1][i] === board[2][i]) {
      return board[0][i] as Player;
    }
  }
  // Diagonals
  if (board[0][0] && board[0][0] === board[1][1] && board[1][1] === board[2][2]) {
    return board[0][0] as Player;
  }
  if (board[0][2] && board[0][2] === board[1][1] && board[1][1] === board[2][0]) {
    return board[0][2] as Player;
  }
  // Draw
  if (board.flat().every((cell) => cell !== "")) return "draw";
  return null;
}

export default function Index() {
  // State hooks
  const [board, setBoard] = useState<Board>(getEmptyBoard());
  const [currentPlayer, setCurrentPlayer] = useState<Player>("X");
  const [winner, setWinner] = useState<Player | "draw" | null>(null);
  const [scoreboard, setScoreboard] = useState<Scoreboard>({ X: 0, O: 0, Draws: 0 });
  const [moveCount, setMoveCount] = useState(0);

  // PUBLIC_INTERFACE
  function resetBoard() {
    setBoard(getEmptyBoard());
    setWinner(null);
    setCurrentPlayer((moveCount % 2 === 0) ? "X" : "O"); // Alternate who starts each game
    setMoveCount((prev) => prev + 1);
  }

  // PUBLIC_INTERFACE
  function handleCellClick(r: number, c: number) {
    if (winner || board[r][c]) return;
    const newBoard: Board = board.map((row, rowIdx) =>
      rowIdx === r ? row.map((cell, colIdx) => (colIdx === c ? currentPlayer : cell)) : row
    );
    setBoard(newBoard);

    const w = checkWinner(newBoard);
    if (w) {
      setWinner(w);
      setScoreboard((prev) => {
        if (w === "draw") return { ...prev, Draws: prev.Draws + 1 };
        return { ...prev, [w]: prev[w] + 1 };
      });
    } else {
      setCurrentPlayer(currentPlayer === "X" ? "O" : "X");
    }
  }

  // Styling for board cells
  function cellStyle(cell: Cell) {
    if (cell === "X")
      return `text-[2.6rem] font-semibold transition-colors text-[${COLORS.primary}] select-none`;
    if (cell === "O")
      return `text-[2.6rem] font-semibold transition-colors text-[${COLORS.accent}] select-none`;
    return "text-[2.6rem] font-semibold transition-colors text-gray-400";
  }

  // Styling for accent components
  const accentText = `text-[${COLORS.accent}]`;
  const primaryText = `text-[${COLORS.primary}]`;

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-white px-2 py-6">
      {/* Scoreboard */}
      <section className="mb-4 flex flex-col items-center w-full max-w-md">
        <div className="flex flex-row justify-center gap-10 mb-2">
          <div className={`${primaryText} font-bold text-xl`}>X&nbsp;
            <span className="font-normal text-md text-gray-600">({scoreboard.X})</span>
          </div>
          <div className="font-bold text-xl text-gray-700">Draws&nbsp;
            <span className="font-normal text-md text-gray-600">({scoreboard.Draws})</span>
          </div>
          <div className={`${accentText} font-bold text-xl`}>O&nbsp;
            <span className="font-normal text-md text-gray-600">({scoreboard.O})</span>
          </div>
        </div>
        <div className="mb-2">
          <span className="rounded-full px-3 py-1 bg-gray-100 text-sm font-medium text-gray-700" style={{ color: currentPlayer === "X" ? COLORS.primary : COLORS.accent }}>
            {winner
              ? winner === "draw"
                ? "It's a draw!"
                : `Player ${winner} wins!`
              : `Current turn: Player ${currentPlayer}`}
          </span>
        </div>
      </section>

      {/* Board */}
      <section className="flex flex-col items-center justify-center">
        <div
          className="grid grid-cols-3 grid-rows-3 gap-2"
          style={{
            minWidth: "260px",
            maxWidth: "360px",
            minHeight: "260px",
            maxHeight: "360px",
            width: "65vw",
            aspectRatio: "1/1",
            background: "#fff",
            borderRadius: "1.25rem",
            boxShadow: "0 2px 8px 0 rgb(29 57 126 / 0.10)",
          }}
        >
          {board.map((row, rIdx) =>
            row.map((cell, cIdx) => (
              <button
                key={`cell-${rIdx}-${cIdx}`}
                className="relative rounded-lg bg-gray-50 border-2 border-gray-200 flex items-center justify-center aspect-square hover:bg-gray-100 transition-all active:scale-95 focus:outline outline-2 outline-blue-300"
                style={{
                  width: "100%",
                  height: "100%",
                  borderColor: winner && cell && ((winner === "draw") ? COLORS.secondary : (cell === winner ? COLORS.accent : COLORS.primary))
                    ? COLORS.accent : "#e5e7eb",
                  boxShadow: winner && board[rIdx][cIdx] && ((winner !== "draw" && board[rIdx][cIdx] === winner) ? `0 0 0 2px ${COLORS.accent}` : undefined),
                  fontFamily: "Inter, ui-sans-serif",
                  transition: "border-color 0.2s",
                  cursor: cell || winner ? "default" : "pointer",
                  color: cell === "X" ? COLORS.primary : cell === "O" ? COLORS.accent : "#9ca3af",
                }}
                onClick={() => handleCellClick(rIdx, cIdx)}
                disabled={!!cell || !!winner}
                aria-label={`Row ${rIdx + 1}, Col ${cIdx + 1}`}
              >
                <span className={cellStyle(cell)}>
                  {cell}
                </span>
              </button>
            ))
          )}
        </div>
      </section>

      {/* Controls */}
      <section className="flex flex-row gap-4 mt-8">
        <button
          className={`px-6 py-2 rounded-md font-semibold text-white shadow-sm transition-colors bg-[${COLORS.secondary}] hover:bg-[${COLORS.primary}] focus:ring-2 focus:ring-[${COLORS.accent}]`}
          onClick={resetBoard}
        >
          {winner ? "Next Game" : "Restart"}
        </button>
        <button
          className={`px-6 py-2 rounded-md font-semibold border border-[${COLORS.secondary}] text-[${COLORS.secondary}] hover:border-[${COLORS.primary}] hover:text-[${COLORS.primary}] transition-colors`}
          onClick={() => {
            setScoreboard({ X: 0, O: 0, Draws: 0 });
            resetBoard();
          }}
        >
          Reset Scoreboard
        </button>
      </section>

      {/* Footer */}
      <footer className="fixed bottom-2 w-full flex justify-center items-center text-xs text-gray-400 pointer-events-none z-10">
        <span>
          Tic-Tac-Toe | Modern PvP | Remix | &copy; {new Date().getFullYear()}
        </span>
      </footer>
    </main>
  );
}
