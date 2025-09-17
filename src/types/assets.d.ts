declare module '*.png' {
    const url: string;
    export default url;
}

declare module '*.json' {
    const data: any;
    export default data;
}

declare module '*.json?url' {
    const url: string;
    export default url;
}
