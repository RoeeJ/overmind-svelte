"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMixin = void 0;
const overmind_1 = require("overmind");
const svelte_1 = require("svelte");
const IS_PRODUCTION = overmind_1.ENVIRONMENT === 'production';
let nextComponentId = 0;
function createMixin(overmind) {
    const componentId = nextComponentId++;
    let nextComponentInstanceId = 0;
    let currentFlushId = 0;
    const subscribe = (listener) => {
        // @ts-ignore
        const tree = overmind.proxyStateTreeInstance.getTrackStateTreeWithProxifier();
        const componentInstanceId = nextComponentInstanceId++;
        let isUpdating = false;
        const onUpdate = (_mutations, _paths, flushId) => {
            tree.track(onUpdate);
            currentFlushId = flushId;
            isUpdating = true;
            listener(tree.state);
        };
        tree.track(onUpdate);
        listener(tree.state);
        if (IS_PRODUCTION) {
            (0, svelte_1.afterUpdate)(() => {
                tree.stopTracking();
                isUpdating = false;
            });
        }
        else {
            (0, svelte_1.onMount)(() => {
                overmind.eventHub.emitAsync(overmind_1.EventType.COMPONENT_ADD, {
                    componentId,
                    componentInstanceId,
                    name: '',
                    paths: Array.from(tree.pathDependencies),
                });
            });
            (0, svelte_1.afterUpdate)(() => {
                tree.stopTracking();
                if (isUpdating) {
                    overmind.eventHub.emitAsync(overmind_1.EventType.COMPONENT_UPDATE, {
                        componentId,
                        componentInstanceId,
                        name: '',
                        flushId: currentFlushId,
                        paths: Array.from(tree.pathDependencies),
                    });
                }
                isUpdating = false;
            });
        }
        return () => {
            // @ts-ignore
            overmind.proxyStateTreeInstance.disposeTree(tree);
            overmind.eventHub.emitAsync(overmind_1.EventType.COMPONENT_REMOVE, {
                componentId,
                componentInstanceId: componentInstanceId,
                name: '',
            });
        };
    };
    const reaction = (...args) => {
        const dispose = overmind.reaction(...args);
        (0, svelte_1.onDestroy)(() => {
            dispose();
        });
        return dispose;
    };
    return {
        state: Object.assign(Object.assign({}, overmind.state), { subscribe }),
        actions: overmind.actions,
        effects: overmind.effects,
        addMutationListener: overmind.addMutationListener,
        reaction: reaction,
    };
}
exports.createMixin = createMixin;
//# sourceMappingURL=index.js.map