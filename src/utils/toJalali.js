
import { toJalaali } from 'jalaali-js';

export function toJalali(dateStr) {
  const date = new Date(dateStr);
  const { gy, gm, gd } = { gy: date.getFullYear(), gm: date.getMonth() + 1, gd: date.getDate() };
  const { jy, jm, jd } = toJalaali(gy, gm, gd);
  return `${jd}/${jm}/${jy}`;
}
