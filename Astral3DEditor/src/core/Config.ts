import { Storage } from "@/core/Storage";

class Config {
    protected storage: Storage;
    public config: { [s: string]: any };

    constructor(storage: Storage) {
        this.storage = storage;

        this.config = {
            // 历史记录功能是否启用
            history: false,
            // 快捷键相关配置
            shortcuts: {
                translate: 'w',
                rotate: 'e',
                scale: 'r',
                undo: 'z',
                focus: 'f',
            },
            // cad图纸功能相关配置
            cad: {}
        };

        for (let key of Object.keys(this.config)) {
            this.storage.getConfigItem(key).then(_value => {
                if (_value === null) {
                    this.storage.setConfigItem(key, this.config[key])
                } else {
                    let newVal = _value;
                    // 有可能会在代码开发过程中增加新的配置项
                    if (this.config[key] && typeof this.config[key] === "object") {
                        newVal = Object.assign({}, this.config[key], _value);
                    }
                    this.config[key] = newVal;

                    if (newVal !== _value) {
                        this.storage.setConfigItem(key, newVal)
                    }
                }
            }).catch(() => {
                this.storage.setConfigItem(key, this.config[key])
            })
        }
    }

    getKey(key) {
        return this.config[key];
    }

    setKey(...args) {
        // key, value, key, value ...
        for (let i = 0, l = args.length; i < l; i += 2) {
            this.config[args[i]] = args[i + 1];
            this.storage.setConfigItem(args[i], args[i + 1])
        }
    }

    /**
     * 获取快捷键配置
     * @param {string} key
     */
    getShortcutItem(key: string) {
        return this.config.shortcuts[key];
    }

    /**
     * 设置快捷键
     * @param {string} key
     * @param {any} value
     */
    setShortcutItem(key: string, value: any) {
        this.config.shortcuts[key] = value;
        return this.storage.setConfigItem("shortcuts", this.config.shortcuts)
    }

    clear() {
        this.storage.dbs.configDB.clear();
    }
}

export { Config };
