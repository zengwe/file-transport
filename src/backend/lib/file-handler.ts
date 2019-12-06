import * as fs from 'fs';
import * as path from 'path';
import { mkdirs } from '../../utls/file-system';
export class FileHandle {
    fd: number;
    info: {start: number, end: number}[];
    fullPath: string;
    option: {tempSubfix: string, complete: {():void}, error: {(msg: string):void}, infoFileName: string;}
    constructor(
        protected where: string,
        protected  name: string,
        protected  hash: string,
        protected  size: number,
        protected fileMd5Func: {(where: string): string},
        protected logger: {trace: any,debug: any, info: any,warn: any;error: any},
        options = {}
        ) {
        this.fullPath = path.join(where, name);
        this.option = Object.assign({
            tempSubfix: '.zwtmp',
            infoFileName: '.file_complate_Status',
            complete: () => {

            },
            error: (msg: string) => {

            }
        }, options);
        this.init();
    }
    /**
     * @description 检查文件上传信息及存在情况
     * 
     */
    async init() {
        if(fs.existsSync(this.where)) {
            mkdirs(this.where);
        } 
        await this.createFile();    
    }
    protected createFile() {
        return new Promise(resolve => {
            fs.open(this.fullPath + this.option.tempSubfix, 'w+', (err, fd) => {
                if(err) {
                    this.logger.error(err);
                    return false;
                }
                fs.ftruncateSync(fd, this.size);
                this.fd = fd;
            });            
        });
    }
    write(data: Buffer, start: number) {
        return new Promise(resolve => {
            fs.write(this.fd, data,0, data.length, start, (err) => {
                this.completeBuffer(start, start + data.length);
                this.check();
                resolve(err == null);
            });
        });
    }
    protected check(): Promise<boolean> {
        return new Promise(resolve => {
            if(this.info.length > 0 && this.info[0].start == 0 && this.info[0].end == this.size) {
                fs.close(this.fd, (err) => {
                    if(err != null) {
                        return this.logger.error(`${this.where}/${this.name} close error`+err);
                    }
                    if((this.fileMd5Func(`${this.where}/${this.name}`) == this.hash)) {
                        fs.rename(this.fullPath + this.option.tempSubfix, this.fullPath, (err) => {
                            if(err) {
                                this.option.error(JSON.stringify(err));
                                return;
                            }
                            this.option.complete();
                        });
                    } else {
                        this.option.error('file hash is not equal!');
                        fs.unlinkSync(this.fullPath + this.option.tempSubfix);
                    }
                });
            } else {
                return resolve(false);
            }            
        });
    }
    completeBuffer(start: number, end: number) {
        if(this.info.length < 2) {
            if(this.info.length == 0) {
                this.info.push({start: start, end: end});
                return;
            }
            if(end < this.info[1].start) {
                this.info.unshift({start: start, end: end});
                return;
            }
            if(start > this.info[1].end) {
                this.info.push({start: start, end: end});
            }
            let temp = [start, end, this.info[1].start, this.info[1].end].sort((a,b) => a - b);
            this.info = [{start: temp[0], end: temp[3]}];
        } else {
            let startArr = 0;
            let count = 0;
            let tempArr: {start: number, end: number}[] = [{start: start, end: end}];
            for(let i = 0; i < this.info.length; i++) {
                if(start < this.info[i].start) {
                    if(i > 0) {
                        if(start <= this.info[i-1].end + 1) {
                            startArr = i-1;
                            tempArr.push(this.info[i-1]);
                            count++;
                        }else{
                            startArr = i;
                        }
                    }
                    for(let j = i; j < this.info.length; j++) {
                        if(this.info[j].start > end + 1) {
                            break;
                        }else{
                            count++;
                            tempArr.push(this.info[j]);
                        }
                    }
                    let vals: number[] = []
                    tempArr.forEach(item => {
                        vals.push(item.start, item.end);
                    });
                    vals = vals.sort((a, b) => a-b);
                    if(vals.length > 0) {
                        this.info.splice(startArr, count, {start: vals[0], end: vals[vals.length -1]});
                    }
                    break;
                }
            }
        }
    }
    destroy() {

    }
}
export function createFileHandleFactory(md5: any, logger: any) {
    return (where: string,name: string,hash: string,size: number) => {
        return new FileHandle(where,name,hash, size, md5, logger);
    }
}