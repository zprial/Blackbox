import _chunk from 'lodash.chunk';

const defaultOptions = {
  rows: 3,
  columns: 3,
  cover: require('./demo.png'),
  blockSize: '100px'
}

function simpleGetUnit(str: string = '') {
  const value = parseFloat(str) || 0;
  return {
    value,
    unit: str.replace(String(value), '') || '';
  }
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
    const { rows, columns, cover, blockSize } = this._options;
    const blockSizeObj = simpleGetUnit(blockSize)

    this.target.style.cssText = `
      display: inline-grid;
      grid-template-rows: repeat(${rows}, ${blockSize});
      grid-template-columns: repeat(${columns}, ${blockSize});
    `;
    // The total count of blocks
    const TOTAL_COUNT = rows * columns - 1;
    for (let i = 0; i < TOTAL_COUNT; i++) {
      const div = document.createElement('div');
      const blockName = `block${i}`;
      this._blockNames.push(blockName);
      const remainder = i % rows;
      console.log('remainder:', remainder)
      div.style.cssText = `
        grid-area: ${blockName};
        background: url("${cover}") -${remainder * blockSizeObj.value}${blockSizeObj.unit} no-repeat left top;
        background-size: cover;
      `;
      this.target.appendChild(div);
    }
    this._blockNames.push('.');
    // Random this._blockName when first layout
    this._blockNames.sort((b1, b2) => Math.random() > 0.5 ? 1 : -1);
  }

  // Layout Grid By grid-template-area
  public layoutGrid(layouts: string[] = this._blockNames) {
    const { columns } = this._options;
    const chunks = _chunk(layouts, columns)
    this.target.style.gridTemplateAreas = chunks.map(chunk => `'${chunk.join(' ')}'`).join(' ');
  }

  public init() {
    this.generateGrid();
    this.layoutGrid();
    return this;
  }
}
