import * as fs from 'fs';
import * as path from 'path';
export function mkdirs(dirpath: string) {
    let dirname = path.dirname(dirpath);
    if(fs.existsSync(dirname)) return;
    if (!fs.existsSync(dirname)) {
      mkdirs(dirname);
    }
    fs.mkdirSync(dirname);
}