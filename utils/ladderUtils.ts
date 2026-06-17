
import { ResultItem, Bridge, PathStep } from '../types';
import { LADDER_CONFIG } from '../constants';

type RandomSource = () => number;

const DEFAULT_SHUFFLE_ATTEMPTS = 40;

export function generateBridges(count: number, rng: RandomSource = Math.random): Bridge[] {
  const bridges: Bridge[] = [];
  const { numRows, bridgeProbability } = LADDER_CONFIG;

  for (let row = 1; row < numRows; row++) {
    for (let col = 0; col < count - 1; col++) {
      // Avoid adjacent horizontal lines at same level for simplicity
      const hasAdjacent = bridges.some(b => b.level === row && (b.fromCol === col - 1 || b.fromCol === col + 1));
      
      if (!hasAdjacent && rng() < bridgeProbability) {
        bridges.push({ fromCol: col, level: row });
      }
    }
  }
  return bridges;
}

export function calculatePaths(count: number, bridges: Bridge[]): PathStep[][] {
  const paths: PathStep[][] = [];
  const { colWidth, rowHeight, numRows, headerHeight } = LADDER_CONFIG;

  for (let startCol = 0; startCol < count; startCol++) {
    const path: PathStep[] = [];
    let currentCol = startCol;

    // Start point
    path.push({ x: currentCol * colWidth + colWidth / 2, y: headerHeight });

    for (let row = 0; row <= numRows; row++) {
      const currentY = headerHeight + row * rowHeight;
      
      // Horizontal check at current row
      const bridgeRight = bridges.find(b => b.level === row && b.fromCol === currentCol);
      const bridgeLeft = bridges.find(b => b.level === row && b.fromCol === currentCol - 1);

      if (bridgeRight) {
        path.push({ x: currentCol * colWidth + colWidth / 2, y: currentY });
        currentCol++;
        path.push({ x: currentCol * colWidth + colWidth / 2, y: currentY });
      } else if (bridgeLeft) {
        path.push({ x: currentCol * colWidth + colWidth / 2, y: currentY });
        currentCol--;
        path.push({ x: currentCol * colWidth + colWidth / 2, y: currentY });
      } else {
        path.push({ x: currentCol * colWidth + colWidth / 2, y: currentY });
      }
    }
    
    paths.push(path);
  }

  return paths;
}

export function getParticipantFinalColumns(paths: PathStep[]): number[];
export function getParticipantFinalColumns(paths: PathStep[][]): number[];
export function getParticipantFinalColumns(paths: PathStep[] | PathStep[][]): number[] {
  const { colWidth } = LADDER_CONFIG;
  const normalizedPaths = Array.isArray(paths[0]) ? paths as PathStep[][] : [paths as PathStep[]];

  return normalizedPaths.map((path) => {
    const lastPoint = path[path.length - 1];
    return Math.round((lastPoint.x - colWidth / 2) / colWidth);
  });
}

function getTotalDisplacement(paths: PathStep[][]): number {
  return getParticipantFinalColumns(paths).reduce((sum, finalCol, startCol) => sum + Math.abs(finalCol - startCol), 0);
}

export function generateShuffledLadder(
  count: number,
  rng: RandomSource = Math.random,
  attempts = DEFAULT_SHUFFLE_ATTEMPTS
): { bridges: Bridge[]; paths: PathStep[][]; resultOrder: number[] } {
  if (count <= 1) {
    const bridges: Bridge[] = [];
    const paths = calculatePaths(count, bridges);
    return { bridges, paths, resultOrder: getParticipantFinalColumns(paths) };
  }

  let bestBridges = generateBridges(count, rng);
  let bestPaths = calculatePaths(count, bestBridges);
  let bestScore = getTotalDisplacement(bestPaths);

  for (let i = 1; i < attempts; i++) {
    const candidateBridges = generateBridges(count, rng);
    const candidatePaths = calculatePaths(count, candidateBridges);
    const candidateScore = getTotalDisplacement(candidatePaths);

    if (candidateScore > bestScore) {
      bestBridges = candidateBridges;
      bestPaths = candidatePaths;
      bestScore = candidateScore;
    }
  }

  return {
    bridges: bestBridges,
    paths: bestPaths,
    resultOrder: getParticipantFinalColumns(bestPaths)
  };
}

export function shuffleResults(results: ResultItem[], rng: RandomSource = Math.random): ResultItem[] {
  const shuffled = [...results];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  const isSameOrder = shuffled.every((item, index) => item.id === results[index]?.id);
  if (isSameOrder && shuffled.length > 1) {
    const first = shuffled.shift();
    if (first) shuffled.push(first);
  }

  return shuffled;
}

export function getResultDisplayText(result: ResultItem | undefined, fallbackIndex: number): string {
  if (result?.text) return result.text;

  const originalIndex = result?.id.match(/^r-(\d+)$/)?.[1];
  if (originalIndex !== undefined) {
    return `결과 ${Number(originalIndex) + 1}`;
  }

  return `결과 ${fallbackIndex + 1}`;
}

export function getFinalResultIndices(count: number, bridges: Bridge[]): number[] {
    const { numRows } = LADDER_CONFIG;
    
    let currentMapping = Array.from({ length: count }, (_, i) => i);

    for (let row = 0; row <= numRows; row++) {
        // Find bridges at this row
        const rowBridges = bridges.filter(b => b.level === row);
        rowBridges.forEach(b => {
            const idx1 = currentMapping.indexOf(b.fromCol);
            const idx2 = currentMapping.indexOf(b.fromCol + 1);
            // Swap positions
            [currentMapping[idx1], currentMapping[idx2]] = [currentMapping[idx2], currentMapping[idx1]];
        });
    }

    return currentMapping;
}
