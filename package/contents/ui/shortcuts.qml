import QtQuick
import org.kde.kwin

Item {
    id: dbus

    function getToggleFollow() {
        return toggleFollow;
    }

    function getForceReload() {
        return forceReload;
    }

    ShortcutHandler {
        id: toggleFollow

        name: "KNekoToggleFollow"
        text: "KNeko: Toggle follow target"
        sequence: "Meta+f"
    }

    ShortcutHandler {
        id: forceReload

        name: "KNekoForceReload"
        text: "KNeko: Force reload configuration"
        sequence: ""
    }

}
