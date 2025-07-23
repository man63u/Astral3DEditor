import {pow1024} from "./utils";

/**
 * 文件大小 字节转换单位
 * @param {number} size
 * @returns {string|*}
 */
export const filterSize = (size:number): string | any => {
    if (!size) return '';
    if (size < pow1024(1)) return size + ' B';
    if (size < pow1024(2)) return (size / pow1024(1)).toFixed(2) + ' KB';
    if (size < pow1024(3)) return (size / pow1024(2)).toFixed(2) + ' MB';
    if (size < pow1024(4)) return (size / pow1024(3)).toFixed(2) + ' GB';
    return (size / pow1024(4)).toFixed(2) + ' TB'
}

export const getServiceStaticFile = (url:string):string => {
    if(!url) return "";

    if(url.startsWith("blob:") || url.startsWith("data:") || url.startsWith("http:") || url.startsWith("https:")) return url;

    return `/file/static` + (url[0] === '/' ? '' : '/') + url;
}

