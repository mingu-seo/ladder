
import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import SetupForm from './components/SetupForm';
import LadderGame from './components/LadderGame';
import { Participant, ResultItem, Bridge, GameStatus, PathStep } from './types';
import { CHARACTERS, COLORS, MAX_PARTICIPANTS, MIN_PARTICIPANTS } from './constants';
import { generateShuffledLadder, getParticipantFinalColumns, getResultDisplayText, shuffleResults } from './utils/ladderUtils';

const App: React.FC = () => {
  const [participantCount, setParticipantCount] = useState(5);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [results, setResults] = useState<ResultItem[]>([]);
  const [bridges, setBridges] = useState<Bridge[]>([]);
  const [paths, setPaths] = useState<PathStep[][]>([]);
  const [ladderResults, setLadderResults] = useState<ResultItem[]>([]);
  const [status, setStatus] = useState<GameStatus>('INPUT');

  useEffect(() => {
    if (status !== 'INPUT') return;

    const newParticipants: Participant[] = Array.from({ length: participantCount }).map((_, i) => ({
      id: `p-${i}`,
      name: participants[i]?.name || '',
      character: CHARACTERS[i % CHARACTERS.length],
      color: COLORS[i % COLORS.length]
    }));

    const newResults: ResultItem[] = Array.from({ length: participantCount }).map((_, i) => ({
      id: `r-${i}`,
      text: results[i]?.text || ''
    }));

    setParticipants(newParticipants);
    setResults(newResults);
    
    const { bridges: newBridges, paths: newPaths } = generateShuffledLadder(participantCount);
    setBridges(newBridges);
    setPaths(newPaths);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [participantCount, status]);

  const handleRandomize = useCallback((shouldShuffleResults = status !== 'INPUT') => {
    const { bridges: newBridges, paths: newPaths } = generateShuffledLadder(participantCount);
    setBridges(newBridges);
    setPaths(newPaths);

    if (shouldShuffleResults) {
      setLadderResults(shuffleResults(results));
    }
  }, [participantCount, results, status]);

  const handleGoToLadder = () => {
    handleRandomize(true);
    setStatus('READY');
  };

  const handleStartGame = () => {
    setStatus('ANIMATING');
  };

  const handleSaveImage = async () => {
    const stage = document.querySelector('canvas');
    if (!stage) return;
    
    const link = document.createElement('a');
    link.download = `eduladder_result_${new Date().getTime()}.png`;
    link.href = stage.toDataURL('image/png');
    link.click();
  };

  // '첫 페이지로' 버튼 클릭 시 호출되는 함수
  const handleReset = () => {
    // 즉시 입력 모드로 전환 (데이터는 유지하여 수정 가능하게 함)
    setStatus('INPUT');
  };

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (status !== 'INPUT') {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [status]);

  const displayedResults = ladderResults.length === participantCount ? ladderResults : results;

  return (
    <div className="h-screen flex flex-col bg-slate-50 overflow-hidden">
      <Header onHome={handleReset} />

      <main className="flex-1 flex w-full overflow-y-auto md:overflow-hidden">
        {status === 'INPUT' ? (
          <div className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <SetupForm
              participantCount={participantCount}
              setParticipantCount={setParticipantCount}
              participants={participants}
              setParticipants={setParticipants}
              results={results}
              setResults={setResults}
              onGoToLadder={handleGoToLadder}
            />
          </div>
        ) : (
          <div className="flex flex-col md:flex-row w-full md:overflow-hidden animate-in zoom-in-95 duration-500">
            {/* 왼쪽 사다리 영역 */}
            <div className="flex-1 flex flex-col p-4 md:p-6 space-y-4 md:overflow-hidden">
              <div className="flex-1 overflow-hidden min-h-[700px] md:min-h-0">
                <LadderGame
                  participants={participants}
                  results={displayedResults}
                  bridges={bridges}
                  paths={paths}
                  status={status}
                  onAnimationEnd={() => setStatus('FINISHED')}
                />
              </div>

              {status === 'FINISHED' && (
                <div className="h-48 overflow-x-auto pb-4">
                    <div className="flex gap-4 min-w-max">
                        {participants.map((p, i) => {
                        const resultIdx = getParticipantFinalColumns(paths[i])[0];
                        const resultText = getResultDisplayText(displayedResults[resultIdx], resultIdx);
                        
                        return (
                            <div key={p.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center gap-2 transform hover:scale-105 transition-all w-40 flex-shrink-0">
                                <span className="text-3xl">{p.character}</span>
                                <span className="text-sm font-bold text-slate-500 truncate w-full text-center">{p.name || `${i + 1}번`}</span>
                                <div className="w-full h-px bg-slate-100 my-1"></div>
                                <span className="text-indigo-600 font-extrabold text-center truncate w-full">{resultText}</span>
                            </div>
                        );
                        })}
                    </div>
                </div>
              )}
            </div>

            {/* 오른쪽 컨트롤 사이드바 */}
            <div className="w-full md:w-80 bg-white border-t md:border-t-0 md:border-l border-slate-200 shadow-lg z-10 flex flex-col p-6 space-y-6">
                <div className="space-y-4">
                    <div className="flex flex-col gap-2">
                        <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-bold text-center ${
                            status === 'READY' ? 'bg-indigo-100 text-indigo-700' : 
                            status === 'ANIMATING' ? 'bg-amber-100 text-amber-700 animate-pulse' : 'bg-emerald-100 text-emerald-700'
                        }`}>
                            {status === 'READY' ? '📍 사다리 확인 중' : 
                            status === 'ANIMATING' ? '🏃 사다리 타는 중...' : '✅ 결과 확인'}
                        </span>
                        <h2 className="text-base font-bold text-slate-700 leading-tight">
                            {status === 'READY' ? '개별 캐릭터를 클릭하거나 일괄 시작을 누르세요.' :
                            status === 'ANIMATING' ? '누가 어디로 갈까요? 긴장되는 순간!' : '공정한 결과가 나왔습니다!'}
                        </h2>
                    </div>
                    
                    <div className="flex flex-col gap-3 pt-4">
                        {(status === 'READY' || status === 'ANIMATING') && (
                            <>
                                {status === 'READY' && (
                                    <button
                                        onClick={() => handleRandomize(true)}
                                        className="w-full px-6 py-3 bg-white border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 18h1.4c1.3 0 2.5-.6 3.3-1.7l6.1-8.6c.7-1.1 2-1.7 3.3-1.7H22"/><path d="m18 2 4 4-4 4"/><path d="M2 6h1.9c1.5 0 2.9.9 3.6 2.2"/><path d="M22 18h-5.9c-1.3 0-2.6-.7-3.3-1.8l-.5-.8"/><path d="m18 14 4 4-4 4"/></svg>
                                        사다리 랜덤 생성
                                    </button>
                                )}
                                <button
                                    onClick={handleStartGame}
                                    disabled={status === 'ANIMATING'}
                                    className={`w-full px-8 py-4 font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-lg ${
                                        status === 'ANIMATING' ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700'
                                    }`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                                    일괄 시작
                                </button>
                            </>
                        )}
                        {status === 'FINISHED' && (
                            <>
                                <button
                                    onClick={handleReset}
                                    className="w-full px-6 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                                    새 게임 (설정)
                                </button>
                                <button
                                    onClick={handleSaveImage}
                                    className="w-full px-6 py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 flex items-center justify-center gap-2 text-lg"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                                    이미지 저장
                                </button>
                            </>
                        )}
                    </div>
                </div>

                <div className="flex-1"></div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-400">
                    <p className="font-bold mb-1">💡 팁</p>
                    <ul className="space-y-1 list-disc list-inside">
                        <li>캐릭터를 직접 클릭해 한 명씩 출발시킬 수 있습니다.</li>
                        <li>일괄 시작을 누르면 모두 함께 출발합니다.</li>
                        <li>상단 '첫 페이지로' 버튼을 누르면 설정 화면으로 이동합니다.</li>
                    </ul>
                </div>
                
                <footer className="text-center text-slate-300 text-[10px] py-2">
                    &copy; Codro - withsky
                </footer>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;