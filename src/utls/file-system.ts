import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
export function mkdirs(dirpath: string) {
    let dirname = path.dirname(dirpath);
    if (fs.existsSync(dirname)) return;
    if (!fs.existsSync(dirname)) {
        mkdirs(dirname);
    }
    fs.mkdirSync(dirname);
}
/**
 *
 *
 * @export
 * @param {{[key: string]: any}} obj
 * @returns
 * @description 返回Object的 keys
 */
export function getPropertyes(obj: { [key: string]: any }) {
    try {
        let keys: string[] = [];
        for (let key in obj) {
            keys.push(key);
        }
        return keys;
    } catch (error) {
        console.warn('the val is not Object!');
        return [];
    }
}
/**
 *
 * @description 判断对象是否包含keys
 * @export
 * @param {{[key: string]: any}} obj
 * @param {string[]} keys
 * @returns {boolean}
 */
export function contain(obj: { [key: string]: any }, keys: string[]) {
    for (let key of keys) {
        if (!(key in obj)) {
            return false;
        }
    }
    return true;
}
export function readSyncByRl(tips, def = ''): Promise<string> {
    tips = tips || '> ';
    return new Promise((resolve) => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        rl.question(tips, (answer) => {
            rl.close();
            let res = answer.trim();
            if (res == '') {
                res = def;
            }
            resolve(res);
        });
    });
}
export function readFileList(dir: string, filesListL: string[] = [], rootPath: string) {
    const files = fs.readdirSync(dir);
    files.forEach((item, index) => {
        var fullPath = path.join(dir, item);
        let temp = {
            name: '',
            isDir: true,
            fullPath: '',
            size: 0,
            children: []
        }
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            temp.name = item,
                temp.isDir = true;
            readFileList(path.join(dir, item), temp.children, rootPath);  //递归读取文件
        } else {
            temp.isDir = false;
            temp.name = item;
            temp.size = stat.size
        }
        temp.fullPath = path.join(dir, item).replace(rootPath, '');
        filesList.push(temp);
    });
    return filesList;
}
/**
 *
 *
 * @export
 * @param {string} where 文件或文件夹路径
 * @returns
 */
export function deleteFolderRecursive(where: string) {
    if (fs.existsSync(where)) {
        if (fs.statSync(where).isDirectory() == false) {
            return fs.unlinkSync(where);
        }
        fs.readdirSync(where).forEach(function (file) {
            var curPath = where + "/" + file;
            if (fs.statSync(curPath).isDirectory()) { // recurse
                deleteFolderRecursive(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(where);
    }
};
export function showLetter(callback: { (res: string[]): void }): void {
    let wmicResult: any;
    let command = exec('wmic logicaldisk get caption', function (err, stdout, stderr) {
        if (err || stderr) {
            return;
        }
        wmicResult = stdout;
    });
    command.stdin.end();
    command.on('close', function (code: any) {
        var data = wmicResult.split('\n'), result = {};
        let res: string[] = [];
        for (let item of data) {
            if (item.indexOf(':') != -1) {
                res.push((<string>item).substring(0, item.indexOf(':')));
            }
        }
        callback(res);
    });
}