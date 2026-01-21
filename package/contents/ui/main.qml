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
import org.kde.plasma.core as PlasmaCore

PlasmaCore.Window {
    id: win

    visible: true
    // FIXME: Make the window _actually_ transparent!
    flags: Qt.FramelessWindowHint | Qt.WindowStaysOnTopHint | Qt.NoDropShadowHint | Qt.WindowTransparentForInput
    color: "transparent"
    width: root.tileW
    height: root.tileH
    x: root.catX
    y: root.catY

    Item {
        // TODO: Add remaining functionality
        id: root

        property var cfg: ({
            "followType": KWin.readConfig("FollowType", 0),
            "followRadius": KWin.readConfig("FollowRadius", 16),
            "followOffsetX": KWin.readConfig("FollowOffsetX", -32),
            "followOffsetY": KWin.readConfig("FollowOffsetY", -32),
            "followSpeed": KWin.readConfig("FollowSpeed", 15),
            "idleTimeout": KWin.readConfig("IdleTimeout", 15),
            "appearance": KWin.readConfig("Appearance", 0),
            "timerSpeed": KWin.readConfig("AnimationInterval", 150),
            "virtualDesktopBehaviour": KWin.readConfig("VirtualDesktopBehaviour", 0)
        })
        // -
        // Owned by Logic (will be overwritten)
        property int tileW: 32
        property int tileH: 32
        property int tileX: -3
        property int tileY: -3
        property url spriteSource: "img/neko.png"
        property int catX: 128
        property int catY: 128

        Component.onCompleted: {
            print("[KNeko] Init");
            Logic.init(root, root.cfg);
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
            // Logic.onDesktopChange(root, screenRect);

            function onCursorPosChanged() {
                Logic.setCursorPos(KWin.Workspace.cursorPos.x, KWin.Workspace.cursorPos.y);
            }

            function currentDesktopChanged(previous) {
                const screenRect = KWin.Workspace.Output.geometry;
                const workspaceDims = ({
                    "w": KWin.Workspace.workspaceWidth,
                    "h": KWin.Workspace.workspaceHeight
                });
                print("[KNeko] Desktop Changed: (" + screenRect.left() + ", " + screenRect.right() + "), (" + workspaceDims.w + ", " + workspaceDims.h + ")");
            }

            target: KWin.Workspace
        }

        Connections {
            function onConfigChanged() {
                print("[KNeko] Config updated! Reloading.");
                Logic.init(root, root.cfg);
            }

            target: Options
        }

        Timer {
            interval: root.cfg.timerSpeed
            running: true
            repeat: true
            onTriggered: {
                // print(win.x + " " + win.y);
                Logic.tick(root);
            }
        }

    }

}
