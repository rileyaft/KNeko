/*
 *  KNeko - an onkeo implementation in kwinscript
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

const spriteList = Object.freeze({
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
const spriteMap = Object.freeze({
    idle: [[-3, -3]],
    alert: [[-7, -3]],
    think: [[-7, 0]],
    scratchSelf: [
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

let cat = {
    target_X: 0,
    target_Y: 0,
    last_moved: Date.now(),
    state: "idle",
    cooldown: {
        scratching: 0,
        thinking: 0,
        stuck: 0,
    },
    frame_count: 0,
    skip_frame: 0,
};

const stateHandlers = Object.freeze({
    idle: pass,
    alert: pass,
    moving: doIdleState,
    tired: doTiredState,
    sleeping: doSleepState,
    scratching: doScratchState,
    think: doThinkState,
    stuck: doStuckState,
    grabbed: doGrabState,
});

let cursor = {
    x: 0,
    y: 0,
};

function setAnimState(root, anim, frame) {
    const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
    const stuck = [
        "scratchWallN",
        "scratchWallE",
        "scratchWallS",
        "scratchWallW",
    ];

    if (directions.includes(anim)) {
        cat.state = "moving";
    } else if (stuck.includes(anim)) {
        cat.state = "stuck";
    } else if (anim === "scratchSelf") {
        cat.state = "scratching";
    } else if (anim === "grabbed") {
        // TODO: grabbed state animation handling
        // maybe return?
    } else cat.state = anim;

    let sprite;
    if (frame === undefined)
        sprite = spriteMap[anim][cat.frame_count % spriteMap[anim].length];
    else sprite = spriteMap[anim][frame];

    root.tileX = sprite[0];
    root.tileY = sprite[1];
}

function directionFinder(dx, dy) {
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

function setCursorPos(curs_X, curs_Y) {
    ((cursor.x = curs_X), (cursor.y = curs_Y));
}

// Alert state acts as an "override"
function doAlertState(root) {
    setAnimState(root, "alert");
    cat.skip_frame = 3;
}

function doIdleState(root) {
    setAnimState(root, "idle");
}

function doTiredState(root) {
    if (cat.state != "tired") {
        setAnimState(root, "tired");
        cat.skip_frame = 7;
    } else
        if (cat.skip_frame <= 0) {
            setAnimState(root, "sleeping", 0);
        }
}

function doSleepState(root) {
    if (cat.skip_frame <= 0) cat.skip_frame = 14;
    if (cat.skip_frame >= 7) setAnimState(root, "sleeping", 0);
    else setAnimState(root, "sleeping", 1);
}

// TODO
function doScratchState(root) { }

function doThinkState(root) {
    if (cat.state != "think") {
        setAnimState(root, "think");
        cat.skip_frame = 7;
    } else
        if (cat.skip_frame <= 0) {
            setAnimState(root, "idle");
            cat.cooldown.thinking = Date.now() + 2 * CONFIG.idleTimeout;
        }
}

// TODO
function doStuckState(root) { }

function doFollowState(root, dist) {
    const step = Math.min(dist.hyp, CONFIG.followSpeed);
    root.catX = root.catX + (dist.dx / dist.hyp) * step;
    root.catY = root.catY + (dist.dy / dist.hyp) * step;
    setAnimState(root, directionFinder(dist.dx, dist.dy));
}

// TODO
function doGrabState(root) { }

function runCatState(root) {
    if (cat.state != "idle") {
        stateHandlers[cat.state](root);
    } else {
        // Decide which state to use
        if (Date.now() - cat.last_moved > CONFIG.sleepTimeout) {
            if (cat.state != "sleeping") doTiredState(root);
            else doSleepState(root);
        }
        if (Date.now() - cat.last_moved > CONFIG.idleTimeout) {
            let rnd = getRandomInt(10);
            if (rnd >= 7 && cat.cooldown.thinking < Date.now()) {
                doThinkState(root);
            }
        }
    }
}

function spriteFinder(id) {
    if (CONFIG.useUserSprite === true) {
        const obj = {
            path: CONFIG.userSpritePath,
        };
        return obj;
    } else
        return (
            Object.values(spriteList).find((s) => s.id === id) ||
            spriteList.Neko
        );
}

// TODO: implement figuring out if the cat would get stuck, and calculating appropriate target
function targetFinder() {
    if (CONFIG.followType == followTypes["mouse"]) {
        cat.target_X = cursor.x + CONFIG.followOffsetX;
        cat.target_Y = cursor.y + CONFIG.followOffsetY;
    }
}

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

function sendConfig(root) {
    const sprite = spriteFinder(CONFIG.appearance);
    root.spriteSource = sprite.path;
    root.tileW = sprite.tileWidth;
    root.tileH = sprite.tileHeight;
    root.timerSpeed = CONFIG.timerSpeed;
}

// Origin: Top left (0,0)
// Down and right are positive
function tick(root) {
    cat.frame_count++;
    if (cat.skip_frame > 0) {
        cat.skip_frame--;
    }
    targetFinder();
    let dist = {
        dx: cat.target_X - root.catX,
        dy: cat.target_Y - root.catY,
        hyp: 0,
    };
    dist.hyp = Math.hypot(dist.dx, dist.dy);

    // print(`${JSON.stringify(dist)}`);

    if (dist.hyp >= CONFIG.followRadius && dist.hyp !== 0) {
        if (Date.now() - cat.last_moved > CONFIG.idleTimeout) {
            doAlertState(root);
        }

        cat.last_moved = Date.now();
        if (cat.skip_frame <= 0) doFollowState(root, dist);
    } else {
        // Non-moving animations
        runCatState(root);
    }
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
    }
}

let CONFIG;
var KWINCONFIG;
var KWIN;
class KWinDriver {

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

}

function warning(s) {
    print(`[KNeko.WARNING]: ${s}`);
}

function pass() {
    return;
}
