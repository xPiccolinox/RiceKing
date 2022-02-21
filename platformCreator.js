const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')
const platformVar = document.getElementById('platformVar')
const importPlatformsText = document.getElementById('importPlatformsText')
const levelInput = document.getElementById('level')
const levelText = document.getElementById('levelText')
const levelButton = document.getElementById('levelButton')
const level = document.getElementById('level')
const map = document.getElementById('map')
const windButton = document.getElementById('wind')

canvas.width = 800
canvas.height = 600

//  Variables
let mouse = {
    x: 0,
    y: 0
}
let mouseClick = {}
let clickSwitch
let platform_id = 0
let platformLevel = 0
let lines = []
let points = []
let rectangle
let rectangles = []
let copyString = ''
let platformSlide = false
let slide
let slides = []
let platformSurface = 0
let mapImage
let levelButtonInterval
let wind = false
let windParticles = []
let windForce = 0
let windAcceleration = 0

//  Event Listeners
addEventListener('mousemove', (event) => {
    mouse.x = event.clientX - window.getComputedStyle(canvas).left.slice(0, window.getComputedStyle(canvas).left.indexOf('px')) + canvas.width / 2,
    mouse.y = event.clientY - window.getComputedStyle(canvas).top.slice(0, window.getComputedStyle(canvas).top.indexOf('px')) + canvas.height / 2
})
addEventListener('click', (event) => {
    clickSwitch = !clickSwitch
    if (clickSwitch === true) {
        mouseClick.x = mouse.x
        mouseClick.y = mouse.y
    } else if (clickSwitch === false) {
        mouseClick.x2 = mouse.x
        mouseClick.y2 = mouse.y
    }
    points.forEach(point => {
        point.colorValue -= 1
    })
})

// Objects
class Line {
    constructor (x, y) {
        this.x = x
        this.y = y
    }

    draw() {
        c.beginPath()
        c.strokeStyle = 'black'
        c.moveTo(this.x, 0)
        c.lineTo(this.x, canvas.height)
        c.stroke()
        c.moveTo(0, this.y)
        c.lineTo(canvas.width, this.y)
        c.stroke()
        c.closePath()
    }

    update() {
        this.draw()
    }
}
class Point {
    constructor (x, y) {
        this.x = x
        this.y = y
        this.color = 'rgba(180, 0, 0, 0.15)'
        this.colorValue = 0
        this.radius = 5
    }

    draw() {
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill()
        c.closePath()
    }

    update() {
        this.draw()

        let distance = Math.sqrt(Math.pow((mouse.x - this.x), 2) + Math.pow((mouse.y - this.y), 2))
        let distanceClick = Math.sqrt(Math.pow((mouseClick.x - this.x), 2) + Math.pow((mouseClick.y - this.y), 2))
        let distanceClick2 = Math.sqrt(Math.pow((mouseClick.x2 - this.x), 2) + Math.pow((mouseClick.y2 - this.y), 2))
        if (distanceClick < 7) {
            rectangle.x = this.x
            rectangle.y = this.y
            slide.x = this.x
            slide.y = this.y
            this.radius = 5
            if (clickSwitch === true) this.colorValue = 2
        } else if (distanceClick2 < 7) {
            rectangle.x2 = this.x
            rectangle.y2 = this.y
            slide.x2 = this.x
            slide.y2 = this.y
            this.radius = 5
            if (clickSwitch === false) this.colorValue = 2
        } else if (distance < 7) {
            this.color = 'rgba(0, 255, 100, 1)'
            this.radius = 7
        } else if (distance < 100) {
            this.color = `rgba(120, 0, 0, ${((distance / 100) - 1) * -0.6})`
            this.radius = 5
        } else {
            this.color = 'rgba(120, 0, 0, 0.05)'
            this.radius = 5
        }
        if (this.colorValue === 2) this.color = 'rgba(240, 177, 5, 1)'
        else if (this.colorValue === 1) this.color = 'rgba(107, 96, 65, 1)'
    }
}
class Rectangle {
    constructor (x, x2, y, y2) {
        this.x = x
        this.x2 = x2
        this.y = y
        this.y2 = y2
        this.color = 'rgba(255, 255, 255, 0.3)'
        this.rx = 0
        this.ry = 0
        this.rw = 0
        this.rh = 0
    }

    draw() {
        c.beginPath()
        c.fillStyle = this.color
        c.fillRect(this.rx, this.ry, this.rw, this.rh)
        c.closePath()
    }

    update() {
        this.draw()
        if (this.x > this.x2) {
            this.rx = this.x2
            this.rw = this.x - this.x2
        } else {
            this.rx = this.x
            this.rw = this.x2 - this.x
        }
        if (this.y > this.y2) {
            this.ry = this.y2
            this.rh = this.y - this.y2
        } else {
            this.ry = this.y
            this.rh = this.y2 - this.y
        }
        if (platformSlide === true) {
            this.color = 'rgba(0, 0, 0, 0)'
        } else {
            this.color = 'rgba(255, 255, 255, 0.3)'
        }
    }
}
class RectangleDraw {
    constructor (x, y, w, h, id, platformSurface) {
        this.x = x
        this.y = y
        this.w = w
        this.h = h
        this.id = id
        this.surface = platformSurface
        if (this.surface == 0) {
            this.color = 'rgba(255, 210, 97, 0.3)'
        } else if (this.surface == 1) {
            this.color = 'rgba(120, 255, 237, 0.3)'
        } else if (this.surface == 2) {
            this.color = 'rgba(0, 148, 227, 0.3)'
        }
    }

    draw() {
        c.beginPath()
        c.fillStyle = this.color
        c.fillRect(this.x, this.y, this.w, this.h)
        c.closePath()
    }

    update() {
        this.draw()
    }
}
class Slide {
    constructor (x, x2, y, y2) {
        this.x = x
        this.x2 = x2
        this.y = y
        this.y2 = y2
        this.color = 'rgba(255, 255, 255, 0.3)'
    }

    draw() {
        c.beginPath()
        c.fillStyle = this.color
        c.moveTo(this.x, this.y)
        c.lineTo(this.x, this.y2)
        c.lineTo(this.x2, this.y2)
        c.lineTo(this.x, this.y)
        c.fill()
        c.closePath()
    }

    update() {
        this.draw()
        if (platformSlide === true) {
            this.color = 'rgba(255, 255, 255, 0.3)'
        } else {
            this.color = 'rgba(0, 0, 0, 0)'
        }
    }
}
class SlideDraw {
    constructor (x, y, x2, y2, id) {
        this.x = x
        this.y = y
        this.x2 = x2
        this.y2 = y2
        this.id = id
        this.color = 'rgba(189, 140, 255, 0.3)'
    }

    draw() {
        c.beginPath()
        c.fillStyle = this.color
        c.moveTo(this.x, this.y)
        c.lineTo(this.x, this.y2)
        c.lineTo(this.x2, this.y2)
        c.lineTo(this.x, this.y)
        c.fill()
        c.closePath()
    }

    update() {
        this.draw()
    }
}
class Image {
    constructor (src) {
        this.src = src
        this.x = 0
        this.y = 0
        this.scroll = 42
        this.opacity = 0.5

    }

    draw() {
        c.save()
        c.globalAlpha = this.opacity
        c.drawImage(this.src, this.x, this.y - 600 * this.scroll, 800, 600 * 43)
        c.restore()
    }

    update() {
        this.draw()
    }
}
class WindParticle {
    constructor () {
        this.x = Math.random() * canvas.width
        this.y = Math.random() * canvas.height
        this.radius = Math.random() * 2 + 2
        this.randomVelocity = Math.random()
        this.color = 'rgba(255, 255, 255, 0)'
    }

    draw() {
        c.beginPath()
        c.fillStyle = this.color
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fill()
        c.closePath()
    }

    update() {
        this.draw()
        if (this.y > canvas.height) this.y = 1
        this.y += 0.2 + (this.randomVelocity / 4)
        if (this.x > canvas.width) this.x = 1
        else if (this.x < 0) this.x = canvas.width - 1
        this.x += windForce * 2 + (this.randomVelocity / 2 * windForce)
    }
}

//  Functions
    // Change platform levels
function levelChange() {
    if (levelInput.value != '') {
        platformLevel = levelInput.value
        if (platformLevel >= 42) image.scroll = 0
        else if (platformLevel <= 0) image.scroll = 42
        else image.scroll = 42 - platformLevel
        levelText.innerText = `Level: ${platformLevel}`
        levelInput.value = ''
        platformVar.childNodes.forEach(div => {
            string = div.innerHTML
            if (string.slice(0, 1) === 'p') {
                string = string.slice(string.indexOf('m(') + 2, string.indexOf(')'))
                let stringArr = string.split(', ')
                div.innerHTML = `platforms.push(new Platform(${stringArr[0]}, ${stringArr[1]}, ${stringArr[2]}, ${stringArr[3]}, ${platformLevel}, ${stringArr[5]})) <div onclick = 'removePlatform(this)'>X</div>`
            } else if (string.slice(0, 1) === 's') {
                string = string.slice(string.indexOf('e(') + 2, string.indexOf(')'))
                let stringArr = string.split(', ')
                div.innerHTML = `slides.push(new Slide(${stringArr[0]}, ${stringArr[1]}, ${stringArr[2]}, ${stringArr[3]}, ${platformLevel})) <div onclick = 'removePlatform(this)'>X</div>`
            }
        })
        clearInterval(levelButtonInterval)
        levelButton.style.backgroundColor = 'rgb(41, 83, 173)'
        levelInput.style.backgroundColor = 'rgb(54, 54, 54)'
    }
}
    // Add platform to the list
function addPlatform() {
    if (platformSlide === false) {
        rectangles.push(new RectangleDraw(rectangle.rx, rectangle.ry, rectangle.rw, rectangle.rh, platform_id, platformSurface))
        div = document.createElement(`div`)
        div.id = `platform_${platform_id}`
        div.setAttribute('onMouseOver', 'mouseOverPlatform(id)')
        div.setAttribute('onMouseOut', 'mouseOutPlatform(id)')
        div.innerHTML = `platforms.push(new Platform(${rectangle.rx}, ${rectangle.ry}, ${rectangle.rw}, ${rectangle.rh}, ${platformLevel}, ${platformSurface})) <div onclick = 'removePlatform(this)'>X</div>`
        platformVar.appendChild(div)
        platform_id++
    } else if (platformSlide === true) {
        slides.push(new SlideDraw(slide.x, slide.y, slide.x2, slide.y2, platform_id))
        div = document.createElement(`div`)
        div.id = `platform_${platform_id}`
        div.setAttribute('onMouseOver', 'mouseOverPlatform(id)')
        div.setAttribute('onMouseOut', 'mouseOutPlatform(id)')
        div.innerHTML = `slides.push(new Slide(${slide.x}, ${slide.y}, ${slide.x2}, ${slide.y2}, ${platformLevel})) <div onclick = 'removePlatform(this)'>X</div>`
        platformVar.appendChild(div)
        platform_id++
    }
}
    // Remove platform from the list
function removePlatform(remove) {
    getId = remove.parentNode.id.slice(remove.parentNode.id.indexOf('_') + 1)
    for (let i = 0; i < rectangles.length; i++) {
        if (rectangles[i].id == getId) {
            rectangles.splice(i, 1)
        }
    }
    for (let i = 0; i < slides.length; i++) {
        if (slides[i].id == getId) {
            slides.splice(i, 1)
        }
    }
    remove.parentNode.remove()
}
    // Change platform type - Platform / Slide
function changePlatformType(id) {
    if (id === 'platformType1') {
        platformSlide = false
        if (platformSurface === 0) document.getElementById('platformType1').style.backgroundColor = 'rgb(243, 189, 52)'
        if (platformSurface === 1) document.getElementById('platformType1').style.backgroundColor = 'rgb(59, 217, 196)'
        if (platformSurface === 2) document.getElementById('platformType1').style.backgroundColor = 'rgb(53, 172, 232)'
        document.getElementById('platformType2').style.backgroundColor = 'rgb(66, 66, 66)'
        document.getElementById('platformSurface1').style.filter = 'brightness(100%)'
        document.getElementById('platformSurface2').style.filter = 'brightness(100%)'
        document.getElementById('platformSurface3').style.filter = 'brightness(100%)'
    }
    else if (id === 'platformType2') {
        platformSlide = true
        document.getElementById('platformType1').style.backgroundColor = 'rgb(66, 66, 66)'
        document.getElementById('platformType2').style.backgroundColor = 'rgb(142, 96, 204)'
        document.getElementById('platformSurface1').style.filter = 'brightness(50%)'
        document.getElementById('platformSurface2').style.filter = 'brightness(50%)'
        document.getElementById('platformSurface3').style.filter = 'brightness(50%)'
    }
}
    // Change platform surface - Normal / Snow / Ice
function changePlatformSurface(id) {
    if (id === 'platformSurface1') {
        platformSurface = 0
        if (platformSlide === false) document.getElementById('platformType1').style.backgroundColor = 'rgb(243, 189, 52)'
        document.getElementById('platformSurface1').style.backgroundColor = 'rgb(243, 189, 52)'
        document.getElementById('platformSurface2').style.backgroundColor = 'rgb(66, 66, 66)'
        document.getElementById('platformSurface3').style.backgroundColor = 'rgb(66, 66, 66)'
    } else if (id === 'platformSurface2') {
        platformSurface = 1
        if (platformSlide === false) document.getElementById('platformType1').style.backgroundColor = 'rgb(59, 217, 196)'
        document.getElementById('platformSurface1').style.backgroundColor = 'rgb(66, 66, 66)'
        document.getElementById('platformSurface2').style.backgroundColor = 'rgb(59, 217, 196)'
        document.getElementById('platformSurface3').style.backgroundColor = 'rgb(66, 66, 66)'
    } else if (id === 'platformSurface3') {
        platformSurface = 2
        if (platformSlide === false) document.getElementById('platformType1').style.backgroundColor = 'rgb(53, 172, 232)'
        document.getElementById('platformSurface1').style.backgroundColor = 'rgb(66, 66, 66)'
        document.getElementById('platformSurface2').style.backgroundColor = 'rgb(66, 66, 66)'
        document.getElementById('platformSurface3').style.backgroundColor = 'rgb(53, 172, 232)'
    }
}
    // Highlight rectangle if mouse is over its <div>
function mouseOverPlatform(id) {
    getId = id.slice(id.indexOf('_') + 1)
    for (let i = 0; i < rectangles.length; i++) {
        if (rectangles[i].id == getId) {
            rectangles[i].color = 'rgba(255, 60, 70, 0.3)'
        }
    }
    for (let i = 0; i < slides.length; i++) {
        if (slides[i].id == getId) {
            slides[i].color = 'rgba(255, 60, 70, 0.3)'
        }
    }
}
    // Unhighlight
function mouseOutPlatform(id) {
    getId = id.slice(id.indexOf('_') + 1)
    rectangles.forEach(rectangle => {
        if (rectangle.id == getId) {
            if (rectangle.surface == 0) {
                rectangle.color = 'rgba(255, 210, 97, 0.3)'
            } else if (rectangle.surface == 1) {
                rectangle.color = 'rgba(120, 255, 237, 0.3)'
            } else if (rectangle.surface == 2) {
                rectangle.color = 'rgba(0, 148, 227, 0.3)'
            }
        }
    })
    slides.forEach(slide => {
        if (slide.id == getId) {
                slide.color = 'rgba(189, 140, 255, 0.3)'
        }
    })
}
    // Turn wind ON / OFF
function windSwitch() {
    if (wind === false) {
        wind = true
        windButton.innerText = 'Wind: ON'
        windButton.style.backgroundColor = 'rgb(38, 66, 34)'
        windParticles.forEach(windParticle => {
            windParticle.color = 'rgba(255, 255, 255, 0.2)'
        })
    }
    else if (wind === true) {
        wind = false
        windButton.innerText = 'Wind: OFF'
        windButton.style.backgroundColor = 'rgb(51, 29, 29)'
        windParticles.forEach(windParticle => {
            windParticle.color = 'rgba(255, 255, 255, 0.0)'
        })
    }
}
    // Copy all platforms to Clipboard
function copyToClipboard() {
    copyString = `// Level ${platformLevel} \n`
    if (wind === true) {
        copyString = copyString + `winds.push(new Wind(${platformLevel}))`
    }
    platformVar.childNodes.forEach ((childNode, index) => {
        if (index === 0 && wind === false) copyString = copyString + childNode.innerText
        else copyString = copyString + '\n' + childNode.innerText
    })
    navigator.clipboard.writeText(copyString);
}
    // Import platforms
function importPlatforms() {
    while (platformVar.childNodes.length > 0) {
        platformVar.removeChild(platformVar.childNodes[0])
    }
    rectangles = []
    slides = []
    let toImportArr = []
    let toImport = importPlatformsText.value
    toImportArr = toImport.split('\n')
    toImportArr.forEach((string) => {
        if (string.indexOf(' ') === 0) {
            if (string.lastIndexOf(' p') > 0) {
                string = string.slice(string.lastIndexOf(` p`) + 1)
            } else if (string.lastIndexOf(' s') > 0) {
                string = string.slice(string.lastIndexOf(` s`) + 1)
            }
        }
        if (string.slice(0, 1) === 'p') {
            string = string.slice(string.indexOf('m(') + 2, string.indexOf(')'))
            let stringArr = string.split(', ')
            rectangles.push(new RectangleDraw(stringArr[0], stringArr[1], stringArr[2], stringArr[3], platform_id, stringArr[5]))
            div = document.createElement(`div`)
            div.id = `platform_${platform_id}`
            div.setAttribute('onMouseOver', 'mouseOverPlatform(id)')
            div.setAttribute('onMouseOut', 'mouseOutPlatform(id)')
            if (stringArr.length === 5) {
                div.innerHTML = `platforms.push(new Platform(${stringArr[0]}, ${stringArr[1]}, ${stringArr[2]}, ${stringArr[3]}, ${stringArr[4]}, 0)) <div onclick = 'removePlatform(this)'>X</div>`
            } else if (stringArr.length === 6) {
                div.innerHTML = `platforms.push(new Platform(${stringArr[0]}, ${stringArr[1]}, ${stringArr[2]}, ${stringArr[3]}, ${stringArr[4]}, ${stringArr[5]})) <div onclick = 'removePlatform(this)'>X</div>`
            }
            platformVar.appendChild(div)
            platform_id++
        } else if (string.slice(0, 1) === 's') {
            string = string.slice(string.indexOf('e(') + 2, string.indexOf(')'))
            let stringArr = string.split(', ')      
            slides.push(new SlideDraw(stringArr[0], stringArr[1], stringArr[2], stringArr[3], platform_id))
            div = document.createElement(`div`)
            div.id = `platform_${platform_id}`
            div.setAttribute('onMouseOver', 'mouseOverPlatform(id)')
            div.setAttribute('onMouseOut', 'mouseOutPlatform(id)')
            div.innerHTML = `slides.push(new Slide(${stringArr[0]}, ${stringArr[1]}, ${stringArr[2]}, ${stringArr[3]}, ${stringArr[4]})) <div onclick = 'removePlatform(this)'>X</div>`
            platformVar.appendChild(div)
            platform_id++
        } else if (string.slice(0, 1) === 'w') {
            wind = false
            windSwitch()
        }
    })
    importPlatformsText.value = ''
    function levelButtonFlash() {
        if (levelButton.style.backgroundColor == 'rgb(201, 139, 7)') {
            levelButton.style.color = 'white'
            levelButton.style.backgroundColor = 'rgb(41, 83, 173)'
            levelInput.style.backgroundColor = 'rgb(54, 54, 54)'
        }
        else if (levelButton.style.backgroundColor == 'rgb(41, 83, 173)') {
            levelButton.style.color = 'black'
            levelButton.style.backgroundColor = 'rgb(201, 139, 7)'
            levelInput.style.backgroundColor = 'rgb(65, 65, 65)'
        }
        else {
            levelButton.style.color = 'black'
            levelButton.style.backgroundColor = 'rgb(201, 139, 7)'
            levelInput.style.backgroundColor = 'rgb(65, 65, 65)'
        }
    }
    clearInterval(levelButtonInterval)
    levelButton.style.backgroundColor = 'rgb(41, 83, 173)'
    levelInput.style.backgroundColor = 'rgb(54, 54, 54)'
    levelButtonInterval = setInterval(levelButtonFlash, 700)
}
    // Scroll or change background opacity
function mapScrollOpacity(id) {
    if (id === 'scrollUp') {
        if (image.scroll > 0.5) image.scroll -= 1
    } else if (id === 'scrollDown') {
        if (image.scroll < 41.5) image.scroll += 1
    } else if (id === 'opacityUp') {
        if (image.opacity < 0.95) image.opacity += 0.1
    } else if (id === 'opacityDown') {
        if (image.opacity > 0.05) image.opacity -= 0.1
    }
}
    // Initialize objects
function init() {
    for (let i = 1; i < 40; i++) {
        x = canvas.width / 40 * i
        y = canvas.height / 40 * i
        lines.push(new Line(x, y))
    }
    for (let i = 0; i < 41; i++) {
        for (let j = 0; j < 41; j++) {
            x = canvas.width / 40 * j
            y = canvas.height / 40 * i
            points.push(new Point(x, y))
        }
    }
    for (let i = 0; i < 200; i++) {
        windParticles.push(new WindParticle())
    }
    rectangle = new Rectangle(0, 0, 0, 0)
    slide = new Slide(0, 0, 0, 0)
    image = new Image(map)

}
    // Animate
function animate() {
    requestAnimationFrame(animate)
    c.fillStyle = 'rgba(80, 80, 80, 1)'
    c.fillRect(0, 0, canvas.width, canvas.height)

    image.update()

    windParticles.forEach(particle => {
        particle.update()
    })

    lines.forEach(line => {
        line.update()
    })

    points.forEach(point => {
        point.update()
    })

    rectangle.update()

    rectangles.forEach(rectangle => {
        rectangle.update()
    })

    slide.update()

    slides.forEach(slide => {
        slide.update()
    })

    windAcceleration += 0.01
    if (windAcceleration == Math.PI * 2) windAcceleration = 0
    windForce = Math.cos(windAcceleration)
}

init()
animate()