/**
 * @author ErSan
 * @email  mlt131220@163.com
 * @date   2025/4/10 0:29
 * @description html面板
 */
import {JSONMeta} from "three";
import {CSS3DObject, CSS3DSprite} from 'three/examples/jsm/renderers/CSS3DRenderer.js';

interface ILoadOptions {
    htmlContent?: string;
    url?: string;
    isSprite?: boolean;
}

class HtmlPlaneConverter {
    private static instance: HtmlPlaneConverter | null = null;

    private config = {
        // 是否允许执行脚本
        allowScripts: false,
        // 文件大小限制
        maxFileSize: 1024 * 500, // 500KB
        // 标签白名单
        notAllowedTags: ['iframe'],
    };

    private sandbox: { Math: Math; Date: DateConstructor };

    private constructor() {
        // 创建安全沙箱环境
        this.sandbox = this._createSandbox();

        // 配套CSS样式（需添加到页面）
        const style = document.createElement('style');
        style.textContent = `
.css3d-imported-content {
  pointer-events: none !important;
  // overflow: hidden;
}

.css3d-imported-content [style] {
  will-change: transform, opacity;
}
`;
        document.head.appendChild(style);
    }

    // 获取单例实例
    public static getInstance(): HtmlPlaneConverter {
        if (!HtmlPlaneConverter.instance) {
            HtmlPlaneConverter.instance = new HtmlPlaneConverter();
        }
        return HtmlPlaneConverter.instance;
    }

    // 创建安全沙箱
    private _createSandbox() {
        const sandbox = {
            Math,
            Date,
            // 其他允许的全局对象...
        };

        return new Proxy(sandbox, {
            has: () => true,
            get: (target, prop) => {
                return prop in target ? target[prop] : undefined;
            }
        });
    }

    // 主加载方法
    async loadAsync(options: ILoadOptions) {
        if(options.url){
            const response = await fetch(options.url);
            this._validateResponse(response);

            options.htmlContent = await response.text();
        }else if(!options.htmlContent){
            console.error('请输入htmlContent或url参数')
        }

        return this.parseToCSS3D(options);
    }

    // 安全验证方法
    private _validateResponse(response: Response) {
        if (!response.ok) throw new Error('加载失败');

        if (Number(response.headers.get('content-length')) > this.config.maxFileSize) {
            throw new Error('文件大小超出限制');
        }
    }

    // 解析HTML生成CSS3D对象
    parseToCSS3D(options:ILoadOptions) {
        if(!options.htmlContent) throw new Error('请输入htmlContent参数');

        // 创建容器
        const container = this._createContainer();

        // 解析文档
        const htmlDoc = this._parseHtml(options.htmlContent);

        // 克隆并处理内容
        const content = this._processContent(htmlDoc, options.url);

        // 仅添加content(body)的子节点
        while (content.firstChild) {
            container.appendChild(content.firstChild);
        }

        if(options.isSprite){
            return new HtmlSprite(container,options);
        }else{
            return new HtmlPlane(container,options);
        }
    }

    // 创建安全容器
    private _createContainer() {
        const container = document.createElement('div');

        // 应用样式隔离
        container.className = 'css3d-imported-content';
        return container;
    }

    // 使用DOMParser解析HTML结构
    private _parseHtml(content: string) {
        const parser = new DOMParser();
        return parser.parseFromString(content, "text/html");
    }

    // 处理文档内容
    private _processContent(htmlDoc: Document, baseUrl?: string) {
        const content = htmlDoc.body.cloneNode(true) as HTMLBodyElement;

        // 清理危险元素
        this._sanitizeContent(content);

        // 处理资源路径
        baseUrl && this._resolveResourcePaths(content, baseUrl);

        // 处理脚本
        if (this.config.allowScripts) {
            this._processScripts(content);
        }

        return content;
    }

    // 清理危险内容
    private _sanitizeContent(content: HTMLBodyElement) {
        // 删除不允许的标签
        content.querySelectorAll('*').forEach(node => {
            if (this.config.notAllowedTags.includes(node.tagName.toLowerCase())) {
                node.remove();
            }
        });

        // 删除危险属性
        const dangerousAttrs = ['onload', 'onerror', 'onclick'];
        content.querySelectorAll('*').forEach(node => {
            dangerousAttrs.forEach(attr => node.removeAttribute(attr));
        });
    }

    // 处理资源路径
    private  _resolveResourcePaths(content: HTMLBodyElement, baseUrl: string) {
        // 安全基础URL处理
        let validBase = this._getValidBaseUrl(baseUrl);

        const attrMap = {
            img: 'src',
            link: 'href',
            script: 'src',
            source: 'src',
            use: 'href'
        };

        Object.entries(attrMap).forEach(([tag, attr]) => {
            content.querySelectorAll(tag).forEach(element => {
                const value = element.getAttribute(attr);
                if (!value) return;

                try {
                    // 处理绝对路径
                    if (/^(https?:)?\/\//.test(value)) return;

                    // 智能路径拼接
                    const resolvedUrl = this._safeUrlResolve(value, validBase);
                    element.setAttribute(attr, resolvedUrl);
                } catch (e) {
                    console.error(`资源路径处理失败: ${tag} ${attr}="${value}"`, e);
                }
            });
        });
    }

    // 智能获取有效基础URL
    private _getValidBaseUrl(baseUrl: string) {
        try {
            // 优先使用传入的baseUrl
            if (baseUrl) return new URL(baseUrl).href;

            // 次选文档基础URI
            if (document.baseURI) return document.baseURI;

            // 最后使用当前页面URL
            return window.location.href;
        } catch (e) {
            // 极端情况下的容错处理
            return 'about:blank';
        }
    }

    // 安全路径解析方法
    private _safeUrlResolve(value: string, base: string) {
        // 处理根路径相对地址
        if (value.startsWith('/')) {
            return new URL(value, window.location.origin).href;
        }

        // 处理Windows文件路径 (C:\...)
        if (/^[a-zA-Z]:\\/.test(value)) {
            return `file:///${value.replace(/\\/g, '/')}`;
        }

        // 常规路径处理
        try {
            return new URL(value, base).href;
        } catch (e) {
            // 兜底处理：原始路径输出
            return value.startsWith('data:') ? value : `invalid-url://${value}`;
        }
    }

    // 处理脚本内容
    private _processScripts(content: HTMLBodyElement) {
        const scripts = content.querySelectorAll('script');
        scripts.forEach(script => {
            const newScript = document.createElement('script');
            try {
                const code = `with(sandbox){${script.textContent}}`;
                newScript.textContent = code;
                const execute = new Function('sandbox', code);
                execute(this.sandbox);
            } catch (e) {
                console.warn('脚本执行失败:', e);
            }
            script.replaceWith(newScript);
        });
    }
}

class HtmlPlane extends CSS3DObject {
    type = 'HtmlPlane';
    isHtmlPlane = true;
    private readonly options: ILoadOptions;

    constructor(element: HTMLElement,options: ILoadOptions) {
        super(element);

        this.options = options;
    }

    /**
     * 获取json配置
     */
    toJSON(meta?: JSONMeta) {
        const superJSON = super.toJSON(meta).object;

        return {
            metadata: {
                version: 4.6,
                type: 'Object',
                generator: 'HtmlPlane.toJSON'
            },
            object: {
                ...superJSON,
                type: this.type,
                options:this.options
            },
        } as any;
    }

    /**
     * 从json配置解析
     */
    static fromJSON(data:any) {
        return HtmlPlaneConverter.getInstance().parseToCSS3D(data.options);
    }
}

class HtmlSprite extends CSS3DSprite {
    type = 'HtmlSprite';
    isHtmlSprite = true;
    private readonly options: ILoadOptions;

    constructor(element: HTMLElement,options: ILoadOptions) {
        super(element);

        this.options = options;
    }

    /**
     * 获取json配置
     */
    toJSON(meta?: JSONMeta) {
        const superJSON = super.toJSON(meta).object;

        return {
            metadata: {
                version: 4.6,
                type: 'Object',
                generator: 'HtmlSprite.toJSON'
            },
            object: {
                ...superJSON,
                type: this.type,
                options:this.options
            },
        } as any;
    }

    /**
     * 从json配置解析
     */
    static fromJSON(data:any) {
        return HtmlPlaneConverter.getInstance().parseToCSS3D(data.options);
    }
}

export {HtmlPlaneConverter, HtmlPlane, HtmlSprite};