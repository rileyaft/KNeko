/*
 *  KNeko - an oneko implementation in kwinscript
 *
 *  SPDX-FileCopyrightText: 2026 Riley Tinkl <riley.aft@outlook.com>
 *
 *  SPDX-License-Identifier: GPL-3.0
 */

"use strict";

const followTypes = Object.freeze({
    mouse: 0,
    // windowTitlebar: 1,
    // inWindow: 2,
    // onTaskbar: 3,
    // stationary: 4
});

const virtualDesktopBehaviours = Object.freeze({
    trackAcross: 0,
    pinned: 1,
    locked: 2,
});

const catScales = Object.freeze({
    0: 0.25,
    1: 0.5,
    2: 0.75,
    3: 1,
    4: 1.25,
    5: 1.5,
    6: 1.75,
    7: 2,
    8: 2.5,
    9: 3,
    10: 4,
});

let catInstance = null;
let CONFIG;
function getCat(win) {
    if (win === "undefined" && catInstance) return catInstance;
    if (!catInstance) catInstance = new CatDriver(win);
    return catInstance;
}

function initState(root) {
    const sprite = CatDriver.spriteFinder(CONFIG.appearance);
    root.spriteSource = sprite.path;
    root.tileW = sprite.tileWidth;
    root.tileH = sprite.tileHeight;
    root.scale = CONFIG.catScale;
}

let cursor = {
    x: 0,
    y: 0,
};

function setCursorPos(curs_X, curs_Y) {
    ((cursor.x = curs_X), (cursor.y = curs_Y));
}

class CatDriver {
    constructor(win) {
        this.x = win.x;
        this.y = win.y;
        this.tile_X = -3;
        this.tile_Y = -3;

        this.target_X = 0;
        this.target_Y = 0;
        this.last_moved = Date.now();
        this.last_update = Date.now();
        this.anim_accum = 0;

        this.state = "idle";
        this.cooldown = {
            scratching: 0,
            think: 0,
            stuck: 0,
        };
        this.frame_count = 0;
        this.skip_frame = 0;
        this.anim_loops = 0;
    }

    tick() {
        const now = Date.now();
        const delta = now - this.last_update;
        this.last_update = now;

        this.anim_accum += delta;

        if (this.anim_accum >= CONFIG.timerSpeed) {
            const steps = Math.floor(this.anim_accum / CONFIG.timerSpeed);
            this.anim_accum -= steps * CONFIG.timerSpeed;

            this.frame_count += steps;
            this.doLogic();
        }
    }

    // Origin: Top left (0,0)
    // Down and right are positive
    doLogic() {
        if (this.skip_frame > 0) {
            this.skip_frame--;
        }
        CatDriver.targetFinder(this);
        const dx = this.target_X - this.x;
        const dy = this.target_Y - this.y;
        const hyp = Math.hypot(dx, dy);

        // print(`${JSON.stringify(dist)}`);

        if (hyp >= CONFIG.followRadius && hyp !== 0) {
            if (Date.now() - this.last_moved > CONFIG.idleTimeout) {
                this.doAlertState();
            }

            this.last_moved = Date.now();
            if (this.skip_frame <= 0) this.doFollowState({ dx, dy, hyp });
        } else {
            // Non-moving animations
            this.runCatState();
        }
    }

    static spriteFinder(id) {
        if (CONFIG.useUserSprite === true) {
            const obj = {
                path: CONFIG.userSpritePath,
            };
            return obj;
        } else
            return (
                Object.values(CatDriver.spriteList).find((s) => s.id === id) ||
                CatDriver.spriteList.Neko
            );
    }

    static directionFinder(dx, dy) {
        const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

        if (angle < -157 || angle >= 157) return "W";
        if (angle < -112) return "NW";
        if (angle < -67) return "N";
        if (angle < -22) return "NE";
        if (angle < 22) return "E";
        if (angle < 67) return "SE";
        if (angle < 112) return "S";
        return "SW";
    }

    // TODO: implement figuring out if the cat would get stuck, and calculating appropriate target
    static targetFinder(cat) {
        if (CONFIG.followType == followTypes["mouse"]) {
            cat.target_X = cursor.x + CONFIG.followOffsetX;
            cat.target_Y = cursor.y + CONFIG.followOffsetY;
        }
    }

    setAnimState(anim, frame) {
        const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
        const stuck = [
            "scratchWallN",
            "scratchWallE",
            "scratchWallS",
            "scratchWallW",
        ];

        if (directions.includes(anim)) {
            this.state = "moving";
        } else if (stuck.includes(anim)) {
            this.state = "stuck";
        } else if (anim === "grabbed") {
            // TODO: grabbed state animation handling
            // maybe return?
        } else this.state = anim;

        let sprite;
        if (frame === undefined) {
            const _frame = this.frame_count % CatDriver.spriteMap[anim].length;
            sprite = CatDriver.spriteMap[anim][_frame];
        } else sprite = CatDriver.spriteMap[anim][frame];

        this.tile_X = sprite[0];
        this.tile_Y = sprite[1];
    }

    setCooldown(state, scale) {
        this.cooldown[state] = Date.now() + scale * 1000;
    }

    runCatState() {
        if (this.state != "idle") {
            // Continue calling state if still active
            const methodName = CatDriver.stateHandlers[this.state];
            if (methodName && typeof this[methodName] === "function") {
                this[methodName]();
                return;
            }
            this.doIdleState();
        } else {
            // Decide which state to use
            const diff = Date.now() - this.last_moved;
            if (diff > CONFIG.sleepTimeout) {
                if (this.state != "sleeping") this.doTiredState();
                else this.doSleepState();
            }
            if (diff > CONFIG.idleTimeout) {
                let rnd = getRandomInt(100);
                if (rnd >= 90 && this.cooldown.think < Date.now()) {
                    this.doThinkState();
                } else if (rnd >= 85 && this.cooldown.scratching < Date.now()) {
                    this.doScratchState();
                }
            }
        }
    }

    // Alert state acts as an "override"
    doAlertState() {
        this.setAnimState("alert");
        this.skip_frame = 3;
    }
    doIdleState() {
        this.setAnimState("idle");
    }
    doTiredState() {
        if (this.state != "tired") {
            this.setAnimState("tired");
            this.skip_frame = 7;
        } else if (this.skip_frame <= 0) {
            this.setAnimState("sleeping", 0);
        }
    }
    doSleepState() {
        if (this.skip_frame <= 0) this.skip_frame = 14;
        if (this.skip_frame >= 7) this.setAnimState("sleeping", 0);
        else this.setAnimState("sleeping", 1);
    }
    doScratchState() {
        if (this.state != "scratching") {
            this.anim_loops = 14;
        }
        if (this.anim_loops <= 0) {
            this.setAnimState("idle");
            this.setCooldown("scratching", 5);
            return;
        }
        this.anim_loops--;
        this.setAnimState("scratching", this.anim_loops % 2);
    }
    doThinkState() {
        if (this.state != "think") {
            this.setAnimState("think");
            this.skip_frame = 7;
        } else if (this.skip_frame <= 0) {
            this.setAnimState("idle");
            this.setCooldown("think", 5);
        }
    }
    // TODO
    doStuckState() {
        //
    }
    doFollowState(dist) {
        const step = Math.min(dist.hyp, CONFIG.followSpeed);
        this.x += (dist.dx / dist.hyp) * step;
        this.y += (dist.dy / dist.hyp) * step;
        this.setAnimState(CatDriver.directionFinder(dist.dx, dist.dy));
    }
    // TODO
    doGrabState() {
        //
    }
}

(function initCatStatics() {
    CatDriver.spriteList = Object.freeze({
        Neko: {
            id: 0,
            path: "img/neko.png",
            tileWidth: 32,
            tileHeight: 32,
            width: 256,
            height: 128,
        },
        Black: {
            id: 1,
            path: "img/black.png",
            tileWidth: 32,
            tileHeight: 32,
            width: 256,
            height: 128,
        },
        Tabby: {
            id: 2,
            path: "img/tabby.png",
            tileWidth: 32,
            tileHeight: 32,
            width: 256,
            height: 128,
        },
        Calico: {
            id: 3,
            path: "img/calico.png",
            tileWidth: 32,
            tileHeight: 32,
            width: 256,
            height: 128,
        },
        Siamese: {
            id: 4,
            path: "img/siamese.png",
            tileWidth: 32,
            tileHeight: 32,
            width: 256,
            height: 128,
        },
        Maia: {
            id: 5,
            path: "img/maia.png",
            tileWidth: 32,
            tileHeight: 32,
            width: 256,
            height: 128,
        },
        Ghost: {
            id: 6,
            path: "img/ghost.png",
            tileWidth: 32,
            tileHeight: 32,
            width: 256,
            height: 128,
        },
        Fox: {
            id: 7,
            path: "img/fox.png",
            tileWidth: 32,
            tileHeight: 32,
            width: 256,
            height: 128,
        },
    });

    // Cred: https://github.com/adryd325/oneko.js
    // Thank you for this sane setup here, haha
    CatDriver.spriteMap = Object.freeze({
        idle: [[-3, -3]],
        alert: [[-7, -3]],
        think: [[-7, 0]],
        scratching: [
            [-5, 0],
            [-6, 0],
        ],
        scratchWallN: [
            [0, 0],
            [0, -1],
        ],
        scratchWallS: [
            [-7, -1],
            [-6, -2],
        ],
        scratchWallE: [
            [-2, -2],
            [-2, -3],
        ],
        scratchWallW: [
            [-4, 0],
            [-4, -1],
        ],
        tired: [[-3, -2]],
        sleeping: [
            [-2, 0],
            [-2, -1],
        ],
        N: [
            [-1, -2],
            [-1, -3],
        ],
        NE: [
            [0, -2],
            [0, -3],
        ],
        E: [
            [-3, 0],
            [-3, -1],
        ],
        SE: [
            [-5, -1],
            [-5, -2],
        ],
        S: [
            [-6, -3],
            [-7, -2],
        ],
        SW: [
            [-5, -3],
            [-6, -1],
        ],
        W: [
            [-4, -2],
            [-4, -3],
        ],
        NW: [
            [-1, 0],
            [-1, -1],
        ],
    });

    CatDriver.stateHandlers = Object.freeze({
        idle: "doIdleState",
        tired: "doTiredState",
        sleeping: "doSleepState",
        scratching: "doScratchState",
        think: "doThinkState",
        stuck: "doStuckState",
        grabbed: "doGrabState",
    });
})();

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

// A large majority of this is KHRONKITE verbatim.
// Talk about cobbled together code (mine, not theirs)

const Shortcut = {
    ToggleFollow: 1,
    ForceReload: 2,
};
const ShorcutsKeys = Object.keys(Shortcut);

class KWinConfig {
    constructor() {
        function separate(str, separator) {
            if (!str || typeof str !== "string") return [];
            return str
                .split(separator)
                .map((part) => part.trim())
                .filter((part) => part != "");
        }

        this.followType = KWIN.readConfig("FollowType", 0);
        this.followRadius = KWIN.readConfig("FollowRadius", 16);
        this.followWindowClass = separate(
            KWIN.readConfig(
                "FollowWindowClass",
                "org.kde.dolphin,zen-browser-bin",
            ),
            ",",
        );
        this.followOffsetX = KWIN.readConfig("FollowOffsetX", -32);
        this.followOffsetY = KWIN.readConfig("FollowOffsetY", -32);
        this.followSpeed = KWIN.readConfig("FollowSpeed", 15);
        this.idleTimeout = KWIN.readConfig("IdleTimeout", 1000);
        this.sleepTimeout = KWIN.readConfig("SleepTimeout", 10) * 1000;
        this.appearance = KWIN.readConfig("Appearance", 0);
        this.timerSpeed = KWIN.readConfig("AnimationInterval", 150);
        this.virtualDesktopBehaviour = KWIN.readConfig(
            "VirtualDesktopBehaviour",
            0,
        );
        this.useUserSprite = KWIN.readConfig("UseUserSprite", false);
        this.userSpritePath = KWIN.readConfig("UserSprite", "img/neko.png");
        this.catScale = catScales[KWIN.readConfig("CatScale", 3)];
    }
}

var KWINCONFIG;
var KWIN;
class KWinDriver {
    get currentSurface() {
        return new KWinSurface(
            this.workspace.activeWindow
                ? this.workspace.activeWindow.output
                : this.workspace.activeScreen,
            this.workspace.currentActivity,
            this.workspace.currentDesktop,
            this.workspace,
        );
    }
    set currentSurface(value) {
        const ksrf = value;
        if (this.workspace.currentDesktop.id !== ksrf.desktop.id)
            this.workspace.currentDesktop = ksrf.desktop;
        if (this.workspace.currentActivity !== ksrf.activity)
            this.workspace.currentActivity = ksrf.activity;
    }
    get currentWindow() {
        const client = this.workspace.activeWindow;
        return client ? this.windowMap.get(client) : null;
    }
    set currentWindow(window) {
        if (window !== null) {
            window.timestamp = new Date().getTime();
            this.workspace.activeWindow = window.window.window;
        }
    }
    get screens() {
        const screens = [];
        this.workspace.screens.forEach((screen) => {
            screens.push(
                new KWinSurface(
                    screen,
                    this.workspace.currentActivity,
                    this.workspace.currentDesktop,
                    this.workspace,
                ),
            );
        });
        return screens;
    }

    constructor(api) {
        KWIN = api.kwin;
        this.workspace = api.workspace;
        this.shortcuts = api.shortcuts;
        this.entered = false;
    }
    init() {
        CONFIG = KWINCONFIG = new KWinConfig();
        print(`Config: ${JSON.stringify(CONFIG)}`);
        print("loaded config");
    }

    bindShortcut() {
        this.shortcuts
            .getToggleFollow()
            .activated.connect(Shortcut.ToggleFollow);

        this.shortcuts.getForceReload().activated.connect(Shortcut.ForceReload);
    }
    connect(signal, handler) {
        const wrapper = (...args) => {
            if (typeof this.workspace === "undefined")
                signal.disconnect(wrapper);
            else this.enter(() => handler.apply(this, args));
            signal.connect(wrapper);
            return wrapper;
        };
    }
    enter(callback) {
        if (this.entered) return;

        this.entered = true;
        try {
            callback();
        } catch (e) {
            warning(`Error raised line: ${e.lineNumber}. Error: ${e}`);
        } finally {
            this.entered = false;
        }
    }
}

function warning(s) {
    print(`[KNeko.WARNING]: ${s}`);
}

function pass() {
    return;
}
