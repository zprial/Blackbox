import _chunk from 'lodash.chunk';
import { multiCSS } from './util'

const defaultOptions = {
  size: 3,
  cover: require('./demo.png'),
  blockSize: '100px'
}

export default class GridView {
  // options
  private readonly _options: GridViewOptions;
  // cache block's names
  private readonly _blockNames: string[] = [];
  // target dom
  protected readonly target: HTMLElement;

  constructor(selector: string | HTMLElement, options?: GridViewOptions) {
    this._options = Object.assign({}, defaultOptions, options);
    if (typeof selector === 'string') {
      this.target = document.querySelector(selector);
    } else if (selector instanceof HTMLElement) {
      this.target = selector;
    }
    if (!this.target || !(this.target instanceof HTMLElement)) {
      throw new Error(`can't find target dom by ${selector}!!!`);
    }
  }

  // Generate Grid By Options
  private generateGrid() {
    const { size, cover, blockSize } = this._options;

    this.target.style.cssText = `
      display: inline-grid;
      grid-gap: 1px;
      gap: 1px;
      grid-template-rows: repeat(${size}, ${blockSize});
      grid-template-columns: repeat(${size}, ${blockSize});
    `;
    // The total count of blocks
    const TOTAL_COUNT = size ** 2 - 1;
    for (let i = 0; i < TOTAL_COUNT; i++) {
      const div = document.createElement('div');
      const blockName = `block${i}`;
      this._blockNames.push(blockName);
      // Calc cover's position for every block
      const _xIndex = i % size;
      const _yIndex = parseInt(String(i / size));
      div.style.cssText = `
        grid-area: ${blockName};
        background: url("${cover}") -${multiCSS(_xIndex, blockSize)} -${multiCSS(_yIndex, blockSize)} no-repeat;
        background-size: ${multiCSS(size, blockSize)}
      `;
      this.target.appendChild(div);
    }
    this._blockNames.push('.');
    // Random this._blockName when first layout
    this._blockNames.sort(() => Math.random() > 0.5 ? 1 : -1);
  }

  // Layout Grid By grid-template-area
  public layoutGrid(layouts: string[] = this._blockNames) {
    const { size } = this._options;
    const chunks = _chunk(layouts, size)
    this.target.style.gridTemplateAreas = chunks.map(chunk => `'${chunk.join(' ')}'`).join(' ');
  }

  public init() {
    this.generateGrid();
    this.layoutGrid();
    return this;
  }
}
