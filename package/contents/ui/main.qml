import "../code/logic.js" as Logic
import QtQuick
import QtQuick.Window
import org.kde.kwin as KWin
import org.kde.plasma.core as PlasmaCore

PlasmaCore.Window {
    id: win

    visible: true
    // FIXME: Make the window _actually_ transparent!
    flags: Qt.FramelessWindowHint | Qt.WA_TranslucentBackground | Qt.WindowStaysOnTopHint | Qt.NoDropShadowHint
    color: "transparent"
    width: root.tileW
    height: root.tileH
    x: root.catX
    y: root.catY

    Item {
        // TODO: Add remaining config options and functionality
        // FIXME: Some config seems to be 0?
        id: root

        // Config values
        readonly property int followType: KWin.readConfig("FollowType", 0)
        readonly property int followRadius: KWin.readConfig("FollowRadius", 16)
        readonly property int followOffsetX: KWin.readConfig("FollowOffsetX", -32)
        readonly property int followOffsetY: KWin.readConfig("FollowOffsetY", -32)
        readonly property int followSpeed: KWin.readConfig("FollowSpeed", 15)
        readonly property int idleTimeout: KWin.readConfig("IdleTimeout", 15)
        readonly property int appearance: KWin.readConfig("Appearance", 0)
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
            print("Init");
            print(followSpeed);
            Logic.init(root);
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
            interval: 150
            running: true
            repeat: true
            onTriggered: {
                // print(win.x + " " + win.y);
                Logic.tick(root);
            }
        }

    }

}
