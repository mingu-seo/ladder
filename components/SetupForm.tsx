
import React from 'react';
import { Participant, ResultItem } from '../types';
import { MAX_PARTICIPANTS, MIN_PARTICIPANTS } from '../constants';

interface SetupFormProps {
  participantCount: number;
  setParticipantCount: (n: number) => void;
  participants: Participant[];
  setParticipants: (p: Participant[]) => void;
  results: ResultItem[];
  setResults: (r: ResultItem[]) => void;
  onGoToLadder: () => void;
}

const SetupForm: React.FC<SetupFormProps> = ({
  participantCount,
  setParticipantCount,
  participants,
  setParticipants,
  results,
  setResults,
  onGoToLadder
}) => {

  const handleParticipantNameChange = (id: string, name: string) => {
    setParticipants(participants.map(p => p.id === id ? { ...p, name } : p));
  };

  const handleResultTextChange = (id: string, text: string) => {
    setResults(results.map(r => r.id === id ? { ...r, text } : r));
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
      <div className="p-8 border-b border-slate-100 bg-slate-50/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-xl font-bold text-slate-800 mb-1">참가자 및 결과 설정</h2>
            <p className="text-slate-500 text-sm">인원수를 설정하고 이름과 결과를 입력하세요.</p>
          </div>
          <div className="flex items-center gap-4">
            <label className="text-sm font-semibold text-slate-700">참가자 수:</label>
            <div className="flex items-center bg-white border border-slate-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500">
              <input
                type="number"
                min={MIN_PARTICIPANTS}
                max={MAX_PARTICIPANTS}
                value={participantCount}
                onChange={(e) => setParticipantCount(Math.min(MAX_PARTICIPANTS, Math.max(MIN_PARTICIPANTS, parseInt(e.target.value) || 1)))}
                className="w-20 px-4 py-2 text-center font-bold text-indigo-600 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="p-8 max-h-[500px] overflow-y-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
        <section>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
            참가자 이름
          </h3>
          <div className="space-y-3">
            {participants.map((p, idx) => (
              <div key={p.id} className="flex items-center gap-3">
                <span className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-500">
                  {idx + 1}
                </span>
                <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg">
                        {p.character}
                    </span>
                    <input
                        type="text"
                        placeholder={`${idx + 1}번 학생`}
                        value={p.name}
                        onChange={(e) => handleParticipantNameChange(p.id, e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none"
                    />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            결과 항목
          </h3>
          <div className="space-y-3">
            {results.map((r, idx) => (
              <div key={r.id} className="flex items-center gap-3">
                <span className="w-8 h-8 flex items-center justify-center rounded-full bg-emerald-50 text-xs font-bold text-emerald-600">
                  {idx + 1}
                </span>
                <input
                  type="text"
                  placeholder={`결과 ${idx + 1}`}
                  value={r.text}
                  onChange={(e) => handleResultTextChange(r.id, e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-emerald-50/30 border border-emerald-100 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all outline-none"
                />
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-center">
        <button
          onClick={onGoToLadder}
          className="px-16 py-4 bg-indigo-600 text-white text-lg font-bold rounded-xl hover:bg-indigo-700 hover:scale-105 transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-3"
        >
          사다리 페이지로
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
        </button>
      </div>
    </div>
  );
};

export default SetupForm;
