/**
 * 拆分css带单位的属性值
 * @param cssSizeValue 带单位的css属性值
 */
export function simpleGetUnit(cssSizeValue: string | number = '') {
    const value = parseFloat(String(cssSizeValue)) || 0;
    return {
      value,
      unit: String(cssSizeValue).replace(String(value), '') || ''
    }
  }
  
  // 对带有单位的尺寸做乘法
  export function multiCSS(num: number, size: string | number) {
    const { value, unit } = simpleGetUnit(size);
    return `${num * value}${unit}`;
  }
  