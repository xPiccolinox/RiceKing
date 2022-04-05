const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')
canvas.width = 800
canvas.height = 600
const body = document.querySelector('body')
const text = document.getElementById('text')
const mapPlatformsElement = document.getElementById('mapPlatforms')
const mapBackgroundElement = document.getElementById('mapBackground')
const rice = document.getElementById('rice')
const playerTexture = document.getElementById('playerTexture')
const loadingScreen = document.getElementById('loadingScreen')
const loadingBarProgress = document.getElementById('loadingBarProgress')
const menuBg = document.getElementById('menuBg')
const menu = document.getElementById('menuBorder')
const menuResume = document.getElementById('menu_resume')
const menuRestart = document.getElementById('menu_restart')
const menu_name = document.getElementById('menu_name')
const menu_time = document.getElementById('menu_time')
const menu_jumps = document.getElementById('menu_jumps')
const menu_falls = document.getElementById('menu_falls')
const menu_restart = document.getElementById('menuBorderRestart')
const menu_restartYes = document.getElementById('menuRestart_yes')
const menu_restartNo = document.getElementById('menuRestart_no')

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
    },
    esc: {
        pressed: false
    },
    enter: {
        pressed: false
    }
}
const platforms = []
const slides = []
const winds = []
const windParticles = []
let dizzyParticles = []
let player
let windForce = 0
let windAcceleration = 0
let gravity = 0.6
let additionalHeight
let backgroundLoaded = false
let platformsLoaded = false
let animationFrame = 0
let loaded = false
let animationId
let canOpenMenu = false
let menuOpen = false
let menuRestartOpen = false
let restart = false
let restartSelect = false
let gamePaused = false

//  Player movement buttons
addEventListener('keydown', ({ keyCode }) => {
    switch (keyCode) {
        case 68:
            keys.right.pressed = true
            gameMenuSelect()
            break
        case 65:
            keys.left.pressed = true
            gameMenuSelect()
            break
        case 32:
            keys.space.pressed = true
            break
        case 27:
            if (keys.esc.pressed === false) gameMenu()
            keys.esc.pressed = true
            break
        case 13:
            if (keys.enter.pressed === false) gameMenuRestart()
            keys.enter.pressed = true
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
        case 27:
        keys.esc.pressed = false
        break
        case 13:
            keys.enter.pressed = false
            break
    }
})

// Save
function save() {
    localStorage.setItem('save_x', player.x)
    localStorage.setItem('save_y', player.y)
    localStorage.setItem('save_vx', player.velocity.x)
    localStorage.setItem('save_vy', player.velocity.y)
    localStorage.setItem('save_level', player.level)
    localStorage.setItem('save_facingLeft', player.facingLeft)
    localStorage.setItem('save_jumps', jumps)
    localStorage.setItem('save_falls', falls)
    localStorage.setItem('save_timeS', time.s)
    localStorage.setItem('save_timeM', time.m)
    localStorage.setItem('save_timeH', time.h)
    localStorage.setItem('save_timeD', time.d)
}

// Player class
class Player {
    constructor (x, y, vx, vy, level, facingLeft) {
        this.x = x
        this.y = y
        this.width = 40
        this.height = 50
        this.color = 'rgb(255, 0, 0)'
        this.velocityCharge = 0
        this.velocity = {
            x: vx,
            y: vy,
        }
        this.previousVelocity = 0
        this.jumpCharge = false
        this.onPlatform = false
        this.sliding = false
        this.inWind = false
        this.dizzy = false
        this.move = 0
        this.level = level
        this.animation = 0
        if (facingLeft === 'false') this.facingLeft = false
        else this.facingLeft = true
    }

    draw() {
        c.beginPath()
        if (devMode === true) c.fillStyle = this.color
        else c.fillStyle = 'rgba(0, 0, 0, 0)'
        c.fillRect(this.x, this.y, this.width, this.height)
        c.drawImage(playerTexture, 66 * this.animation, 0, 66, 70, this.x - 13, this.y - 10, 66, 70)
        c.closePath()
    }

    update() {
        this.x += this.velocity.x
        this.y += this.velocity.y
        this.velocity.y += gravity
        playerMechanics()
        playerAnimations()
        player.previousVelocity = player.velocity.x
        player.onPlatform = false
        player.inWind = false
        player.sliding = false
        this.draw()
    }
}
// Platform class
class Platform {
    constructor (x, y, width, height, level, surface) {
        this.level = level
        this.x = x
        this.y = y - 600 * (this.level - parseFloat(localStorage.getItem('save_level')))
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
        this.y1 = y1 - 600 * (this.level - parseFloat(localStorage.getItem('save_level')))
        this.x2 = x2
        this.y2 = y2 - 600 * (this.level - parseFloat(localStorage.getItem('save_level')))
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
        this.y = 0 - 600 * (this.level - parseFloat(localStorage.getItem('save_level')))
        this.width = 800
        this.height = 600
    }

    draw() {
        c.beginPath()
        c.fillStyle = 'rgba(255, 255, 255, 0)'
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
// Dizzy Particle
class DizzyParticle {
    constructor (id) {
        this.id = id
        if (player.facingLeft === true) {
            this.x = player.x + player.width / 2 - 5 + Math.random() * 30
            this.velocity = {
                x: Math.random() * 2 + 1,
                y: Math.random() * -4 - 4
            }
        }
        else {
            this.x = player.x + player.width / 2 + 5 - Math.random() * 30
            this.velocity = {
                x: Math.random() * -2 - 1,
                y: Math.random() * -4 - 4
            }
        }
        this.y = player.y + player.height / 2 + Math.random() * 10
        this.h = Math.random() * 4 + 8
        this.w = this.h / 3
        this.rotate = Math.random() * 6.3
        this.rotateSpeed = (Math.random() + 0.5) * 0.05
        this.opacity = 1
        this.opacitySpeed = (Math.random() + 0.5) * 0.025
    }

    draw() {
        c.beginPath()
        c.save()
        c.translate(this.x + this.w, this.y + this.h)
        c.rotate(this.rotate)
        c.globalAlpha = this.opacity
        c.translate(-this.x - this.w, -this.y - this.h)
        c.drawImage(rice, this.x, this.y, this.w, this.h)
        c.fill()
        c.restore()
        c.closePath()
    }

    update() {
        this.draw()
        this.x += this.velocity.x
        this.y += this.velocity.y
        this.velocity.y += gravity * 0.6
        this.rotate += this.rotateSpeed
        if (this.opacity >= 0.05) this.opacity -= this.opacitySpeed
        else this.opacity = 0
    }
}
// Map platforms
class Image {
    constructor (src) {
        this.src = src
        this.x = 0
        this.y = 0
        this.scroll = 42 - parseFloat(localStorage.getItem('save_level'))
        this.opacity = 1
        this.hue = 0
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
    if (gamePaused === false) {
        setTimeout(() => {
            animationId = requestAnimationFrame(animate)
            console.log(animationId)
            c.save()
            c.globalAlpha = 0.8
            c.fillStyle = 'rgba(80, 80, 80, 1)'
            c.fillRect(0, 0, canvas.width, canvas.height)
            c.restore()

            mapBackground.update()
            dizzyParticles.forEach(particle => {
                particle.update()
            })
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
            mapPlatforms.hue += 5
            windParticles.forEach(particle => {
                particle.update()
            })
            if (player.level === 0) {
                text.innerHTML = 'A - Left, D - Right, </br> Space - Jump, Esc - Menu'
            }
            else {
                text.innerHTML = `Level: ${player.level}`
            }
            windAcceleration += 0.018
            if (windAcceleration == Math.PI * 2) windAcceleration = 0
            windForce = Math.cos(windAcceleration) * 7
            if (player.y <= 250 && player.x <= 480) {
                menu.style.top = 'auto'
                menu.style.bottom = '20px'
                menu_restart.style.top = 'auto'
                menu_restart.style.bottom = '20px'
            }
            else {
                menu.style.top = '20px'
                menu.style.bottom = 'auto'
                menu_restart.style.top = '20px'
                menu_restart.style.bottom = 'auto'
            }
            if (player.y <= 170 && player.x >= 570 && player.level === 42) gameReset()
            menuScore()
            save()
        }, 1000 / 80)
    }
}

// Initiate
function saveNaN() {
    return localStorage.length <= 0 ||
        (localStorage.getItem('save_x') == 'NaN' ||
        localStorage.getItem('save_y') == 'NaN' ||
        localStorage.getItem('save_vx') == 'NaN' ||
        localStorage.getItem('save_vy') == 'NaN' ||
        localStorage.getItem('save_level') == 'NaN' ||
        localStorage.getItem('save_facingLeft') == 'NaN') ||
        localStorage.getItem('save_jumps') == 'NaN' ||
        localStorage.getItem('save_falls') == 'NaN' ||
        localStorage.getItem('save_timeS') == 'NaN' ||
        localStorage.getItem('save_timeM') == 'NaN' ||
        localStorage.getItem('save_timeH') == 'NaN' ||
        localStorage.getItem('save_timeD') == 'NaN'
}
if (saveNaN() || !localStorage) {
    localStorage.setItem('save_x', canvas.width / 2 - 20)
    localStorage.setItem('save_y', canvas.height / 5 * 4)
    localStorage.setItem('save_vx', 0.01)
    localStorage.setItem('save_vy', 0.01)
    localStorage.setItem('save_level', 0)
    localStorage.setItem('save_facingLeft', false)
    localStorage.setItem('save_jumps', 0)
    localStorage.setItem('save_falls', 0)
    localStorage.setItem('save_timeS', 0)
    localStorage.setItem('save_timeM', 0)
    localStorage.setItem('save_timeH', 0)
    localStorage.setItem('save_timeD', 0)
    console.log('LOCAL STORAGE RESET')
}

let time = {
    s: parseFloat(localStorage.getItem('save_timeS')),
    m: parseFloat(localStorage.getItem('save_timeM')),
    h: parseFloat(localStorage.getItem('save_timeH')),
    d: parseFloat(localStorage.getItem('save_timeD'))
}
let jumps = parseFloat(localStorage.getItem('save_jumps'))
let falls = parseFloat(localStorage.getItem('save_falls'))
const mapBackground = new Image(mapBackgroundElement)
player = new Player(parseFloat(localStorage.getItem('save_x')), parseFloat(localStorage.getItem('save_y')), parseFloat(localStorage.getItem('save_vx')), parseFloat(localStorage.getItem('save_vy')), parseFloat(localStorage.getItem('save_level')), localStorage.getItem('save_facingLeft'))
const mapPlatforms = new Image(mapPlatformsElement)
for (let i = 0; i < 200; i++) {
    windParticles.push(new WindParticle())
}
initPlatforms()
initPlatforms2()

// Timer count
function timer() {
    if (menuOpen === false && canOpenMenu === true) {
        time.s += 1
        if (time.s >= 60) {
            time.s = 0
            time.m += 1
        }
        if (time.m >= 60) {
            time.m = 0
            time.h += 1
        }
        if (time.h >= 24) {
            time.h = 0
            time.d += 1
        }
        if (time.d >= 100) {
           time.s = 0
           time.m = 0
           time.h = 0
           time.d = 0
        }
    }
}
setInterval(timer, 1000)