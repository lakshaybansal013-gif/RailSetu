import { NetworkEdge } from '../types';

export class DisjointSet {
  private parent: Map<string, string> = new Map();
  private rank: Map<string, number> = new Map();

  constructor(elements: string[]) {
    elements.forEach(el => {
      this.parent.set(el, el);
      this.rank.set(el, 0);
    });
  }

  find(item: string): string {
    if (!this.parent.has(item)) {
      this.parent.set(item, item);
      this.rank.set(item, 0);
      return item;
    }
    const root = this.parent.get(item)!;
    if (root !== item) {
      this.parent.set(item, this.find(root)); // Path compression
    }
    return this.parent.get(item)!;
  }

  union(a: string, b: string): boolean {
    const rootA = this.find(a);
    const rootB = this.find(b);

    if (rootA === rootB) return false; // Cycle detected

    // Union by rank
    const rankA = this.rank.get(rootA) || 0;
    const rankB = this.rank.get(rootB) || 0;

    if (rankA < rankB) {
      this.parent.set(rootA, rootB);
    } else if (rankA > rankB) {
      this.parent.set(rootB, rootA);
    } else {
      this.parent.set(rootB, rootA);
      this.rank.set(rootA, rankA + 1);
    }

    return true;
  }

  connected(a: string, b: string): boolean {
    return this.find(a) === this.find(b);
  }
}

export interface KruskalStep {
  stepNumber: number;
  currentEdge: NetworkEdge;
  action: 'SORT' | 'ACCEPTED' | 'CYCLE_REJECTED' | 'COMPLETE';
  edgeStatus: 'INCLUDED' | 'REJECTED';
  mstEdges: NetworkEdge[];
  totalCostSoFar: number;
  explanation: string;
}

export interface KruskalMstResult {
  mstEdges: NetworkEdge[];
  rejectedEdges: NetworkEdge[];
  totalCostCr: number;
  totalDistanceKm: number;
  steps: KruskalStep[];
}

/**
 * Kruskal's Minimum Spanning Tree Algorithm:
 * Finds the cheapest connected rail network spanning all Indian metropolitan hubs.
 * 1. Sort edges in ascending order of capital cost / distance.
 * 2. Greedily pick the cheapest edge.
 * 3. Include it if and only if it doesn't form a cycle (checked via Disjoint Set Union).
 */
export function kruskalMinimumSpanningTree(
  nodes: string[],
  edges: NetworkEdge[]
): KruskalMstResult {
  if (!edges || edges.length === 0) {
    return { mstEdges: [], rejectedEdges: [], totalCostCr: 0, totalDistanceKm: 0, steps: [] };
  }

  const steps: KruskalStep[] = [];
  const dsu = new DisjointSet(nodes);

  // 1. Greedy sort by cost
  const sortedEdges = [...edges].sort((a, b) => a.costInCr - b.costInCr);

  steps.push({
    stepNumber: 1,
    currentEdge: sortedEdges[0],
    action: 'SORT',
    edgeStatus: 'INCLUDED',
    mstEdges: [],
    totalCostSoFar: 0,
    explanation: `Greedy Sorting: Sorted all ${sortedEdges.length} candidate railway corridors by budget (cheapest first: ₹${sortedEdges[0].costInCr} Cr).`,
  });

  const mstEdges: NetworkEdge[] = [];
  const rejectedEdges: NetworkEdge[] = [];
  let totalCost = 0;
  let totalDistance = 0;

  for (const edge of sortedEdges) {
    const isCycle = !dsu.union(edge.source, edge.destination);

    if (!isCycle) {
      const acceptedEdge = { ...edge, selectedInMST: true };
      mstEdges.push(acceptedEdge);
      totalCost += edge.costInCr;
      totalDistance += edge.distanceKm;

      steps.push({
        stepNumber: steps.length + 1,
        currentEdge: acceptedEdge,
        action: 'ACCEPTED',
        edgeStatus: 'INCLUDED',
        mstEdges: [...mstEdges],
        totalCostSoFar: totalCost,
        explanation: `Accepted edge ${edge.source} ↔ ${edge.destination} (Cost: ₹${edge.costInCr} Cr, Dist: ${edge.distanceKm} km). Connects two separate railway zones without creating a cycle.`,
      });
    } else {
      const rejectedEdge = { ...edge, selectedInMST: false };
      rejectedEdges.push(rejectedEdge);

      steps.push({
        stepNumber: steps.length + 1,
        currentEdge: rejectedEdge,
        action: 'CYCLE_REJECTED',
        edgeStatus: 'REJECTED',
        mstEdges: [...mstEdges],
        totalCostSoFar: totalCost,
        explanation: `Rejected edge ${edge.source} ↔ ${edge.destination} (₹${edge.costInCr} Cr). ${edge.source} and ${edge.destination} are already connected in the same component; adding this would form a redundant cycle!`,
      });
    }
  }

  return {
    mstEdges,
    rejectedEdges,
    totalCostCr: totalCost,
    totalDistanceKm: totalDistance,
    steps,
  };
}
