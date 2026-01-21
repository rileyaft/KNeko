# KNeko
An Oneko-style script implemented in kwinscript, because i got fed up with the lack of customization the X11 Oneko carries.

This is in kwinscript because the wayland protocol scares me, but mainly serves as a project to learn the kwinscript API, QML and JS.

Pull Requests for improvements/additional features welcome!
If you want an additional spriteset, simply ensure it follows the same pattern as `package/contents/ui/img/neko.png` seen [here](../package/contents/ui/img/neko.png).

## Feature Checklist
A set of features I want in place, for fun
(the feature creep is real).

Bolded features are those I need help implementing, if at all possible.

### Wishlist
- [x] **Make window *fully* transparent!** 
> This was solved by using a regular Window QQC2 object, not PlasmaCore.Window, which carries plasma's window theming.
- [ ] **Allow clickthrough on window**
- [ ] **Hot configuration reloading**
- [ ] All remaining animation types part of the original X11 Oneko implementation
- [x] Configuration UI (QTWidgets module)
- - [ ] Finish implementation of all config switches
- [ ] Follow types
- - [x] Mouse
- - - [ ] Follow on keybind? on click?
- - [ ] Window titlebar
- - [ ] Across taskbar (if present, else bottom of screen)
- - [ ] Stationary placement
- [ ] Differing behaviour across virtual desktops
- - [ ] Tracking across desktops (running from previous spot)
- - [x] Pinned to one desktop
- - - [ ] Make configurable
- - [ ] Tracking across desktops (*All Desktops*)
- [ ] Differing behaviour across screens
- [ ] **Smoothing similar to [geometry change desktop effect](https://github.com/peterfajdiga/kwin4_effect_geometry_change)**, for those who don't have it installed
- [ ] Additional spritesets
- [ ] Make Neko respond to being grabbed by user (*Meta + Click*)
- [ ] Finish easteregg

### Not Planned
These are features I don't plan on adding myself. If you'd like to see them added, send a pull request!

- Modifying cursor on hover/click (ie cat toys)

## Special Thanks
- **[Oneko.js](https://github.com/adryd325/oneko.js)** - Code for the sprite map, and inspiration on how to handle sending frames to QML
- **[Onekocord](https://github.com/MCHAMSTERYT2/onekocord/tree/main/onekoskins)** - For the collection of skins
- **[KWin Effect Geometry Change](https://github.com/peterfajdiga/kwin4_effect_geometry_change)** - Makefile
- **[KhrohnKite](https://codeberg.org/anametologin/Krohnkite)** - Pulling KWin API from QML to JS. Lifesaver!
