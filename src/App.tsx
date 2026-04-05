import { useMemo, useState } from 'react';
import { calculateRoundScore, type RoundData } from './logic/scoring';
import {
  CheckCircle2,
  CircleOff,
  Play,
  RotateCcw,
  Sparkles,
  TrendingUp,
  Trophy,
  UserPlus,
  Users,
  X,
} from 'lucide-react';

interface Player {
  id: string;
  name: string;
  score: number;
  history: number[];
}

interface RoundEntry {
  playerId: string;
  playerName: string;
  roundScore: number;
  totalScore: number;
  isBust: boolean;
}

interface RoundLog {
  id: string;
  roundNumber: number;
  entries: RoundEntry[];
}

const DEFAULT_PLAYERS: Player[] = [
  { id: '1', name: 'Player 1', score: 0, history: [0] },
  { id: '2', name: 'Player 2', score: 0, history: [0] },
];

const EMPTY_ROUND: RoundData = {
  numberCards: [],
  x2Modifier: false,
  plusModifiers: [],
  isBust: false,
};

function createEmptyDrafts(players: Player[]): Record<string, RoundData> {
  return Object.fromEntries(players.map((player) => [player.id, { ...EMPTY_ROUND }]));
}

function Sparkline({ points }: { points: number[] }) {
  if (points.length === 0) return null;
  const width = 100;
  const height = 36;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const spread = max - min || 1;
  const chartPoints = points
    .map((value, index) => {
      const x = (index / Math.max(points.length - 1, 1)) * width;
      const y = height - ((value - min) / spread) * height;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-9 w-24" aria-hidden="true">
      <polyline
        points={chartPoints}
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function App() {
  const [players, setPlayers] = useState<Player[]>(DEFAULT_PLAYERS);
  const [roundLogs, setRoundLogs] = useState<RoundLog[]>([]);
  const [roundDrafts, setRoundDrafts] = useState<Record<string, RoundData>>(() => createEmptyDrafts(DEFAULT_PLAYERS));
  const [activePlayerId, setActivePlayerId] = useState<string | null>(null);
  const [newPlayerName, setNewPlayerName] = useState('');

  const numberOptions = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  const plusOptions = [2, 4, 6, 8, 10];

  const activePlayer = players.find((player) => player.id === activePlayerId) ?? null;
  const activeDraft = activePlayerId ? roundDrafts[activePlayerId] ?? EMPTY_ROUND : EMPTY_ROUND;

  const leader = useMemo(() => {
    if (players.length === 0) return null;
    return [...players].sort((a, b) => b.score - a.score)[0];
  }, [players]);

  const setPlayerDraft = (playerId: string, updater: (draft: RoundData) => RoundData) => {
    setRoundDrafts((prev) => {
      const currentDraft = prev[playerId] ?? EMPTY_ROUND;
      return {
        ...prev,
        [playerId]: updater(currentDraft),
      };
    });
  };

  const toggleNumber = (num: number) => {
    if (!activePlayerId) return;
    setPlayerDraft(activePlayerId, (draft) => {
      if (draft.numberCards.includes(num)) {
        return { ...draft, numberCards: draft.numberCards.filter((value) => value !== num) };
      }
      if (draft.numberCards.length >= 7) {
        return draft;
      }
      return { ...draft, numberCards: [...draft.numberCards, num] };
    });
  };

  const togglePlus = (num: number) => {
    if (!activePlayerId) return;
    setPlayerDraft(activePlayerId, (draft) => {
      if (draft.plusModifiers.includes(num)) {
        return { ...draft, plusModifiers: draft.plusModifiers.filter((value) => value !== num) };
      }
      return { ...draft, plusModifiers: [...draft.plusModifiers, num] };
    });
  };

  const toggleBust = () => {
    if (!activePlayerId) return;
    setPlayerDraft(activePlayerId, (draft) => ({ ...draft, isBust: !draft.isBust }));
  };

  const addPlayer = () => {
    const nextName = newPlayerName.trim();
    if (!nextName) return;
    const nextId = `${Date.now()}`;
    setPlayers((prev) => [...prev, { id: nextId, name: nextName, score: 0, history: [0] }]);
    setRoundDrafts((prev) => ({ ...prev, [nextId]: { ...EMPTY_ROUND } }));
    setNewPlayerName('');
  };

  const removePlayer = (playerId: string) => {
    setPlayers((prev) => prev.filter((player) => player.id !== playerId));
    setRoundDrafts((prev) => {
      const next = { ...prev };
      delete next[playerId];
      return next;
    });
    if (activePlayerId === playerId) {
      setActivePlayerId(null);
    }
  };

  const resetMatch = () => {
    setPlayers((prev) => prev.map((player) => ({ ...player, score: 0, history: [0] })));
    setRoundLogs([]);
    setRoundDrafts((prev) =>
      Object.fromEntries(Object.keys(prev).map((playerId) => [playerId, { ...EMPTY_ROUND }])),
    );
    setActivePlayerId(null);
  };

  const finalizeRound = () => {
    if (players.length === 0) return;
    const entries: RoundEntry[] = players.map((player) => {
      const draft = roundDrafts[player.id] ?? EMPTY_ROUND;
      const roundScore = calculateRoundScore(draft);
      return {
        playerId: player.id,
        playerName: player.name,
        roundScore,
        totalScore: player.score + roundScore,
        isBust: draft.isBust,
      };
    });

    const totalById = Object.fromEntries(entries.map((entry) => [entry.playerId, entry.totalScore]));

    setPlayers((prev) =>
      prev.map((player) => ({
        ...player,
        score: totalById[player.id] ?? player.score,
        history: [...player.history, totalById[player.id] ?? player.score],
      })),
    );

    setRoundLogs((prev) => [
      {
        id: `${Date.now()}`,
        roundNumber: prev.length + 1,
        entries,
      },
      ...prev,
    ]);

    setRoundDrafts(createEmptyDrafts(players));
    setActivePlayerId(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <div className="mx-auto w-full max-w-5xl px-3 pb-28 pt-4 sm:px-5">
        <header className="mb-4 rounded-2xl border border-slate-800/80 bg-slate-900/70 p-4 shadow-xl backdrop-blur">
          <div className="mb-3 flex items-center gap-3">
            <div className="rounded-xl bg-amber-400/10 p-2 text-amber-300">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Flip 7 Helper</h1>
              <p className="text-xs text-slate-400 sm:text-sm">Score everyone together at end of each round</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
            <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-3">
              <p className="text-xs text-slate-400">Players</p>
              <p className="text-lg font-bold">{players.length}</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-3">
              <p className="text-xs text-slate-400">Rounds</p>
              <p className="text-lg font-bold">{roundLogs.length}</p>
            </div>
            <div className="col-span-2 rounded-xl border border-slate-800 bg-slate-900/90 p-3 sm:col-span-1">
              <p className="text-xs text-slate-400">Leader</p>
              <p className="truncate text-lg font-bold">{leader?.name ?? 'None'}</p>
            </div>
            <button
              onClick={resetMatch}
              className="col-span-2 flex items-center justify-center gap-2 rounded-xl border border-rose-400/30 bg-rose-500/10 p-3 font-semibold text-rose-200 transition hover:bg-rose-500/20 sm:col-span-1"
            >
              <RotateCcw className="h-4 w-4" />
              Reset Match
            </button>
          </div>
        </header>

        <main className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="space-y-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-lg">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-300">
                <Users className="h-4 w-4 text-cyan-300" />
                Round input by player
              </div>

              <div className="space-y-3">
                {players.map((player) => {
                  const draft = roundDrafts[player.id] ?? EMPTY_ROUND;
                  const previewScore = calculateRoundScore(draft);
                  return (
                    <article key={player.id} className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <div>
                          <p className="text-base font-semibold">{player.name}</p>
                          <p className="text-xs text-slate-400">Current total</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-slate-400">Total</p>
                          <p className="text-2xl font-black text-amber-300" data-testid={`player-total-${player.id}`}>
                            {player.score}
                          </p>
                        </div>
                      </div>

                      <div className="mb-2 flex items-center justify-between rounded-lg bg-slate-900/70 px-2 py-1.5 text-cyan-300">
                        <div className="flex items-center gap-1 text-xs font-semibold text-slate-300">
                          <TrendingUp className="h-3.5 w-3.5" />
                          Points trend
                        </div>
                        <Sparkline points={player.history} />
                      </div>

                      <div className="mb-3 flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2">
                        <p className="text-xs text-slate-400">This round preview</p>
                        <p
                          className={`text-lg font-black ${previewScore > 0 ? 'text-emerald-300' : 'text-slate-200'}`}
                          data-testid={`round-preview-${player.id}`}
                        >
                          {previewScore > 0 ? `+${previewScore}` : '0'}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => setActivePlayerId(player.id)}
                          data-testid={`edit-player-${player.id}`}
                          className="flex h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-cyan-500 px-3 font-semibold text-slate-950 transition hover:bg-cyan-400"
                        >
                          <Play className="h-4 w-4" />
                          Edit round cards
                        </button>
                        <button
                          onClick={() => removePlayer(player.id)}
                          disabled={players.length <= 1}
                          className="h-11 rounded-lg border border-slate-700 bg-slate-900 px-3 text-xs text-slate-300 transition hover:border-rose-300/50 hover:text-rose-200 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          Remove
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>

              <div className="mt-3 flex gap-2">
                <input
                  type="text"
                  value={newPlayerName}
                  onChange={(event) => setNewPlayerName(event.target.value)}
                  placeholder="New player"
                  className="h-11 flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 text-sm outline-none ring-cyan-400 transition placeholder:text-slate-500 focus:ring-2"
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') addPlayer();
                  }}
                />
                <button
                  onClick={addPlayer}
                  data-testid="add-player-button"
                  className="flex h-11 items-center gap-2 rounded-lg bg-slate-100 px-4 font-semibold text-slate-900 transition hover:bg-white"
                >
                  <UserPlus className="h-4 w-4" />
                  Add
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-lg">
              <p className="mb-3 text-sm font-semibold text-slate-200">Round history</p>
              {roundLogs.length === 0 ? (
                <p className="rounded-lg border border-dashed border-slate-700 p-4 text-sm text-slate-400">
                  No rounds scored yet.
                </p>
              ) : (
                <div className="max-h-72 space-y-2 overflow-auto pr-1">
                  {roundLogs.map((round) => (
                    <article key={round.id} className="rounded-lg border border-slate-800 bg-slate-950/70 p-3 text-sm">
                      <p className="mb-2 font-semibold text-slate-100">Round {round.roundNumber}</p>
                      <div className="space-y-1.5">
                        {round.entries.map((entry) => (
                          <div key={`${round.id}-${entry.playerId}`} className="flex items-center justify-between gap-2">
                            <p className="text-xs text-slate-300">{entry.playerName}</p>
                            <p className="text-xs text-slate-400">
                              {entry.roundScore > 0 ? `+${entry.roundScore}` : '0'} {'->'} {entry.totalScore}
                              {entry.isBust ? ' (Busted)' : ''}
                            </p>
                          </div>
                        ))}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-sm text-slate-400">
            <p className="mb-2 font-semibold text-slate-200">How this flow works</p>
            <ol className="space-y-2 text-xs leading-relaxed sm:text-sm">
              <li>1. Open each player and enter their round cards.</li>
              <li>2. Repeat for everyone at the table.</li>
              <li>3. Tap "Finalize round for everyone" once to apply all scores together.</li>
            </ol>
          </section>
        </main>

        <div className="fixed inset-x-0 bottom-0 z-10 border-t border-slate-700/80 bg-slate-950/95 px-3 py-3 backdrop-blur sm:px-5">
          <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-wider text-slate-500">Round action</p>
              <p className="truncate text-sm font-semibold text-slate-200">Apply every player's draft at once</p>
            </div>
            <button
              onClick={finalizeRound}
              data-testid="finalize-round"
              className="flex h-12 shrink-0 items-center gap-2 rounded-xl bg-amber-400 px-4 text-sm font-bold text-slate-900 transition hover:bg-amber-300"
            >
              <CheckCircle2 className="h-4 w-4" />
              Finalize round
            </button>
          </div>
        </div>

        {activePlayer ? (
          <>
            <button
              className="fixed inset-0 z-20 bg-black/55"
              onClick={() => setActivePlayerId(null)}
              aria-label="Close scoring panel"
            />
            <section className="fixed inset-x-0 bottom-0 z-30 max-h-[88vh] overflow-y-auto rounded-t-3xl border border-slate-700 bg-slate-900 p-4 pb-6 shadow-2xl lg:inset-auto lg:left-1/2 lg:top-8 lg:max-h-[90vh] lg:w-[32rem] lg:-translate-x-1/2 lg:rounded-3xl">
              <div className="mb-4 flex items-center justify-between gap-2">
                <h2 className="text-lg font-bold">
                  Round cards <span className="text-cyan-300">{activePlayer.name}</span>
                </h2>
                <button
                  onClick={() => setActivePlayerId(null)}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-700 bg-slate-950 text-slate-300"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <button
                onClick={toggleBust}
                data-testid="bust-toggle"
                className={`mb-4 h-12 w-full rounded-xl text-base font-bold transition ${
                  activeDraft.isBust
                    ? 'bg-rose-500 text-white shadow-[0_0_0_3px_rgba(244,63,94,0.3)]'
                    : 'border border-slate-700 bg-slate-950 text-slate-200 hover:border-rose-400/40'
                }`}
              >
                {activeDraft.isBust ? 'Busted (score 0)' : 'Mark as busted'}
              </button>

              <div className={`${activeDraft.isBust ? 'pointer-events-none opacity-40' : ''}`}>
                <div className="mb-4">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Number cards (unique)</p>
                  <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
                    {numberOptions.map((num) => {
                      const selected = activeDraft.numberCards.includes(num);
                      return (
                        <button
                          key={num}
                          onClick={() => toggleNumber(num)}
                          data-testid={`number-card-${num}`}
                          className={`h-12 rounded-lg border text-base font-bold transition ${
                            selected
                              ? 'border-cyan-300 bg-cyan-400/20 text-cyan-200'
                              : 'border-slate-700 bg-slate-950 text-slate-200 hover:border-slate-500'
                          }`}
                        >
                          {num}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="mb-4">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Modifiers</p>
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                    <button
                      onClick={() =>
                        setPlayerDraft(activePlayer.id, (draft) => ({ ...draft, x2Modifier: !draft.x2Modifier }))
                      }
                      data-testid="x2-toggle"
                      className={`h-11 rounded-lg border text-sm font-bold transition ${
                        activeDraft.x2Modifier
                          ? 'border-sky-300 bg-sky-500/20 text-sky-200'
                          : 'border-slate-700 bg-slate-950 text-slate-200'
                      }`}
                    >
                      x2
                    </button>
                    {plusOptions.map((plus) => {
                      const selected = activeDraft.plusModifiers.includes(plus);
                      return (
                        <button
                          key={plus}
                          onClick={() => togglePlus(plus)}
                          data-testid={`plus-card-${plus}`}
                          className={`h-11 rounded-lg border text-sm font-bold transition ${
                            selected
                              ? 'border-emerald-300 bg-emerald-500/20 text-emerald-200'
                              : 'border-slate-700 bg-slate-950 text-slate-200'
                          }`}
                        >
                          +{plus}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-700 bg-slate-950/95 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs text-slate-400">Current preview</p>
                  <p className="text-3xl font-black text-amber-300" data-testid="round-score-preview">
                    {calculateRoundScore(activeDraft)}
                  </p>
                </div>
                <button
                  onClick={() => setActivePlayerId(null)}
                  data-testid="save-player-round"
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-cyan-500 text-sm font-bold text-slate-950 transition hover:bg-cyan-400"
                >
                  <Sparkles className="h-4 w-4" />
                  Save player draft
                </button>
              </div>

              <button
                onClick={() =>
                  setPlayerDraft(activePlayer.id, () => ({
                    ...EMPTY_ROUND,
                  }))
                }
                className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-slate-700 text-xs text-slate-300"
              >
                <CircleOff className="h-4 w-4" />
                Clear this player draft
              </button>
            </section>
          </>
        ) : null}
      </div>
    </div>
  );
}
