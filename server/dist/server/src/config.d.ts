export declare const config: {
    readonly server: {
        readonly port: number;
        readonly host: string;
    };
    readonly socket: {
        readonly cors: {
            readonly origin: "*";
            readonly methods: readonly ["GET", "POST"];
        };
        readonly pingTimeout: 15000;
        readonly pingInterval: 5000;
    };
    readonly db: {
        readonly path: "./data/battlemind.db";
    };
    readonly logs: {
        readonly dir: "./logs";
        readonly level: string;
    };
};
//# sourceMappingURL=config.d.ts.map