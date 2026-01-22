/*
 *  KNeko - an onkeo implementation in kwinscript
 *
 *  SPDX-FileCopyrightText: 2026 Riley Tinkl <riley.aft@outlook.com>
 *
 *  SPDX-License-Identifier: GPL-3.0
 */

import "../code/logic.js" as Logic
import QtQuick
import QtQuick.Window
import org.kde.kwin

Window {
    id: win

    visible: true
    flags: Qt.FramelessWindowHint | Qt.WindowStaysOnTopHint | Qt.NoDropShadowHint | Qt.WindowTransparentForInput
    color: "transparent"
    width: root.tileW
    height: root.tileH
    x: root.catX
    y: root.catY

    Item {
        // TODO: Add remaining functionality
        id: root

        // Owned by Logic (will be overwritten)
        property int tileW: 32
        property int tileH: 32
        property int tileX: -3
        property int tileY: -3
        property url spriteSource: "img/neko.png"
        property int catX: win.x
        property int catY: win.y
        property int timerSpeed: 150

        Component.onCompleted: {
            print("[KNeko] Init");
            const api = {
                "workspace": Workspace,
                "kwin": KWin,
                "shortcuts": shortcutsLoader.item
            };
            (new Logic.KWinDriver(api)).init();
            Logic.sendConfig(root);
        }

        Image {
            id: sprite

            width: root.tileW
            height: root.tileH
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
            interval: root.timerSpeed
            running: true
            repeat: true
            onTriggered: {
                // print(win.x + " " + win.y);
                Logic.tick(root);
            }
        }

        Loader {
            id: shortcutsLoader

            source: "shortcuts.qml"
        }

    }

}
