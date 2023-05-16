import { IReaction, IConfiguration, Overmind } from 'overmind';
export declare function createMixin<Config extends IConfiguration>(overmind: Overmind<Config>): {
    state: Config["state"] & {
        subscribe: (listener: any) => () => void;
    };
    actions: Config["actions"] extends infer T ? { [K in keyof T]: import("overmind").ResolveAction<Config["actions"][K]>; } : never;
    effects: Config["effects"] & {};
    addMutationListener: (cb: import("proxy-state-tree").IMutationCallback) => () => void;
    reaction: IReaction<Config>;
};
