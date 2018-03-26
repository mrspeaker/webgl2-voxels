# WebGL2 Boxel Thing

By [@mrspeaker](https://www.twitter.com/mrspeaker). It's a voxel-boxel-o-rama! [Test it out in browser](https://mrspeaker.github.io/webgl2-voxels) (Requires native JavaScript module support - if you're in Firefox it's still not on by default, enable in `about:config` under key `dom.moduleScripts.enabled`).

[![webgl2 voxels](https://user-images.githubusercontent.com/129330/37849134-edc55686-2eac-11e8-88e4-317d98fc3b9c.png)](https://mrspeaker.github.io/webgl2-voxels)

There's no goal or anything at the moment - just rendering some chunks (with some nice ambient occlusion). This experiment inspired by the excellent [SketchpunkLabs WebGL2 series](https://www.youtube.com/channel/UCSnyjB_8iVxi2ZAfn_1L6tA).

* WASD move (or ZQSD for france)
* SPACE jump (hold to "fly")
* E create new world (or sit in portal!)
* Left click: add block
* Shift click: delete block
* Right click: destructo mode!

## TODO

* Fix ambient Occlusion on chunk borders
* Fix texture seams
* Fix jumping (double tap to fly)
* Move skybox with player
* Camera clips when jumping and looking up
