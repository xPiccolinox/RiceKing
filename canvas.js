const body = document.querySelector('body')
const text = document.getElementById('text')
const mapPlatformsElement = document.getElementById('mapPlatforms')
const mapBackgroundElement = document.getElementById('mapBackground')
const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')
canvas.width = 800
canvas.height = 600


//  Variables
const keys = {
    right: {
        pressed: false
    },
    left: {
        pressed: false
    },
    space: {
        pressed: false
    }
}
const platforms = []
const slides = []
const winds = []
const windParticles = []
let windForce = 0
let windAcceleration = 0
let gravity = 0.6
let additionalHeight

//  Player movement buttons
addEventListener('keydown', ({ keyCode }) => {
    switch (keyCode) {
        case 68:
            keys.right.pressed = true
            break
        case 65:
            keys.left.pressed = true
            break
        case 32:
            keys.space.pressed = true
            break
    }
})

addEventListener('keyup', ({ keyCode }) => {
    switch (keyCode) {
        case 68:
            keys.right.pressed = false
            break
        case 65:
            keys.left.pressed = false
            break
        case 32:
            keys.space.pressed = false
            break
    }
})

// Player class
class Player {
    constructor (x, y, width, height, color) {
        this.x = x
        this.y = y
        this.width = width
        this.height = height
        this.color = color
        this.velocityCharge = 0
        this.velocity = {
            x: 0.01,
            y: 0.01,
        }
        this.previousVelocity = 0
        this.jumpCharge = false
        this.onPlatform = false
        this.sliding = false
        this.inWind = false
        this.dizzy = false
        this.move = 0
        this.level = 0
    }

    draw() {
        c.beginPath()
        c.fillStyle = this.color
        c.fillRect(this.x, this.y, this.width, this.height)
        c.closePath()
    }

    update() {
        this.x += this.velocity.x
        this.y += this.velocity.y
        this.velocity.y += gravity
        playerMechanics()
        player.previousVelocity = player.velocity.x
        this.draw()
    }
}
// Platform class
class Platform {
    constructor (x, y, width, height, level, surface) {
        this.level = level
        this.x = x
        this.y = y - 600 * this.level
        this.width = width
        this.height = height
        this.color = 'white'
        this.surface = surface
        this.playerOnPlatform = false
        if (surface === undefined) this.surface = 0
        if (this.surface === 0) this.color = 'rgba(255, 255, 255, 1)'
        else if (this.surface === 1) this.color = 'rgba(184, 255, 246, 1)'
        else if (this.surface === 2) this.color = 'rgba(86, 190, 245, 1)'
    }

    draw() {
        c.beginPath()
        c.fillStyle = this.color
        c.fillRect(this.x, this.y, this.width, this.height)
        c.closePath()
    }

    update() {
        this.draw()
    }
}
// Slide
class Slide {
    constructor (x1, y1, x2, y2, level) {
        this.level = level
        this.x1 = x1
        this.y1 = y1 - 600 * this.level
        this.x2 = x2
        this.y2 = y2 - 600 * this.level
        this.color = 'rgba(220, 194, 255, 1)'
    }

    draw() {
        c.beginPath()
        c.fillStyle = this.color
        c.moveTo(this.x1, this.y1)
        c.lineTo(this.x1, this.y2)
        c.lineTo(this.x2, this.y2)
        c.lineTo(this.x1, this.y1)
        c.fill()
        c.closePath()
    }

    update() {
        this.draw()
    }
}
// Wind
class Wind {
    constructor (level) {
        this.level = level
        this.x = 0
        this.y = 0 - 600 * this.level
        this.width = 800
        this.height = 600
    }

    draw() {
        c.beginPath()
        c.fillStyle = 'rgba(255, 255, 255, 0.15)'
        c.fillRect(this.x, this.y, this.width, this.height)
        c.closePath()
    }

    update() {
        this.draw()
    }
}
// Wind Particle
class WindParticle {
    constructor () {
        this.x = Math.random() * canvas.width
        this.y = Math.random() * canvas.height
        this.radius = Math.random() * 2 + 1
        this.randomVelocity = Math.random()
        this.color = 'rgba(255, 255, 255, 1)'
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
        this.y += 0.5 + (this.randomVelocity / 3)
        if (this.x > canvas.width) this.x = 1
        else if (this.x < 0) this.x = canvas.width - 1
        this.x += windForce * 2 + (this.randomVelocity / 2 * windForce)
    }
}
// Map platforms
class Image {
    constructor (src) {
        this.src = src
        this.x = 0
        this.y = 0
        this.scroll = 42
        this.opacity = 1

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
// Animate canvas
function animate() {
    requestAnimationFrame(animate)
    c.save()
    c.globalAlpha = 0.8
    c.fillStyle = 'rgba(80, 80, 80, 1)'
    c.fillRect(0, 0, canvas.width, canvas.height)
    c.restore()

    mapBackground.update()
    player.update()
    platforms.forEach(platform => {
        platform.update()
    })
    slides.forEach(slide => {
        slide.update()
    })
    winds.forEach(wind => {
        wind.update()
    })
    mapPlatforms.update()
    windParticles.forEach(particle => {
        particle.update()
    })
    if (player.level === 0) {
        text.innerText = 'A - Left, D - Right, Space - Jump'
    }
    else {
        text.innerText = `Level: ${player.level}`
    }
    windAcceleration += 0.018
    if (windAcceleration == Math.PI * 2) windAcceleration = 0
    windForce = Math.cos(windAcceleration) * 7
}

// Initiate everything
const mapBackground = new Image(mapBackgroundElement)
const player = new Player(canvas.width / 2 - 20, canvas.height - 300, 40, 50, 'rgb(255, 0, 0)')
const mapPlatforms = new Image(mapPlatformsElement)
for (let i = 0; i < 200; i++) {
    windParticles.push(new WindParticle())
}
initPlatforms()
initPlatforms2()
animate()

// DEV MODE - Press '/' to enable
// "<" - Level Down
// ">" - Level Up
// "LMB" - Teleport Player to cursor's click location
let devMode = false
let gravityTimeout

function gravityRestore() {
    gravity = 0.6
}

function devModeLevelUp() {
    if (devMode === true) {
        platforms.forEach (platform => {
            platform.y -= 600
        })
        slides.forEach (slide => {
            slide.y1 -= 600
            slide.y2 -= 600
        })
        winds.forEach(wind => {
            wind.y -= 600
        })
        player.x = canvas.width / 2 - player.width / 2
        player.y = canvas.height / 2 - player.height / 2
        player.velocity.x = 0
        player.velocity.y = 0
        player.level -= 1
        mapPlatforms.scroll += 1
        mapBackground.scroll += 1
        gravity = 0
        clearTimeout(gravityTimeout)
        gravityTimeout = setTimeout(gravityRestore, 2000)
    }
}

function devModeLevelDown() {
    if (devMode === true) {
        platforms.forEach (platform => {
            platform.y += 600
        })
        slides.forEach (slide => {
            slide.y1 += 600
            slide.y2 += 600
        })
        winds.forEach(wind => {
            wind.y += 600
        })
        player.x = 400 - player.width / 2
        player.y = 300 - player.height / 2
        player.velocity.x = 0
        player.velocity.y = 0
        player.level += 1
        mapPlatforms.scroll -= 1
        mapBackground.scroll -= 1
        gravity = 0
        clearTimeout(gravityTimeout)
        gravityTimeout = setTimeout(gravityRestore, 2000)
    }
}

addEventListener('keypress', ({ keyCode }) => {
    switch (keyCode) {
        case 46:
            devModeLevelDown()
            break
        case 44:
            devModeLevelUp()
            break
        case 47:
            devMode = !devMode
            if (devMode === true) console.log('DevMode: Enabled')
            else if (devMode === false) console.log('DevMode: Disabled')
            break
    }
})

addEventListener('click', (event) => {
    const mouse = {
        x: event.clientX - window.getComputedStyle(canvas).left.slice(0, window.getComputedStyle(canvas).left.indexOf('px')) + canvas.width / 2,
        y: event.clientY - window.getComputedStyle(canvas).top.slice(0, window.getComputedStyle(canvas).top.indexOf('px')) + canvas.height / 2
    }
    if (devMode === true) {
        player.x = mouse.x
        player.y = mouse.y
        player.velocity.x = 0.01
        player.velocity.y = 0.01
        gravity = 0
        clearTimeout(gravityTimeout)
        gravityTimeout = setTimeout(gravityRestore, 700)
    }
})
