What forces layout / reflow
All of the below properties or methods, when requested/called in JavaScript, will trigger the browser to synchronously calculate the style and layout*. This is also called reflow or layout thrashing, and is common performance bottleneck.

Element
- Box metrics
- elem.offsetLeft, elem.offsetTop, elem.offsetWidth, elem.offsetHeight, elem.offsetParent
- elem.clientLeft, elem.clientTop, elem.clientWidth, elem.clientHeight
- elem.getClientRects(), elem.getBoundingClientRect()
- Scroll stuff
- elem.scrollBy(), elem.scrollTo()
- elem.scrollIntoView(), elem.scrollIntoViewIfNeeded()
- elem.scrollWidth, elem.scrollHeight
- elem.scrollLeft, elem.scrollTop also, setting them

Focus
- elem.focus() can trigger a double forced layout (source)

Also…
- elem.computedRole, elem.computedName
- elem.innerText (source)
- getComputedStyle
- window.getComputedStyle() will typically force style recalc (source)

window.getComputedStyle() will force layout, as well, if any of the following is true:

The element is in a shadow tree
There are media queries (viewport-related ones). Specifically, one of the following: (source) *  min-width, min-height, max-width, max-height, width, height * aspect-ratio, min-aspect-ratio, max-aspect-ratio
device-pixel-ratio, resolution, orientation

The property requested is one of the following: (source)
height, width * top, right, bottom, left * margin [-top, -right, -bottom, -left, or shorthand] only if the margin is fixed. * padding [-top, -right, -bottom, -left, or shorthand] only if the padding is fixed. * transform, transform-origin, perspective-origin * translate, rotate,  scale * webkit-filter, backdrop-filter * motion-path,  motion-offset, motion-rotation * x, y, rx, ry

window
- window.scrollX, window.scrollY
- window.innerHeight, window.innerWidth
- window.getMatchedCSSRules() only forces style

Forms
- inputElem.focus()
- inputElem.select(), textareaElem.select() (source)

Mouse events
- mouseEvt.layerX, mouseEvt.layerY, mouseEvt.offsetX, mouseEvt.offsetY (source)

document
- doc.scrollingElement only forces style

Range
- range.getClientRects(), range.getBoundingClientRect()

SVG
- Quite a lot; haven't made an exhaustive list , but Tony Gentilcore's 2011 Layout Triggering List pointed to a few.

contenteditable
- Lots & lots of stuff, …including copying an image to clipboard (source)
