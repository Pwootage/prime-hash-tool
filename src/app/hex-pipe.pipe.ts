import { Pipe, PipeTransform } from '@angular/core';
import {hex} from '../utils/crc32';

@Pipe({
  name: 'hex'
})
export class HexPipe implements PipeTransform {
  transform(value: number, args?: any): any {
    return hex(value);
  }

}
