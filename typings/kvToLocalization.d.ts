/// <reference types="node" />
export interface KVToLocalizationOptions {
    /**
     * 自定义的前缀
     * @type {Record<string, string>}
     * @memberof KVToLocalizationOptions
     */
    customPrefix?: (key: string, data: any, filePath: string) => string;
    /**
     * 需要输出的自定义后缀
     * @type {Record<string, string[]>}
     * @memberof KVToLocalizationOptions
     */
    customSuffix?: (key: string, data: any, filePath: string) => string[];
    /**
     * 如果有其他需要的自定义的token，在这个方法里面提供
     *
     * @memberof KVToLocalizationOptions
     */
    customToken?: (key: string, data: any, filePath: string) => string[];
    /**
     * 获取了这个kv项的所有token之后，可以使用这个方法来过滤掉不需要的token
     * @memberof KVToLocalizationOptions
     */
    transformTokenName?: (tokens: string[], key: string, data: any, filePath: string) => string[];
    /**
     * 自定义的忽略规则，因为不是所有的kv都需要本地化，比如某些kv是用来记录一些数据的，不需要本地化
     * 这里提供的默认规则是只有有BaseClass的才会被本地化
     * @memberof KVToLocalizationOptions
     */
    customIgnoreRule?: (fileName: string, key: string, data: any, filePath: string) => boolean;
    /**
     * 是否导出技能kv中的modifier
     *
     * @type {boolean}
     * @memberof KVToLocalizationOptions
     */
    exportKVModifiers?: boolean;
    /**
     * 是否导出技能kv中的AbilityValues
     * @type {boolean}
     * @memberof KVToLocalizationOptions
     */
    exportAbilityValues?: boolean;
}
export declare function pushNewTokensToCSV(csvFilePath: string, tokens: string[]): void;
export declare function localsToCSV(localsPath: string, csvFilePath: string): void;
export declare function pushNewLinesToCSVFile(csvFilePath: string, localData: {
    KeyName: string;
    [key: string]: string;
}[]): void;
export declare function pushNewLocalTokenToCSV(csvFilePath: string, locals: {
    [key: string]: string;
}[]): void;
export declare function updateLocalFilesFromCSV(localsPath: string, // 要输出的本地化文件的路径
existedLocalsPath?: string, // 其他包含本地化文本的文件夹，包括addon_*.txt，或者其他的以本插件格式保存的csv文件
languages?: string[], extraTokens?: string[], override?: boolean): void;
export declare function csvToLocals(localsPath: string): import("stream").Transform;
export declare function kvToLocalsCSV(csvPath: string, options?: KVToLocalizationOptions): import("stream").Transform;
