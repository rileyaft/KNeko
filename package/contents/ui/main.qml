import QtQuick
import QtQuick.Window
import org.kde.kwin as KWin
import org.kde.plasma.core as PlasmaCore

PlasmaCore.Window {
    id: win

    visible: true
    flags: Qt.WindowStaysOnTopHint | Qt.FramelessWindowHint | Qt.NoDropShadowHint | Qt.X11BypassWindowManagerHint
    color: "#00000000"
    width: root.tileW
    height: root.tileH
    x: root.catX
    y: root.catY

    Item {
        // TODO: Add remaining config options and functionality
        id: root

        // Owned by Logic (will be overwritten)
        property int tileW: 32
        property int tileH: 32
        property int tileX: -3
        property int tileY: -3
        property url spriteSource: "img/neko.png"
        property int catX: 128
        property int catY: 128

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

    }

}
