import { useState } from 'react';
import { calculateRoundScore, type RoundData } from './logic/scoring';
import { UserPlus, Users, Trophy, Play, CheckCircle2 } from 'lucide-react';

interface Player {
  id: string;
  name: string;
  score: number;
}

export default function App() {
  const [players, setPlayers] = useState<Player[]>([
    { id: '1', name: 'Player 1', score: 0 },
    { id: '2', name: 'Player 2', score: 0 }
  ]);
  const [newPlayerName, setNewPlayerName] = useState('');
  
  // Scoring state for the active player
  const [activePlayerId, setActivePlayerId] = useState<string | null>(null);
  const [currentRound, setCurrentRound] = useState<RoundData>({
    numberCards: [],
    x2Modifier: false,
    plusModifiers: [],
    isBust: false
  });

  const numberOptions = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  const plusOptions = [2, 4, 6, 8, 10];

  const toggleNumber = (num: number) => {
    setCurrentRound(prev => {
      if (prev.numberCards.includes(num)) {
        return { ...prev, numberCards: prev.numberCards.filter(n => n !== num) };
      } else {
        if (prev.numberCards.length >= 7) return prev; // Max 7 unique cards needed
        return { ...prev, numberCards: [...prev.numberCards, num] };
      }
    });
  };

  const togglePlus = (num: number) => {
    setCurrentRound(prev => {
      if (prev.plusModifiers.includes(num)) {
        return { ...prev, plusModifiers: prev.plusModifiers.filter(n => n !== num) };
      } else {
        return { ...prev, plusModifiers: [...prev.plusModifiers, num] };
      }
    });
  };

  const addPlayer = () => {
    if (newPlayerName.trim()) {
      setPlayers([...players, { id: Date.now().toString(), name: newPlayerName.trim(), score: 0 }]);
      setNewPlayerName('');
    }
  };

  const submitScore = () => {
    if (!activePlayerId) return;
    const roundScore = calculateRoundScore(currentRound);
    
    setPlayers(players.map(p => 
      p.id === activePlayerId 
        ? { ...p, score: p.score + roundScore }
        : p
    ));
    
    setActivePlayerId(null);
    setCurrentRound({
      numberCards: [],
      x2Modifier: false,
      plusModifiers: [],
      isBust: false
    });
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-100 p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex items-center gap-3 border-b border-neutral-800 pb-4">
          <Trophy className="text-yellow-500 w-8 h-8" />
          <h1 className="text-3xl font-bold tracking-tight">Flip 7 Scorer</h1>
        </header>

        {/* Main Content */}
        <div className="grid md:grid-cols-2 gap-8">
          
          {/* Left Column: Player List */}
          <div className="space-y-6">
            <div className="bg-neutral-800 p-6 rounded-2xl shadow-xl">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" />
                Players
              </h2>
              
              <div className="space-y-3 mb-6">
                {players.map(player => (
                  <div key={player.id} className="flex items-center justify-between bg-neutral-700/50 p-3 rounded-xl">
                    <span className="font-medium text-lg">{player.name}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-2xl font-bold text-yellow-400">{player.score}</span>
                      <button 
                        onClick={() => setActivePlayerId(player.id)}
                        className="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-lg transition-colors"
                        title="Score Round"
                      >
                        <Play className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={newPlayerName}
                  onChange={e => setNewPlayerName(e.target.value)}
                  placeholder="New Player Name"
                  className="flex-1 bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  onKeyDown={e => e.key === 'Enter' && addPlayer()}
                />
                <button 
                  onClick={addPlayer}
                  className="bg-neutral-700 hover:bg-neutral-600 px-4 py-2 rounded-lg transition-colors"
                >
                  <UserPlus className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Active Scoring */}
          {activePlayerId ? (
            <div className="bg-neutral-800 p-6 rounded-2xl shadow-xl border border-blue-500/30">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">
                  Scoring: <span className="text-blue-400">{players.find(p => p.id === activePlayerId)?.name}</span>
                </h2>
                <button 
                  onClick={() => setActivePlayerId(null)}
                  className="text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
              </div>

              {/* Bust Toggle */}
              <div className="mb-6">
                <button 
                  onClick={() => setCurrentRound(prev => ({ ...prev, isBust: !prev.isBust }))}
                  className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                    currentRound.isBust 
                      ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.5)]' 
                      : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
                  }`}
                >
                  {currentRound.isBust ? 'BUSTED (0 Points)' : 'Did Player Bust?'}
                </button>
              </div>

              <div className={`space-y-6 transition-opacity ${currentRound.isBust ? 'opacity-30 pointer-events-none' : ''}`}>
                
                {/* Number Cards */}
                <div>
                  <h3 className="text-sm font-medium text-neutral-400 mb-3 uppercase tracking-wider">Number Cards</h3>
                  <div className="flex flex-wrap gap-2">
                    {numberOptions.map(num => {
                      const isSelected = currentRound.numberCards.includes(num);
                      return (
                        <button
                          key={`num-${num}`}
                          onClick={() => toggleNumber(num)}
                          className={`w-12 h-16 rounded-xl font-bold text-xl transition-all ${
                            isSelected 
                              ? 'bg-blue-600 text-white border-2 border-blue-400 shadow-lg' 
                              : 'bg-neutral-700 text-neutral-300 border-2 border-transparent hover:bg-neutral-600'
                          }`}
                        >
                          {num}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Modifiers */}
                <div>
                  <h3 className="text-sm font-medium text-neutral-400 mb-3 uppercase tracking-wider">Modifiers</h3>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setCurrentRound(prev => ({ ...prev, x2Modifier: !prev.x2Modifier }))}
                      className={`h-12 px-6 rounded-xl font-bold text-lg transition-all ${
                        currentRound.x2Modifier 
                          ? 'bg-purple-600 text-white border-2 border-purple-400 shadow-lg' 
                          : 'bg-neutral-700 text-neutral-300 border-2 border-transparent hover:bg-neutral-600'
                      }`}
                    >
                      ×2
                    </button>
                    {plusOptions.map(num => {
                      const isSelected = currentRound.plusModifiers.includes(num);
                      return (
                        <button
                          key={`plus-${num}`}
                          onClick={() => togglePlus(num)}
                          className={`h-12 px-5 rounded-xl font-bold text-lg transition-all ${
                            isSelected 
                              ? 'bg-emerald-600 text-white border-2 border-emerald-400 shadow-lg' 
                              : 'bg-neutral-700 text-neutral-300 border-2 border-transparent hover:bg-neutral-600'
                          }`}
                        >
                          +{num}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Live Score Preview */}
                <div className="bg-neutral-900 p-4 rounded-xl border border-neutral-700 flex justify-between items-center">
                  <span className="text-neutral-400 font-medium">Round Score:</span>
                  <span className="text-4xl font-black text-yellow-400">
                    {calculateRoundScore(currentRound)}
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <button 
                onClick={submitScore}
                className="w-full mt-6 bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-lg py-4 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-6 h-6" />
                Confirm Score
              </button>

            </div>
          ) : (
            <div className="bg-neutral-800/50 border border-neutral-800 p-6 rounded-2xl flex flex-col items-center justify-center text-center text-neutral-500 min-h-[400px]">
              <Play className="w-16 h-16 mb-4 opacity-20" />
              <p className="text-lg">Select a player to score their round</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
