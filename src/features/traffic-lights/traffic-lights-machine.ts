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
                    target: 'red', actions: [sendParent({type: 'WALK.ENDED'}), () => {
                        console.log('sendParent WALK.ENDED');
                    }],
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
        initial: "green",
        states: {
            green: {
                entry: [
                    (context, event) => {
                        console.log("GREEN!");
                    },
                    assign({
                        child: (context) => context.child || spawn(walkMachine)
                    }),
                    assign({
                        count: (context) => {
                            return context.count + 1;
                        },
                    }),
                ],
                after: {
                    "5000": {
                        cond: "isNotBlocked",
                        target: "green_switching",
                    },
                },
                on: {
                    NEXT: {
                        actions: (context, event) => {
                            console.log("switching to yellow");
                        },
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
                entry: [
                    (context) => {
                        console.log('RED!')
                    }
                ],
                after: {
                    5000: {target: "red_switching", cond: "isNotWalking"},
                    2000: {cond: "isNeedWalk", actions: send({type: 'WALK'}, {to: (context) => context.child})}
                },
                on: {
                    NEXT: {
                        cond: "isNotBlocked",
                        target: "green",
                    },
                    "WALK.ENDED": {
                        actions: [
                            assign({count: 0}),
                            () => {
                                console.log('WALK_ENDED!')
                            }
                        ],
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
