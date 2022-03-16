function playerAnimations() {
    // Player face left after previous movement
    if (player.previousVelocity > 0) player.facingLeft = false
    else if (player.previousVelocity < 0) player.facingLeft = true

    // In air
    if (player.onPlatform === false) {
        // Up
        if (player.velocity.y < 0) {
            // Left
            if (player.velocity.x < 0) player.animation = 9
            // Straight
            else if (player.velocity.x === 0) player.animation = 13
            // Right
            else if (player.velocity.x > 0) player.animation = 11
        }
        // Down
        else if (player.velocity.y > 0) {
            if (player.velocity.x < 0) player.animation = 10
            // Straight
            else if (player.velocity.x === 0) player.animation = 14
            // Right
            else if (player.velocity.x > 0) player.animation = 12
        }
    }
    // Jump charge
    else if (player.jumpCharge === true) player.animation = 8
    // Dizzy on platform
    else if (player.onPlatform === true & player.dizzy === true) {
        if (player.facingLeft === true) player.animation = 15
        else if (player.facingLeft === false) player.animation = 16
    }
    // Move & idle (on platform & not dizzy)
    else if (player.onPlatform === true && player.dizzy === false) {
        // Move left
        if ((keys.left.pressed === true && keys.right.pressed === false) || 
        (keys.left.pressed === true && keys.right.pressed === true)) {
            if (animationFrame <= 15) player.animation = 0
            else if (animationFrame <= 30) player.animation = 2
            else if (animationFrame <= 45) player.animation = 0
            else if (animationFrame <= 60) player.animation = 3
        }
        // Move right
        else if (keys.left.pressed === false && keys.right.pressed === true) {
            if (animationFrame <= 15) player.animation = 4
            else if (animationFrame <= 30) player.animation = 6
            else if (animationFrame <= 45) player.animation = 4
            else if (animationFrame <= 60) player.animation = 7
        }
        // Idle
        else if (keys.left.pressed === false && keys.right.pressed === false) {
            // If previously moved left
            if (player.facingLeft === true) {
                if (animationFrame <= 30) player.animation = 0
                else if (animationFrame <= 60) player.animation = 1
            }
            // If previously moved right
            else if (player.facingLeft === false) {
                if (animationFrame <= 30) player.animation = 4
                else if (animationFrame <= 60) player.animation = 5
            }
        }
    }
    if (animationFrame >= 60) animationFrame = 0
    animationFrame += 1.5
}