import { describe, it, expect, beforeEach } from 'vitest';
import {
  createTile, isDouble, tileSum, flipTile, canChainToRight, canChainToLeft,
  canPlaceRight, canPlaceLeft, placeRight, placeLeft, chainScore, isClosedChain,
  buildFullSet, findMatchingTiles, scoreRemainingTiles, renderTileSVG,
  TILE_DIMENSIONS, resetIdCounter, layoutTiles, generatePattern,
  getSubsets, renderLayoutHTML,
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
    expect(svg).toContain('viewBox="0 0 100 200"');
  });

  it('has correct dimensions for horizontal large tile', () => {
    const svg = renderTileSVG(createTile(1, 2, "horizontal", "large"));
    expect(svg).toContain('width="72"');
    expect(svg).toContain('height="144"');
    expect(svg).toContain('viewBox="0 0 200 100"');
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

  it('pips are centered at 25/50/75 grid', () => {
    const svg = renderTileSVG(createTile(1, 1));
    expect(svg).toContain('cx="50" cy="50"');
    expect(svg).toContain('cx="50" cy="150"');
  });

  it('6-pip uses two columns at x=25 and x=75', () => {
    const svg = renderTileSVG(createTile(6, 6));
    expect(svg).toContain('cx="25"');
    expect(svg).toContain('cx="75"');
    const circles = svg.match(/<circle/g);
    expect(circles!.length).toBe(12);
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

describe('layoutTiles', () => {
  it('returns empty array for empty input', () => {
    expect(layoutTiles([], { mode: "grid", gap: 4 })).toEqual([]);
  });

  it('grid mode distributes tiles in columns', () => {
    const tiles = [createTile(1, 2), createTile(3, 4), createTile(5, 6)];
    const result = layoutTiles(tiles, { mode: "grid", gap: 4, columns: 2 });
    expect(result).toHaveLength(3);
    expect(result[0]).toEqual({ tile: tiles[0], x: 0, y: 0 });
    expect(result[1]).toEqual({ tile: tiles[1], x: 52, y: 0 });
    expect(result[2]).toEqual({ tile: tiles[2], x: 0, y: 100 });
  });

  it('grid mode auto-calculates columns', () => {
    const tiles = [createTile(1, 2), createTile(3, 4), createTile(5, 6)];
    const result = layoutTiles(tiles, { mode: "grid", gap: 4 });
    expect(result).toHaveLength(3);
    expect(result[0].x).toBe(0);
    expect(result[0].y).toBe(0);
  });

  it('row mode places all tiles in a single row', () => {
    const tiles = [createTile(1, 2), createTile(3, 4)];
    const result = layoutTiles(tiles, { mode: "row", gap: 4 });
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ tile: tiles[0], x: 0, y: 0 });
    expect(result[1]).toEqual({ tile: tiles[1], x: 52, y: 0 });
  });

  it('column mode places all tiles in a single column', () => {
    const tiles = [createTile(1, 2), createTile(3, 4)];
    const result = layoutTiles(tiles, { mode: "column", gap: 4 });
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ tile: tiles[0], x: 0, y: 0 });
    expect(result[1]).toEqual({ tile: tiles[1], x: 0, y: 100 });
  });

  it('free mode returns tiles with zero coordinates', () => {
    const tiles = [createTile(1, 2), createTile(3, 4)];
    const result = layoutTiles(tiles, { mode: "free", gap: 0 });
    expect(result).toHaveLength(2);
    expect(result[0].x).toBe(0);
    expect(result[0].y).toBe(0);
    expect(result[1].x).toBe(0);
    expect(result[1].y).toBe(0);
  });

  it('handles horizontal tiles in row mode', () => {
    const tiles = [createTile(1, 2, "horizontal"), createTile(3, 4, "horizontal")];
    const result = layoutTiles(tiles, { mode: "row", gap: 4 });
    expect(result[1].x).toBe(100);
  });

  it('handles horizontal tiles in column mode', () => {
    const tiles = [createTile(1, 2, "horizontal"), createTile(3, 4, "horizontal")];
    const result = layoutTiles(tiles, { mode: "column", gap: 4 });
    expect(result[1].y).toBe(52);
  });
});

describe('generatePattern', () => {
  it('generates correct fraccion pattern', () => {
    const result = generatePattern({
      rule: { type: "fraccion", topDelta: 2, bottomDelta: 3 },
      length: 4,
      startTop: 1,
      startBottom: 2,
    });
    expect(result).toHaveLength(4);
    expect(result[0].top).toBe(1);
    expect(result[0].bottom).toBe(2);
    expect(result[1].top).toBe(3);
    expect(result[1].bottom).toBe(5);
    expect(result[2].top).toBe(5);
    expect(result[2].bottom).toBe(1);
    expect(result[3].top).toBe(0);
    expect(result[3].bottom).toBe(4);
  });

  it('generates correct suma-constante pattern', () => {
    const result = generatePattern({
      rule: { type: "suma-constante", delta: 1 },
      length: 3,
      startTop: 0,
      startBottom: 0,
    });
    expect(result[0].top).toBe(0);
    expect(result[0].bottom).toBe(0);
    expect(result[1].top).toBe(1);
    expect(result[1].bottom).toBe(1);
    expect(result[2].top).toBe(2);
    expect(result[2].bottom).toBe(2);
  });

  it('generates espejo pattern', () => {
    const result = generatePattern({
      rule: { type: "espejo" },
      length: 3,
      startTop: 1,
      startBottom: 6,
    });
    expect(result[0].top).toBe(1);
    expect(result[0].bottom).toBe(6);
    expect(result[1].top).toBe(6);
    expect(result[1].bottom).toBe(1);
    expect(result[2].top).toBe(1);
    expect(result[2].bottom).toBe(6);
  });

  it('generates encadenado-clasico pattern', () => {
    const result = generatePattern({
      rule: { type: "encadenado-clasico" },
      length: 3,
      startTop: 0,
      startBottom: 1,
    });
    expect(result[0].top).toBe(0);
    expect(result[0].bottom).toBe(1);
    expect(result[1].top).toBe(1);
    expect(result[1].bottom).toBe(2);
    expect(result[2].top).toBe(2);
    expect(result[2].bottom).toBe(3);
  });

  it('generates alternado pattern', () => {
    const result = generatePattern({
      rule: { type: "alternado", valoresFijos: [1, 2, 3] },
      length: 4,
      startTop: 1,
      startBottom: 2,
    });
    expect(result[0].top).toBe(1);
    expect(result[0].bottom).toBe(2);
    expect(result[1].top).toBe(3);
    expect(result[1].bottom).toBe(1);
    expect(result[2].top).toBe(2);
    expect(result[2].bottom).toBe(3);
    expect(result[3].top).toBe(1);
    expect(result[3].bottom).toBe(2);
  });

  it('marks hideIndices as hidden', () => {
    const result = generatePattern({
      rule: { type: "suma-constante", delta: 1 },
      length: 4,
      hideIndices: [2, 3],
    });
    expect(result[0].isHidden).toBeFalsy();
    expect(result[1].isHidden).toBeFalsy();
    expect(result[2].isHidden).toBe(true);
    expect(result[3].isHidden).toBe(true);
  });

  it('wraps around with modulo 7', () => {
    const result = generatePattern({
      rule: { type: "suma-constante", delta: 1 },
      length: 8,
      startTop: 6,
      startBottom: 6,
    });
    expect(result[0].top).toBe(6);
    expect(result[6].top).toBe(5);
    expect(result[7].top).toBe(6);
  });
});

describe('renderTileSVG hidden', () => {
  it('renders question mark for hidden tile', () => {
    const tile = createTile(3, 5);
    tile.isHidden = true;
    const svg = renderTileSVG(tile);
    expect(svg).toContain('text');
    expect(svg).toContain('?</text>');
    expect(svg).toContain('#e8edef');
  });

  it('renders normal pips for non-hidden tile', () => {
    const svg = renderTileSVG(createTile(3, 5));
    expect(svg).toContain('<circle');
    expect(svg).not.toContain('?</text>');
  });
});

describe('getSubsets', () => {
  const tiles = [createTile(1, 2), createTile(3, 4), createTile(5, 6), createTile(0, 1)];

  it('returns all tiles for completa mode', () => {
    const result = getSubsets(tiles, { mode: "completa" });
    expect(result).toHaveLength(1);
    expect(result[0]).toHaveLength(4);
  });

  it('returns filtered tiles for seleccion mode', () => {
    const result = getSubsets(tiles, { mode: "seleccion", indices: [0, 2] });
    expect(result).toHaveLength(1);
    expect(result[0]).toHaveLength(2);
    expect(result[0][0].top).toBe(1);
    expect(result[0][1].top).toBe(5);
  });

  it('returns chunks for segmentado mode', () => {
    const result = getSubsets(tiles, { mode: "segmentado", segmentSize: 2 });
    expect(result).toHaveLength(2);
    expect(result[0]).toHaveLength(2);
    expect(result[1]).toHaveLength(2);
    expect(result[0][0].top).toBe(1);
    expect(result[1][0].top).toBe(5);
  });

  it('handles uneven chunks', () => {
    const result = getSubsets(tiles, { mode: "segmentado", segmentSize: 3 });
    expect(result).toHaveLength(2);
    expect(result[0]).toHaveLength(3);
    expect(result[1]).toHaveLength(1);
  });

  it('returns all tiles when no indices provided in seleccion', () => {
    const result = getSubsets(tiles, { mode: "seleccion" });
    expect(result).toHaveLength(1);
    expect(result[0]).toHaveLength(4);
  });

  it('returns all tiles when no segmentSize in segmentado', () => {
    const result = getSubsets(tiles, { mode: "segmentado" });
    expect(result).toHaveLength(1);
    expect(result[0]).toHaveLength(4);
  });
});

describe('renderLayoutHTML', () => {
  it('returns empty string for empty tiles', () => {
    expect(renderLayoutHTML([], { mode: "grid", gap: 4 })).toBe("");
  });

  it('returns HTML string with grid layout', () => {
    const tiles = [createTile(1, 2), createTile(3, 4)];
    const html = renderLayoutHTML(tiles, { mode: "grid", gap: 4, columns: 2 });
    expect(html).toContain('<div');
    expect(html).toContain('relative');
    expect(html).toContain('position:absolute');
    expect(html).toContain('<svg');
  });

  it('returns HTML with row layout', () => {
    const tiles = [createTile(1, 2), createTile(3, 4)];
    const html = renderLayoutHTML(tiles, { mode: "row", gap: 4 });
    expect(html).toContain('position:absolute');
  });
});
