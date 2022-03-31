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
        jumps = 0
        falls = 0
        time = {
            s: 0,
            m: 0,
            h: 0,
            d: 0
        }
        animate()
        cancelAnimationFrame(animationId)
    }, 2000)
    setTimeout(function() {
        menuBg.style.animationPlayState = 'paused'
        canOpenMenu = true
        animate()
    }, 4000)
}

// Menu Score (time in canvas.js)
function menuScore() {
    // Level name
    switch (true) {
        case (player.level <= -2):
            menu_name.innerText = 'The Void (you better restart)'
            break
        case (player.level == -1):
            menu_name.innerText = 'Test Area'
            break
        case (player.level <= 4):
            menu_name.innerText = 'The Forest'
            break
        case (player.level <= 9):
            menu_name.innerText = 'Drained Dungeon'
            break
        case (player.level <= 13):
            menu_name.innerText = 'The Castle'
            break
        case (player.level <= 18):
            menu_name.innerText = 'Abandoned Town'
            break
        case (player.level <= 24):
            menu_name.innerText = 'Snow Fortress'
            break
        case (player.level <= 31):
            menu_name.innerText = 'Windstorm Mountain Peak'
            break
        case (player.level <= 35):
            menu_name.innerText = 'Cathedral'
            break
        case (player.level <= 38):
            menu_name.innerText = 'The Glaze'
            break
        case (player.level <= 41):
            menu_name.innerText = 'The Tower'
            break
        case (player.level == 42):
            menu_name.innerText = 'The Great Rice God'
            break
        case (player.level >= 43):
            menu_name.innerText = 'How did you even get here?'
            break
    }
    // Jumps & falls
    menu_jumps.innerText = `Jumps: ${parseFloat(localStorage.getItem('save_jumps'))}`
    menu_falls.innerText = `Falls: ${parseFloat(localStorage.getItem('save_falls'))}`
    // Timer
    menu_time.innerText = `Time: ${time.d}d ${time.h}h ${time.m}m ${time.s}s`
}

// Dev Mode
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