
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Participant, ResultItem, Bridge, PathStep, GameStatus } from '../types';
import { LADDER_CONFIG } from '../constants';

interface LadderGameProps {
  participants: Participant[];
  results: ResultItem[];
  bridges: Bridge[];
  paths: PathStep[][];
  status: GameStatus;
  onAnimationEnd: () => void;
}

const LadderGame: React.FC<LadderGameProps> = ({
  participants,
  results,
  bridges,
  paths,
  status,
  onAnimationEnd
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const progressRef = useRef<number[]>(new Array(participants.length).fill(0));
  const animationRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  const { colWidth, rowHeight, numRows, headerHeight, footerHeight, strokeWidth } = LADDER_CONFIG;
  const totalWidth = participants.length * colWidth;
  const totalHeight = headerHeight + (numRows + 1) * rowHeight + footerHeight;

  const draw = useCallback((ctx: CanvasRenderingContext2D) => {
    const currentProgress = progressRef.current;
    
    ctx.clearRect(0, 0, totalWidth, totalHeight);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, totalWidth, totalHeight);

    // 1. 배경 세로선
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    participants.forEach((_, i) => {
      const x = i * colWidth + colWidth / 2;
      ctx.beginPath();
      ctx.moveTo(x, headerHeight);
      ctx.lineTo(x, headerHeight + (numRows + 1) * rowHeight);
      ctx.strokeStyle = '#f1f5f9'; 
      ctx.lineWidth = strokeWidth;
      ctx.stroke();
    });

    // 2. 가로선 (다리)
    bridges.forEach((b) => {
      const x1 = b.fromCol * colWidth + colWidth / 2;
      const x2 = (b.fromCol + 1) * colWidth + colWidth / 2;
      const y = headerHeight + b.level * rowHeight;
      ctx.beginPath();
      ctx.moveTo(x1, y);
      ctx.lineTo(x2, y);
      ctx.strokeStyle = '#f1f5f9';
      ctx.lineWidth = strokeWidth;
      ctx.stroke();
    });

    // 3. 상단 참가자 영역
    participants.forEach((p, i) => {
      const x = i * colWidth + colWidth / 2;
      const rectW = colWidth - 10;
      const rectH = 90;
      const rectY = headerHeight - 100;
      
      ctx.save();
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(0,0,0,0.05)';
      ctx.shadowBlur = 10;
      
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(x - rectW / 2, rectY, rectW, rectH, 12);
      } else {
        ctx.rect(x - rectW / 2, rectY, rectW, rectH);
      }
      ctx.fill();

      if (currentProgress[i] > 0 && currentProgress[i] < 1) {
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 3;
        ctx.stroke();
      } else if (currentProgress[i] === 1) {
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      ctx.restore();

      ctx.font = '40px serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#000000';
      ctx.fillText(p.character, x, headerHeight - 55);

      ctx.font = 'bold 16px Pretendard';
      ctx.fillStyle = '#1e293b';
      ctx.fillText(p.name || `${i + 1}번`, x, headerHeight - 25);
    });

    // 4. 하단 결과 영역
    // 위치를 약간 아래로 조정하여 이름이 들어갈 공간 확보
    results.forEach((r, i) => {
      const x = i * colWidth + colWidth / 2;
      const y = headerHeight + (numRows + 1) * rowHeight + 70;
      
      ctx.fillStyle = '#f0fdf4';
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(x - (colWidth - 15) / 2, y - 25, colWidth - 15, 50, 10);
      } else {
        ctx.rect(x - (colWidth - 15) / 2, y - 25, colWidth - 15, 50);
      }
      ctx.fill();

      ctx.font = 'bold 18px Pretendard';
      ctx.fillStyle = '#059669';
      ctx.textAlign = 'center';
      ctx.fillText(r.text || `결과 ${i + 1}`, x, y + 8);
    });

    // 5. 캐릭터 이동 경로 그리기
    paths.forEach((path, i) => {
      const pVal = currentProgress[i];
      if (pVal <= 0) return;

      const pColor = participants[i].color;
      ctx.beginPath();
      ctx.lineWidth = strokeWidth + 2;
      ctx.strokeStyle = pColor;
      ctx.lineCap = 'round';
      ctx.moveTo(path[0].x, path[0].y);

      const totalSteps = path.length - 1;
      const currentSteps = pVal * totalSteps;
      const fullSteps = Math.floor(currentSteps);
      const partial = currentSteps - fullSteps;

      for (let s = 1; s <= fullSteps; s++) {
        ctx.lineTo(path[s].x, path[s].y);
      }

      let headX = path[fullSteps].x;
      let headY = path[fullSteps].y;

      if (fullSteps < totalSteps) {
        const next = path[fullSteps + 1];
        headX = path[fullSteps].x + (next.x - path[fullSteps].x) * partial;
        headY = path[fullSteps].y + (next.y - path[fullSteps].y) * partial;
        ctx.lineTo(headX, headY);
      }
      ctx.stroke();

      // 캐릭터 아이콘 그리기
      ctx.save();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(headX, headY - 12, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = pColor;
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.font = '28px serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#000000';
      ctx.fillText(participants[i].character, headX, headY - 3);

      // 애니메이션 완료 시 캐릭터 하단에 사용자명 표시
      if (pVal === 1) {
        ctx.font = 'bold 13px Pretendard';
        ctx.fillStyle = '#64748b'; // slate-500
        ctx.textAlign = 'center';
        // 아이콘 원형 하단과 결과 박스 상단 사이의 공간에 이름 출력
        ctx.fillText(participants[i].name || `${i + 1}번`, headX, headY + 32);
      }
      ctx.restore();
    });
  }, [participants, results, bridges, paths, totalWidth, totalHeight, colWidth, rowHeight, numRows, headerHeight, strokeWidth]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = totalWidth * dpr;
    canvas.height = totalHeight * dpr;
    canvas.style.width = `${totalWidth}px`;
    canvas.style.height = `${totalHeight}px`;
    ctx.scale(dpr, dpr);
    
    if (status === 'INPUT') {
      progressRef.current = new Array(participants.length).fill(0);
    }
    
    draw(ctx);
  }, [status, participants.length, totalWidth, totalHeight, draw]);

  useEffect(() => {
    if (status === 'INPUT' || status === 'FINISHED') return;

    const update = (time: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = time;
      const deltaTime = time - lastTimeRef.current;
      lastTimeRef.current = time;

      const progress = progressRef.current;
      const duration = 3000;
      const speed = 1 / duration;
      
      let allFinished = true;

      const nextProgress = progress.map((p, i) => {
        let val = p;
        if (status === 'ANIMATING' && val === 0) {
          val = 0.0001; 
        }
        
        if (val > 0 && val < 1) {
          val = Math.min(1, val + speed * deltaTime);
        }

        if (val < 1) allFinished = false;
        return val;
      });

      progressRef.current = nextProgress;

      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (ctx) draw(ctx);

      if (allFinished) {
        onAnimationEnd();
        cancelAnimationFrame(animationRef.current);
      } else {
        animationRef.current = requestAnimationFrame(update);
      }
    };

    animationRef.current = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(animationRef.current);
      lastTimeRef.current = 0;
    };
  }, [status, participants.length, onAnimationEnd, draw]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (status !== 'READY' && status !== 'ANIMATING') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    participants.forEach((_, i) => {
      const centerX = i * colWidth + colWidth / 2;
      const rectW = colWidth - 10;
      const rectH = 90;
      const rectY = headerHeight - 100;

      if (
        x >= centerX - rectW / 2 &&
        x <= centerX + rectW / 2 &&
        y >= rectY &&
        y <= rectY + rectH
      ) {
        if (progressRef.current[i] === 0) {
          const next = [...progressRef.current];
          next[i] = 0.0001;
          progressRef.current = next;
        }
      }
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (status !== 'READY' && status !== 'ANIMATING') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    let isOverHeader = false;
    participants.forEach((_, i) => {
      const centerX = i * colWidth + colWidth / 2;
      const rectY = headerHeight - 100;
      if (
        x >= centerX - (colWidth-10)/2 &&
        x <= centerX + (colWidth-10)/2 &&
        y >= rectY &&
        y <= rectY + 90
      ) {
        if (progressRef.current[i] === 0) isOverHeader = true;
      }
    });
    canvas.style.cursor = isOverHeader ? 'pointer' : 'default';
  };

  return (
    <div className="w-full h-full bg-slate-100/50 rounded-3xl p-6 border-4 border-white shadow-inner overflow-auto">
      <div style={{ width: totalWidth }} className="mx-auto min-h-full flex items-center">
        <canvas 
          ref={canvasRef} 
          className="rounded-2xl shadow-sm bg-white" 
          onClick={handleCanvasClick}
          onMouseMove={handleMouseMove}
        />
      </div>
    </div>
  );
};

export default LadderGame;
