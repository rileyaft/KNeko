let config = {
    followType: 0,
    followRadius: 16,
    followOffsetX: -32,
    followOffsetY: -32,
    followSpeed: 15,
    idleTimeout: 15,
    appearance: 0,
    timerSpeed: 150,
};

const followTypes = Object.freeze({
    mouse: 0,
    // windowTitlebar: 1,
    // inWindow: 2,
    // onTaskbar: 3,
    // stationary: 4
});

// TODO: Add more appearances from configuration UI
const spriteList = Object.freeze({
    Neko: {
        id: 0,
        path: "img/neko.png",
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
    scratchSelf: [
        [-5, 0],
        [-6, 0],
        [-7, 0],
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
    state: {
        moving: false,
        yawning: false,
        sleeping: false,
        scratching: false,
        grooming: false,
        suprised: false,
        stuck: false,
    },
    frame_count: 0,
};

let cursor = {
    x: 0,
    y: 0,
};

const spriteInfo = (val) => {
    for (const key in spriteList) {
        if (spriteList[key].id === val) return spriteList[key];
    }
    return spriteList.Neko;
};

function setSpriteAnim(root, anim) {
    const sprite = spriteMap[anim][cat.frame_count % spriteMap[anim].length];
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

function resetCatState() {
    for (const key in cat.state) {
        cat.state[key] = false;
    }
}

function init(root, cfg) {
    print("Start init");

    for (const key in cfg) {
        if (config[key] == cfg[key]) config[key] = cfg[key];
    }

    const sprite = spriteInfo(config.appearance);
    root.spriteSource = sprite.path;
    root.tileW = sprite.tileWidth;
    root.tileH = sprite.tileHeight;

    print("Init complete");
}

// Origin: Top left (0,0)
// Down and right are positive
function tick(root) {
    cat.frame_count++;

    if (config.followType == followTypes["mouse"]) {
        cat.target_X = cursor.x + config.followOffsetX;
        cat.target_Y = cursor.y + config.followOffsetY;
    }
    const dx = cat.target_X - root.catX;
    const dy = cat.target_Y - root.catY;

    const dist = Math.hypot(dx, dy);

    if (dist >= config.followRadius && dist != 0) {
        // TODO: Implement all other cat states
        // Movement
        cat.last_moved = Date.now();
        cat.state.moving = true;

        const step = Math.min(dist, config.followSpeed);
        root.catX = root.catX + (dx / dist) * step;
        root.catY = root.catY + (dy / dist) * step;

        setSpriteAnim(root, directionFinder(dx, dy));
    } else {
        // Non-moving animations
        if (cat.state.moving === true) {
            setSpriteAnim(root, "idle");
            cat.state.moving = false;
        }
    }
}
