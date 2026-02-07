/*
 *  KNeko - an oneko implementation in kwinscript
 *
 *  SPDX-FileCopyrightText: 2026 Riley Tinkl <riley.aft@outlook.com>
 *
 *  SPDX-License-Identifier: GPL-3.0
 */

import "../code/logic.js" as Logic
import QtQuick
import QtQuick.Window
import org.kde.kwin

// TODO: Separate main into two files for multiple cat states
// TODO: Config window loader
Window {
    id: win
    property real fixedWidth: root.tileW * root.scale
    property real fixedHeight: root.tileH * root.scale

    visible: true
    flags: Qt.FramelessWindowHint | Qt.WindowStaysOnTopHint | Qt.NoDropShadowHint | Qt.WindowTransparentForInput
    color: "transparent"
    width: fixedWidth
    height: fixedHeight
    x: root.catX
    y: root.catY
    onWidthChanged: if (width !== fixedWidth) width = fixedWidth
    onHeightChanged: if (height !== fixedHeight) height = fixedHeight

    Item {
        id: root

        // Owned by Logic (will be overwritten)
        property int tileW: 32
        property int tileH: 32
        property int tileX: -3
        property int tileY: -3
        property url spriteSource: "img/neko.png"
        property double scale: 1
        property int catX: win.x
        property int catY: win.y
        property var cat

        function refreshState() {
            const c = Logic.getCat();
            catX = c.x;
            catY = c.y;
            tileX = c.tile_X;
            tileY = c.tile_Y;
        }

        Component.onCompleted: {
            print("[KNeko] Init");
            const api = {
                "workspace": Workspace,
                "kwin": KWin,
                "shortcuts": shortcutsLoader.item
            };
            (new Logic.KWinDriver(api)).init();
            Logic.initState(root);
            root.cat = Logic.getCat(win);
        }

        Image {
            id: sprite

            width: root.tileW * root.scale
            height: root.tileH * root.scale
            source: root.spriteSource
            smooth: false
            // -
            // Crops spritesheet to render tile
            sourceClipRect: Qt.rect(-root.tileX * root.tileW, -root.tileY * root.tileH, root.tileW, root.tileH)
        }

        Connections {
            function onCursorPosChanged() {
                Logic.setCursorPos(KWin.Workspace.cursorPos.x, KWin.Workspace.cursorPos.y);
            }

            target: KWin.Workspace
        }

        Timer {
            interval: 16
            running: true
            repeat: true
            onTriggered: {
                if (root.cat) {
                    root.cat.tick();
                    root.refreshState();
                }
            }
        }

        Loader {
            id: shortcutsLoader

            source: "shortcuts.qml"
        }

    }

}
