
import { Participant, ResultItem, Bridge, PathStep } from '../types';
import { LADDER_CONFIG } from '../constants';

export function generateBridges(count: number): Bridge[] {
  const bridges: Bridge[] = [];
  const { numRows, bridgeProbability } = LADDER_CONFIG;

  for (let row = 1; row < numRows; row++) {
    for (let col = 0; col < count - 1; col++) {
      // Avoid adjacent horizontal lines at same level for simplicity
      const hasAdjacent = bridges.some(b => b.level === row && (b.fromCol === col - 1 || b.fromCol === col + 1));
      
      if (!hasAdjacent && Math.random() < bridgeProbability) {
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

export function getFinalResultIndices(count: number, bridges: Bridge[]): number[] {
    const results = new Array(count).fill(0).map((_, i) => i);
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
