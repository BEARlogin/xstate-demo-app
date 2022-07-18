const {assign, createMachine, Machine, send, sendParent, spawn, interpret} = require("xstate");


const walkMachine = createMachine({
    id: 'child',
    context: {},
    initial: 'red',
    states: {
        red: {
            on: {
                WALK: 'green'
            }
        },
        green_switching: {
            after: {
                3000: {
                    target: 'red', actions: sendParent({type: 'WALK.ENDED'}),
                }
            }
        },
        green: {
            after: {
                5000: {
                    target: 'green_switching'
                }
            }
        }
    }
})


export const trafficLightsMachine = createMachine({
        context: {count: 0, blocked: false, child: null},
        id: "parent",
        on: {
            BLOCK: {
                actions: assign({
                    blocked: true,
                }),
            },
            UNBLOCK: {
                actions: [
                    assign({
                        blocked: false,
                    }),
                    send("NEXT"),
                ],
            },
        },
        initial: "init",
        states: {
            init: {
                entry: assign({
                    child: (context) => spawn(walkMachine)
                }),
                always: {target: 'green'},
            },
            green: {
                entry: assign({
                    count: (context) => {
                        return context.count + 1;
                    },
                }),
                after: {
                    "5000": {
                        cond: "isNotBlocked",
                        target: "green_switching",
                    },
                },
                on: {
                    NEXT: {
                        cond: "isNotBlocked",
                        target: "green_switching",
                    },
                },
            },
            green_switching: {
                after: {
                    "3000": {
                        target: "yellow",
                    },
                },
            },
            yellow: {
                after: {
                    "2000": {
                        target: "red",
                    },
                },
                on: {
                    NEXT: {
                        target: "red",
                    },
                },
            },
            red: {
                after: {
                    5000: {target: "red_switching", cond: "isNotWalking"},
                    2000: {cond: "isNeedWalk", actions: send({type: 'WALK'}, {to: (context) => context.child})}
                },
                on: {
                    NEXT: {
                        cond: "isNotBlocked",
                        target: "red_switching",
                    },
                    "WALK.ENDED": {
                        actions: assign({count: 0}),
                        target: 'red_switching'
                    },
                },
            },
            red_switching: {
                after: {
                    "3000": {
                        target: "green",
                    },
                },
            },
        },
    },
    {
        guards: {
            isNotBlocked: (context, event) => {
                return !context.blocked;
            },
            isNotWalking: (context, event) => {
                return !context.blocked && context.child.getSnapshot.value !== 'green' && context.count < 2
            },
            isNeedWalk: (context, event) => {
                return !context.blocked && context.count === 2
            },
        },
    }
);
