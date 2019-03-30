import _chunk from 'lodash.chunk';
import _debounce from 'lodash.debounce';
import _concat from 'lodash.concat';
import Hammer from 'hammerjs';
import { multiCSS, simpleGetUnit } from './util';

const defaultOptions = {
  frames: 3,
  cover: require('./demo.png'),
  size: document.body.clientWidth
}

// The attribute name for block
const BLOCK_AREA_NAME = 'data-grid-area-name';

export default class GridView {
  // is inited?
  private _isInited: boolean;
  // options
  private _options: GridViewOptions;
  // cache block's names
  private _blockNames: string[] = [];
  private _blockNamesBk: string[] = [];
  // target dom
  protected grid: HTMLElement;

  constructor(selector: string | HTMLElement, options?: GridViewOptions) {
    this._options = Object.assign({}, defaultOptions, options);
    if (typeof selector === 'string') {
      this.grid = document.querySelector(selector);
    } else if (selector instanceof HTMLElement) {
      this.grid = selector;
    }
    if (!this.grid || !(this.grid instanceof HTMLElement)) {
      throw new Error(`can't find target dom by ${selector}!!!`);
    }
  }

  // Splick 'block' chunks by size
  private getChunksBySize(layouts: string[] = this._blockNames) {
    const { frames } = this._options;
    return _chunk(layouts, frames);
  }

  // Generate Grid By Options
  private generateGrid() {
    const { frames, cover, size } = this._options;
    const _size = simpleGetUnit(size);
    // Every block's size
    const blockSize = `${_size.value / frames}${_size.unit || 'px'}`;
    this.grid.style.cssText = `
      width: ${_size.unit ? size : `${size}px`};
      height: ${_size.unit ? size : `${size}px`};
      display: grid;
      grid-gap: 1px;
      gap: 1px;
      grid-template-rows: repeat(${frames}, 1fr);
      grid-template-columns: repeat(${frames}, 1fr);
    `;
    // The total count of blocks
    const TOTAL_COUNT = frames ** 2 - 1;
    for (let i = 0; i < TOTAL_COUNT; i++) {
      const div = document.createElement('div');
      const blockName = `block${i}`;
      this._blockNames.push(blockName);
      // Calc cover's position for every block
      const _xIndex = i % frames;
      const _yIndex = parseInt(String(i / frames));
      div.style.cssText = `
        grid-area: ${blockName};
        background: url("${cover}") -${multiCSS(_xIndex, blockSize)} -${multiCSS(_yIndex, blockSize)} no-repeat;
        background-size: ${multiCSS(frames, blockSize)}
      `;
      div.setAttribute(BLOCK_AREA_NAME, blockName);
      this.grid.appendChild(div);
    }
    this._blockNames.push('.');
    this._blockNamesBk = [...this._blockNames];
    // Random this._blockName when first layout
    this._blockNames.sort(() => Math.random() > 0.5 ? 1 : -1);
  }

  // Layout Grid By grid-template-area
  private layoutGrid() {
    const chunks = this.getChunksBySize();
    this.grid.style.gridTemplateAreas = chunks.map(chunk => `'${chunk.join(' ')}'`).join(' ');
  }

  // Init Event Listener
  private initEvent() {
    const hammertime = new Hammer(this.grid);
    hammertime.get('pan').set({ direction: Hammer.DIRECTION_ALL });
    hammertime.on('panleft panright panup pandown', this.panHandler);
  }
  
  private panHandler = _debounce((evt) => {
    const _target = evt.target;
    const blockName = _target.getAttribute(BLOCK_AREA_NAME);
    // If no blockName, it's means that is a blank block
    if (!blockName) return;
    const blankPos = this.getBlockPos('.');
    const blockPos = this.getBlockPos(blockName);
    const chunks = this.getChunksBySize();
    switch(evt.additionalEvent) {
      case 'panleft':
      case 'panright':
        // If blank and block is not a same row, you can't move it
        if (blankPos.y !== blockPos.y) return;
        const _targetRow = chunks[blockPos.y];
        _targetRow.splice(blankPos.x, 1);
        _targetRow.splice(blockPos.x, 0, '.');
        break;
      case 'panup':
      case 'pandown':
        // If blank and block is not a same column, you can't move it
        if (blankPos.x !== blockPos.x) return;
        const _targetColumns = chunks.map(chunk => chunk[blockPos.x]);
        _targetColumns.splice(blankPos.y, 1);
        _targetColumns.splice(blockPos.y, 0, '.');
        chunks.forEach((chunk, index) => chunk[blankPos.x] = _targetColumns[index]);
        break;
      default:
        break;
    }
    this._blockNames = _concat(...chunks);
    this.layoutGrid();
    setTimeout(() => {
      if (typeof this._options.onSuccess === 'function' && this.checkSucced()) {
        this._options.onSuccess()
      }
    })
  }, 100);

  // Get block's position
  private getBlockPos(blockName: string) {
    const { frames } = this._options;
    const index = this._blockNames.findIndex(bn => bn === blockName);
    return {
      x: index % frames,
      y: parseInt(String(index / frames))
    }
  }

  checkSucced() {
    return this._blockNames.join('') === this._blockNamesBk.join('');
  }

  // init gridview
  public init() {
    this.generateGrid();
    this.layoutGrid();
    this.initEvent();
    this._isInited = true;
    return this;
  }

  // reset gridview
  public reset() {
    if (!this._isInited) {
      this.init();
    } else {
      this._blockNames.sort(() => Math.random() > 0.5 ? 1 : -1);
      this.layoutGrid();
    }
    return this;
  }
}
