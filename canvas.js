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
    animationId = requestAnimationFrame(animate)
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
    windParticles.forEach(particle => {
        particle.update()
    })
    if (player.level === 0) {
        text.innerText = 'A - Left, D - Right, Space - Jump, Esc - Menu'
    }
    else {
        text.innerText = `Level: ${player.level}`
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
    save()
}

// Initiate everything
function saveNaN() {
    return localStorage.length <= 0 ||
        (localStorage.getItem('save_x') == 'NaN' &&
        localStorage.getItem('save_y') == 'NaN' &&
        localStorage.getItem('save_vx') == 'NaN' &&
        localStorage.getItem('save_vy') == 'NaN' &&
        localStorage.getItem('save_level') == 'NaN' &&
        localStorage.getItem('save_facingLeft') == 'NaN')
}
if (saveNaN()) {
    localStorage.setItem('save_x', canvas.width / 2 - 20)
    localStorage.setItem('save_y', canvas.height / 5 * 4)
    localStorage.setItem('save_vx', 0.01)
    localStorage.setItem('save_vy', 0.01)
    localStorage.setItem('save_level', 0)
    localStorage.setItem('save_facingLeft', false)
}
const mapBackground = new Image(mapBackgroundElement)
player = new Player(parseFloat(localStorage.getItem('save_x')), parseFloat(localStorage.getItem('save_y')), parseFloat(localStorage.getItem('save_vx')), parseFloat(localStorage.getItem('save_vy')), parseFloat(localStorage.getItem('save_level')), localStorage.getItem('save_facingLeft'))
const mapPlatforms = new Image(mapPlatformsElement)
for (let i = 0; i < 200; i++) {
    windParticles.push(new WindParticle())
}
initPlatforms()
initPlatforms2()

// Loading
let loadingProgress = 3
function loadingOpacity() {
    loadingScreen.style.animationPlayState = 'running'
    animate()
    cancelAnimationFrame(animationId)
    setTimeout(animate, 2000)
    setTimeout(function(){canOpenMenu = true}, 2000)
}
function loadingBarFull() {
    loadingBarProgress.style.width = '0px'
    if (loaded === false) setTimeout(loadingOpacity, 200)
    loaded = true
}
function loadingBarProgressForward() {
    loadingProgress -= 1
    loadingBarProgress.style.width = `calc(196px * ${(loadingProgress + 1) / 4})`
    if (loadingProgress == 0) setTimeout(loadingBarFull, 1000)
}
mapBackgroundElement.onload = function() {loadingBarProgressForward()}
mapPlatformsElement.onload = function() {loadingBarProgressForward()}
playerTexture.onload = function() {loadingBarProgressForward()}
setTimeout(loadingBarFull, 5000)

// Game Menu
function gameMenu() {
    if (canOpenMenu === true) {
        if (menuOpen === false) {
            menu.style.display = 'block'
            cancelAnimationFrame(animationId)
            menuOpen = true
            restart = false
            restartSelect = false
            gameMenuHighlight()
        }
        else if (menuOpen === true) {
            menu.style.display = 'none'
            menu_restart.style.display = 'none'
            requestAnimationFrame(animate)
            gameMenuSelect()
            menuOpen = false
            menuRestartOpen = false
            restart = false
            restartSelect = false
        }
    }
}
function gameMenuSelect() {
    if (menuOpen === true) {
        if (keys.right.pressed && menuRestartOpen === false) {
            restart = true
            gameMenuHighlight()
        }
        else if (keys.left.pressed && menuRestartOpen === false) {
            restart = false
            gameMenuHighlight()
        }
        if (keys.right.pressed && menuRestartOpen === true) {
            restartSelect = false
            gameMenuHighlight()
        }
        else if (keys.left.pressed && menuRestartOpen === true) {
            restartSelect = true
            gameMenuHighlight()
        }
    }
}
function gameMenuRestart() {
    if (menuOpen === true) {
        if (restart === true && menuRestartOpen === false) {
            menu_restart.style.display = 'block'
            menuRestartOpen = true
        }
        else if (restart === false && menuRestartOpen === false) {
            menu_restart.style.display = 'none'
            menu.style.display = 'none'
            menuOpen = false
            menuRestartOpen = false
            requestAnimationFrame(animate)
        }
        else if (restartSelect === true && menuRestartOpen === true) {
            gameReset()
        }
        else if (restartSelect === false && menuRestartOpen === true) {
            menu_restart.style.display = 'none'
            restartSelect = false
            menuRestartOpen = false
        }
    }
}
function gameMenuHighlight() {
    if (restart === true) {
        menuRestart.style.color = 'rgba(255, 220, 60, 1)'
        menuResume.style.color = 'rgba(255, 255, 255, 1)'
    }
    else if (restart === false) {
        menuRestart.style.color = 'rgba(255, 255, 255, 1)'
        menuResume.style.color = 'rgba(255, 220, 60, 1)'
    }
    if (restartSelect === true) {
        menu_restartYes.style.color = 'rgba(255, 220, 60, 1)'
        menu_restartNo.style.color = 'rgba(255, 255, 255, 1)'
    }
    else if (restartSelect === false) {
        menu_restartYes.style.color = 'rgba(255, 255, 255, 1)'
        menu_restartNo.style.color = 'rgba(255, 220, 60, 1)'
    }
}
function gameReset() {
    cancelAnimationFrame(animationId)
    canOpenMenu = false
    menuOpen = false
    menuRestartOpen = false
    menu.style.display = 'none'
    menu_restart.style.display = 'none'
    menuBg.style.animationPlayState = 'running'
    setTimeout(function() {
        platforms.forEach (platform => {
            platform.y -= 600 * player.level
        })
        slides.forEach (slide => {
            slide.y1 -= 600 * player.level
            slide.y2 -= 600 * player.level
        })
        winds.forEach(wind => {
            wind.y -= 600 * player.level
        })
        mapPlatforms.scroll += player.level
        mapBackground.scroll += player.level
        player.level = 0
        player.x = canvas.width / 2 - 20
        player.y = canvas.height / 5 * 4
        player.velocity.x = 0.01
        player.velocity.y = 0.01
        player.facingLeft = false
        animate()
        cancelAnimationFrame(animationId)
    }, 2000)
    setTimeout(function() {
        menuBg.style.animationPlayState = 'paused'
        canOpenMenu = true
        animate()
    }, 4000)
}
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
