# archer-cursor
An alternative link targeting navigation system that combines mouse and keyboard use for minimal cursor travel.

Objective
---------
Clicking on links or elements on a webpage is a task we're all familiar with and do it all the time. However, the typical flow for achieving this requires too many steps and have several drawbacks.

Your typical mouse/trackpad based flow:

- browsing a webpage or entering data (this means your hand is in either the mouse or keyboard)

- identify a link/element you want to click
- move your hand to the mouse (if you're on the keyboard)
- move the cursor to the link
- click the link
- move your hand back to keyboard (if entering more data)

- repeat


On a best case scenario, if you're only browsing and need to click a link, you only do 3 steps

- identify a link
- move the cursor to the link
- click the link

This seems pretty trivial and not that inefficient, right? But what if you could do this instead

- identify a link
- hold down a key
- move the cursor in the DIRECTION of the link
- release the key


The main point being that you're trading an extra step (releasing a key) for the benefits of splitting the steps between two hands, and you're also doing minimal hand movement to reach your link.

Not sold? What if we compare this to the full flow that happens when you're entering data?

- entering data

- identify a link
- hold down a key + move your THUMB to the trackpad
- move the cursor in the DIRECTION of the link
- release the key

- repeat

Now it may be more obvious since removing the hand movement to reach your mouse is a big time saver. Add the benefit of not having to precisely aim at your link, and the ability to combine multiple steps at the same time (half is done on your left hand, half on your right) and you see how it can be a much quicker experience.


Notes on alternative solutions
------------------------------

TODO: add notes on vimium and bubble cursor


![img](https://github.com/kamykaze/archer-cursor/blob/master/sample_screenshot.png)

Installation
------------
Currently this is very experimental. The examples/index.html page can be loaded locally so you can test with. Alternatively, you can load the unpacked extension on your Chrome browser and use on any page.


How to Use
----------
Hold down the 'Command' key on a Mac to trigger the mode.

** Activate the mode **
While holding the key, move your cursor in the direction of the link desired. There's a minimum distance that needs to be traveled before links will be active and highlighted. This is to avoid the jumpiness and inaccuracy during the first few pixels.

** Cycling through links **
If you keep moving the mouse further/closer, the active link will be cycled among the eligible links. You can also use the SHIFT keys to cycle links one by one for more accuracy. This should only be needed on heavily packed pages.

** Activating the link **
There are three ways to trigger the active link. The quickest is to simply release the CMD key while the link is active. You can also click your mouse or use the 'ENTER' key to trigger the link.


License
-------
Copyright (c) Kam Kuo. See LICENSE.txt for details.
