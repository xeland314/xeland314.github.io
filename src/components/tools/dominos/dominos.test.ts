import { describe, it, expect, beforeEach } from 'vitest';
import {
  createTile, isDouble, tileSum, flipTile, canChainToRight, canChainToLeft,
  canPlaceRight, canPlaceLeft, placeRight, placeLeft, chainScore, isClosedChain,
  buildFullSet, findMatchingTiles, scoreRemainingTiles, renderTileSVG,
  TILE_DIMENSIONS, resetIdCounter,
} from './dominos';
import type { PipCount, DominoTile } from './dominos';

beforeEach(() => {
  resetIdCounter();
});

describe('createTile', () => {
  it('creates tile with correct defaults', () => {
    const t = createTile(3, 5);
    expect(t.top).toBe(3);
    expect(t.bottom).toBe(5);
    expect(t.orientation).toBe("vertical");
    expect(t.size).toBe("medium");
    expect(t.id).toBe("tile-0");
  });

  it('creates tile with custom orientation and size', () => {
    const t = createTile(1, 2, "horizontal", "large");
    expect(t.orientation).toBe("horizontal");
    expect(t.size).toBe("large");
  });
});

describe('isDouble', () => {
  it('returns true for double tiles', () => {
    expect(isDouble(createTile(3, 3))).toBe(true);
  });

  it('returns false for non-double tiles', () => {
    expect(isDouble(createTile(2, 5))).toBe(false);
  });
});

describe('tileSum', () => {
  it('returns sum of both halves', () => {
    expect(tileSum(createTile(3, 4))).toBe(7);
    expect(tileSum(createTile(0, 0))).toBe(0);
    expect(tileSum(createTile(6, 6))).toBe(12);
  });
});

describe('flipTile', () => {
  it('swaps top and bottom', () => {
    const t = createTile(2, 5);
    const f = flipTile(t);
    expect(f.top).toBe(5);
    expect(f.bottom).toBe(2);
    expect(f.id).toBe(t.id);
  });
});

describe('canChainToRight / canChainToLeft', () => {
  it('empty chain always returns true', () => {
    expect(canChainToRight([], createTile(1, 2))).toBe(true);
    expect(canChainToLeft([], createTile(1, 2))).toBe(true);
  });

  it('can chain right when last.bottom === next.top', () => {
    const chain = [createTile(3, 4)];
    expect(canChainToRight(chain, createTile(4, 6))).toBe(true);
  });

  it('cannot chain right when no match', () => {
    const chain = [createTile(3, 4)];
    expect(canChainToRight(chain, createTile(5, 6))).toBe(false);
  });

  it('can chain left when first.top === prev.bottom', () => {
    const chain = [createTile(4, 5)];
    expect(canChainToLeft(chain, createTile(1, 4))).toBe(true);
  });

  it('cannot chain left when no match', () => {
    const chain = [createTile(4, 5)];
    expect(canChainToLeft(chain, createTile(1, 2))).toBe(false);
  });
});

describe('canPlaceRight / canPlaceLeft', () => {
  it('places regardless of orientation on right', () => {
    const chain = [createTile(3, 4)];
    expect(canPlaceRight(chain, createTile(4, 6))).toBe(true);
    expect(canPlaceRight(chain, createTile(6, 4))).toBe(true);
    expect(canPlaceRight(chain, createTile(1, 2))).toBe(false);
  });

  it('places regardless of orientation on left', () => {
    const chain = [createTile(4, 5)];
    expect(canPlaceLeft(chain, createTile(1, 4))).toBe(true);
    expect(canPlaceLeft(chain, createTile(4, 1))).toBe(true);
    expect(canPlaceLeft(chain, createTile(1, 2))).toBe(false);
  });
});

describe('placeRight / placeLeft', () => {
  it('places right without flip', () => {
    const chain = [createTile(3, 4)];
    const result = placeRight(chain, createTile(4, 6));
    expect(result).toHaveLength(2);
    expect(result[0].bottom).toBe(4);
    expect(result[1].top).toBe(4);
    expect(result[1].bottom).toBe(6);
  });

  it('places right with flip', () => {
    const chain = [createTile(3, 4)];
    const result = placeRight(chain, createTile(6, 4));
    expect(result).toHaveLength(2);
    expect(result[1].top).toBe(4);
    expect(result[1].bottom).toBe(6);
  });

  it('places left without flip', () => {
    const chain = [createTile(4, 5)];
    const result = placeLeft(chain, createTile(1, 4));
    expect(result).toHaveLength(2);
    expect(result[0].top).toBe(1);
    expect(result[0].bottom).toBe(4);
    expect(result[1].top).toBe(4);
  });

  it('places left with flip', () => {
    const chain = [createTile(4, 5)];
    const result = placeLeft(chain, createTile(4, 1));
    expect(result).toHaveLength(2);
    expect(result[0].top).toBe(1);
    expect(result[0].bottom).toBe(4);
  });

  it('returns original chain on no match right', () => {
    const chain = [createTile(3, 4)];
    const result = placeRight(chain, createTile(1, 2));
    expect(result).toBe(chain);
  });

  it('returns original chain on no match left', () => {
    const chain = [createTile(3, 4)];
    const result = placeLeft(chain, createTile(1, 2));
    expect(result).toBe(chain);
  });
});

describe('chainScore', () => {
  it('returns 0 for empty chain', () => {
    expect(chainScore([])).toBe(0);
  });

  it('returns first.top + last.bottom', () => {
    const chain = [createTile(2, 5), createTile(5, 3)];
    expect(chainScore(chain)).toBe(5);
  });
});

describe('isClosedChain', () => {
  it('returns false for empty or single', () => {
    expect(isClosedChain([])).toBe(false);
    expect(isClosedChain([createTile(3, 3)])).toBe(false);
  });

  it('returns true when first.top === last.bottom', () => {
    const chain = [createTile(3, 4), createTile(4, 3)];
    expect(isClosedChain(chain)).toBe(true);
  });

  it('returns false when not closed', () => {
    const chain = [createTile(3, 4), createTile(4, 5)];
    expect(isClosedChain(chain)).toBe(false);
  });
});

describe('buildFullSet', () => {
  it('builds standard double-six set', () => {
    const tiles = buildFullSet(6);
    expect(tiles).toHaveLength(28);
  });

  it('builds double-nine set', () => {
    const tiles = buildFullSet(9 as PipCount);
    expect(tiles).toHaveLength(55);
  });

  it('all tiles have valid pip counts', () => {
    const tiles = buildFullSet(6);
    tiles.forEach((t) => {
      expect(t.top).toBeGreaterThanOrEqual(0);
      expect(t.top).toBeLessThanOrEqual(6);
      expect(t.bottom).toBeGreaterThanOrEqual(0);
      expect(t.bottom).toBeLessThanOrEqual(6);
      expect(t.bottom).toBeGreaterThanOrEqual(t.top);
    });
  });
});

describe('findMatchingTiles', () => {
  it('returns all tiles for empty chain', () => {
    const hand = [createTile(1, 2), createTile(3, 4)];
    expect(findMatchingTiles([], hand, "right")).toEqual(hand);
  });

  it('finds right-side matches', () => {
    const chain = [createTile(3, 4)];
    const hand = [createTile(4, 6), createTile(1, 2)];
    const matches = findMatchingTiles(chain, hand, "right");
    expect(matches).toHaveLength(1);
    expect(matches[0].top).toBe(4);
  });

  it('finds left-side matches', () => {
    const chain = [createTile(4, 5)];
    const hand = [createTile(1, 4), createTile(2, 3)];
    const matches = findMatchingTiles(chain, hand, "left");
    expect(matches).toHaveLength(1);
    expect(matches[0].bottom).toBe(4);
  });
});

describe('scoreRemainingTiles', () => {
  it('returns 0 for empty hand', () => {
    expect(scoreRemainingTiles([])).toBe(0);
  });

  it('sums all pip counts', () => {
    const hand = [createTile(2, 3), createTile(5, 1)];
    expect(scoreRemainingTiles(hand)).toBe(11);
  });
});

describe('renderTileSVG', () => {
  it('returns valid SVG string', () => {
    const svg = renderTileSVG(createTile(3, 5));
    expect(svg).toContain('<svg');
    expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"');
    expect(svg).toContain('</svg>');
  });

  it('has correct dimensions for vertical medium tile', () => {
    const svg = renderTileSVG(createTile(1, 2, "vertical", "medium"));
    expect(svg).toContain('width="48"');
    expect(svg).toContain('height="96"');
  });

  it('has correct dimensions for horizontal large tile', () => {
    const svg = renderTileSVG(createTile(1, 2, "horizontal", "large"));
    expect(svg).toContain('width="144"');
    expect(svg).toContain('height="72"');
  });

  it('has divider line', () => {
    const svg = renderTileSVG(createTile(1, 1, "vertical"));
    expect(svg).toContain('<line');
  });

  it('has pip circles for non-zero halves', () => {
    const svg = renderTileSVG(createTile(3, 5));
    const circles = svg.match(/<circle/g);
    expect(circles).not.toBeNull();
    expect(circles!.length).toBe(8);
  });

  it('has no pips for zero halves', () => {
    const svg = renderTileSVG(createTile(0, 0));
    const circles = svg.match(/<circle/g);
    expect(circles).toBeNull();
  });
});

describe('TILE_DIMENSIONS', () => {
  it('small tile is 32x64', () => {
    expect(TILE_DIMENSIONS.small).toEqual({ w: 32, h: 64 });
  });

  it('medium tile is 48x96', () => {
    expect(TILE_DIMENSIONS.medium).toEqual({ w: 48, h: 96 });
  });

  it('large tile is 72x144', () => {
    expect(TILE_DIMENSIONS.large).toEqual({ w: 72, h: 144 });
  });

  it('all sizes maintain 1:2 ratio', () => {
    for (const dim of Object.values(TILE_DIMENSIONS)) {
      expect(dim.h / dim.w).toBe(2);
    }
  });
});
