/// <reference types="node" />
export interface KVToJSOptions {
    AutoConvertToArray?: boolean;
    /** 数组的分隔符 目前是 竖杠 | 和 # 号 */
    ArraySeperator?: string;
    /** 是否自动合并#base */
    AutoMergeBases?: boolean;
}
export declare function kvToJS(options?: KVToJSOptions): import("stream").Transform;
