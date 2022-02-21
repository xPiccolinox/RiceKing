function playerMechanics() {
    // Player falling speed limit
    if (player.velocity.y >= 20) {
        player.velocity.y = 20
    }
    // Center Player if he fell 400px outside of the Canvas borders
    function playerOutsideMap(player) {
        return player.x < -400 ||
        player.x > canvas.width + 400 ||
        player.y < -400 ||
        player.y > canvas.height + 400
    }
    if (playerOutsideMap(player)) {
        player.x = canvas.width / 2 - player.width / 2
        player.y = canvas.height / 2 - player.height / 2
    }

    // Canvas side borders as walls
    if (player.x <= 0) {
        player.x = 0
        player.velocity.x = 0
    } else if (player.x + player.width > canvas.width) {
        player.x = canvas.width - player.width
        player.velocity.x = 0
    }

    // Player map scroll
        // Level up
        if (player.y + player.height / 2 < 0 ) {
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
            player.y = 599 - player.height / 2
            player.level += 1
        // Level down
        } else if (player.y + player.height / 2 > 600) {
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
            player.y = 1 + player.height / 2
            player.level -= 1
        }
    // Player collision check with every platform (top and bottom)
    platforms.forEach(platform => {
        function playerPlatformCollisionFromTop(player, platform) {
            // if (platform.height >= 30) additionalHeight = platform.height / 2
            // else additionalHeight = 15
            if (player.velocity.y === 0.6) additionalHeight = 15
            else additionalHeight = 20
            return player.x + player.width > platform.x &&
            player.x < platform.x + platform.width &&
            player.velocity.y > 0 &&
            player.velocity.y != 5.5 &&
            player.velocity.y != 6.1 &&
            player.y + player.height + player.velocity.y >= platform.y &&
            player.y + player.height + player.velocity.y <= platform.y + additionalHeight
        }
        function playerPlatformCollisionFromBottom(player, platform) {
            return player.x + player.width > platform.x &&
                player.x < platform.x + platform.width &&
                player.velocity.y < 0 &&
                player.y + player.velocity.y <= platform.y + platform.height + 2 &&
                player.y + player.velocity.y >= platform.y + platform.height - 18
        }
        if (playerPlatformCollisionFromTop(player, platform)) {
            if (platform.surface === 0) {
                player.velocity.x = 0
                player.move = 0
                platform.color = 'rgba(255, 210, 97, 1)'
            } else if (platform.surface === 1) {
                player.velocity.x = 0
                player.move = 1
                platform.color = 'rgba(120, 255, 237, 1)'
            } else if (platform.surface === 2) {
                player.velocity.x *= 0.98
                player.move = 2
                platform.color = 'rgba(0, 148, 227, 1)'
            }
            player.velocity.y = 0
            player.y = platform.y - player.height + 0.1
            player.onPlatform = true
        }
        else if (playerPlatformCollisionFromBottom(player, platform)) {
            player.y = platform.y + platform.height
            player.velocity.y = 0.001
            player.velocity.x *= 0.3
        }
        else {
            if (platform.surface === 0) platform.color = 'rgba(255, 255, 255, 1)'
            else if (platform.surface === 1) platform.color = 'rgba(184, 255, 246, 1)'
            else if (platform.surface === 2) platform.color = 'rgba(86, 190, 245, 1)'
        }
    })
    // Player collision check with every platform (left and right)
    platforms.forEach(platform => {
        function playerPlatformCollisionFromRight(player, platform) {
            return player.y + player.height >= platform.y + 1 &&
            player.y <= platform.y + platform.height - 1 &&
            player.x + player.velocity.x <= platform.x + platform.width &&
            player.x + player.velocity.x >= platform.x + platform.width - 15 &&
            player.velocity.y != 5.5 &&
            player.velocity.y != 6.1
        }
        function playerPlatformCollisionFromLeft(player, platform) {
            return player.y + player.height > platform.y + 1 &&
            player.y < platform.y + platform.height - 1 &&
            player.x + player.width + player.velocity.x >= platform.x &&
            player.x + player.width + player.velocity.x <= platform.x + 15 &&
            player.velocity.y != 5.5 &&
            player.velocity.y != 6.1
        }
        if (playerPlatformCollisionFromRight(player, platform)) {
            player.x = platform.x + platform.width + 1
            if (player.onPlatform === false) player.velocity.x = 4
            else if (player.onPlatform === true) player.velocity.x = 0
        }
        else if (playerPlatformCollisionFromLeft(player, platform)) {
            player.x = platform.x - player.width - 1
            if (player.onPlatform === false) player.velocity.x = -4
            else if (player.onPlatform === true) player.velocity.x = 0
        }
    })
    // Player collision with every slide
    slides.forEach(slide => {
        function slideCornerTopRight(slide) {
            return slide.x1 > slide.x2 && slide.y1 > slide.y2
        }
        function slideCornerTopLeft(slide) {
            return slide.x1 < slide.x2 && slide.y1 > slide.y2
        }
        function slideCornerBottomRight(slide) {
            return slide.x1 > slide.x2 && slide.y1 < slide.y2
        }
        function slideCornerBottomLeft(slide) {
            return slide.x1 < slide.x2 && slide.y1 < slide.y2
        }
        if (slideCornerTopRight(slide)) {
            function playerSlideTopRightCollisionFromTop(player, slide) {
                return player.x + player.width > slide.x2 &&
                player.x < slide.x1 &&
                player.velocity.y > 0 &&
                player.velocity.y != 5.5 &&
                player.velocity.y != 6.1 &&
                player.y + player.height + player.velocity.y >= slide.y2 &&
                player.y + player.height + player.velocity.y <= slide.y2 + 20
            }
            function playerSlideTopRightCollisionFromRight(player, slide) {
                return player.y + player.height >= slide.y2 + 1 &&
                player.y <= slide.y1 - 1 &&
                player.x + player.velocity.x <= slide.x1 &&
                player.x > slide.x1
            }
            function playerSlideTopRightCollisionSlide(player, slide) {
                return player.x + player.width + player.velocity.x > slide.x2 &&
                player.x < slide.x1 &&
                player.y + player.height > slide.y2 + 1 &&
                player.y < slide.y1 - 1 &&
                player.y <= slide.y2 + Math.abs(slide.x2 - player.x - player.width) / (slide.x1 - slide.x2) * (slide.y1 - slide.y2)
            }
            if (playerSlideTopRightCollisionFromTop(player, slide)) {
                player.y = slide.y2 - player.height + 0.1
                player.velocity.y = 0
                player.velocity.x = 0
                player.onPlatform = true
                slide.color = 'rgba(189, 140, 255, 1)'
            }
            else if (playerSlideTopRightCollisionFromRight(player, slide)) {
                player.x = slide.x1
                if (player.velocity.y !== 0) player.velocity.x = 4
                else if (player.velocity.y === 0) player.velocity.x = 0
            }
            else if (playerSlideTopRightCollisionSlide(player, slide)) {
                player.y = slide.y2 + Math.abs(slide.x2 - player.x - player.width) / (slide.x1 - slide.x2) * (slide.y1 - slide.y2)
                player.velocity.x = -4
                player.velocity.y = -0.4
            }
            else {
                slide.color = 'rgba(255, 255, 255, 1)'
            }
        }
        else if (slideCornerTopLeft(slide)) {
            function playerSlideTopLeftCollisionFromTop(player, slide) {
                return player.x + player.width > slide.x1 &&
                player.x + player.velocity.x < slide.x2 &&
                player.velocity.y > 0 &&
                player.velocity.y != 5.5 &&
                player.velocity.y != 6.1 &&
                player.y + player.height + player.velocity.y >= slide.y2 &&
                player.y + player.height + player.velocity.y <= slide.y2 + 20
            }
            function playerSlideTopLeftCollisionFromLeft(player, slide) {
                return player.y + player.height >= slide.y2 + 1 &&
                player.y <= slide.y1 - 1 &&
                player.x + player.width + player.velocity.x >= slide.x1 &&
                player.x + player.width < slide.x1
            }
            function playerSlideTopLeftCollisionSlide(player, slide) {
                return player.x + player.width > slide.x1 &&
                player.x < slide.x2 &&
                player.y + player.height > slide.y2 + 1 &&
                player.y < slide.y1 - 1 &&
                player.y <= slide.y2 - Math.abs(slide.x2 - player.x) / (slide.x2 - slide.x1) * (slide.y2 - slide.y1)
            }
            if (playerSlideTopLeftCollisionFromTop(player, slide)) {
                player.y = slide.y2 - player.height + 0.1
                player.velocity.y = 0
                player.velocity.x = 0
                player.onPlatform = true
                slide.color = 'rgba(189, 140, 255, 1)'
            }
            else if (playerSlideTopLeftCollisionFromLeft(player, slide)) {
                player.x = slide.x1 - player.width
                if (player.velocity.y !== 0) player.velocity.x = -4
                else if (player.velocity.y === 0) player.velocity.x = 0
            }
            else if (playerSlideTopLeftCollisionSlide(player, slide)) {
                player.y = slide.y2 - Math.abs(slide.x2 - player.x) / (slide.x2 - slide.x1) * (slide.y2 - slide.y1)
                        player.velocity.x = 4
                        player.velocity.y = -0.4
            }
            else {
                slide.color = 'rgba(255, 255, 255, 1)'
            }
        }
        else if (slideCornerBottomRight(slide)) {
            function playerSlideBottomRightCollisionFromBottom(player, slide) {
                return player.x + player.width > slide.x2 &&
                player.x < slide.x1 &&
                player.velocity.y < 0 &&
                player.y + player.velocity.y <= slide.y2 &&
                player.y + player.velocity.y >= slide.y2 - 20
            }
            function playerSlideBottomRightCollisionFromRight(player, slide) {
                return player.y + player.height >= slide.y1 + 1 &&
                player.y <= slide.y2 &&
                player.x + player.velocity.x <= slide.x1 &&
                player.x >= slide.x1
            }
            function playerSlideBottomRightCollisionFromSlide(player, slide) {
                return player.x + player.width > slide.x2 &&
                player.x < slide.x1 &&
                player.y + player.height > slide.y1 &&
                player.y < slide.y2 &&
                player.y + player.height >= slide.y2 - 10 + Math.abs(slide.x2 - player.x - player.width) / (slide.x1 - slide.x2) * (slide.y1 - slide.y2)
            }
            if (playerSlideBottomRightCollisionFromBottom(player, slide)) {
                player.y = slide.y2
                player.velocity.y = 0.001
                player.velocity.x *= 0.3
            }
            else if (playerSlideBottomRightCollisionFromRight(player, slide)) {
                player.x = slide.x1
                if (player.velocity.y !== 0) player.velocity.x = 4
                else if (player.velocity.y === 0) player.velocity.x = 0
            }
            else if (playerSlideBottomRightCollisionFromSlide(player, slide)) {
                if (player.x + player.width > slide.x2 && player.x + player.width < slide.x1) {
                    player.y = slide.y2 - player.height + Math.abs(slide.x2 - player.x - player.width) / (slide.x1 - slide.x2) * (slide.y1 - slide.y2) - 5
                    if (player.velocity.x > 0) {
                        player.velocity.x = player.velocity.x * 0.8 - 0.2
                    } else if (player.velocity.x > -14) {
                        player.velocity.x -= 0.3
                    }
                    player.velocity.y = 5.5
                    slide.color = 'rgba(189, 140, 255, 1)'
                } else if (player.x + player.width >= slide.x1 && player.x < slide.x1 && player.velocity.y != 0 && player.y + player.height >= slide.y1 + 5) {
                    player.velocity.y = 0.1
                    player.y = slide.y1 - player.height
                    if (player.velocity.x > -7)
                    player.velocity.x -= 3
                    player.velocity.y = 5.5
                }
            }
            else {
                slide.color = 'rgba(255, 255, 255, 1)'
            }
        }
        else if (slideCornerBottomLeft(slide)) {
            function playerSlideBottomLeftCollisionFromBottom(player, slide) {
                return player.x + player.width > slide.x1 &&
                player.x < slide.x2 &&
                player.velocity.y < 0 &&
                player.y + player.velocity.y <= slide.y2 &&
                player.y + player.velocity.y >= slide.y2 - 20
            }
            function playerSlideBottomLeftCollisionFromLeft(player, slide) {
                return player.y + player.height >= slide.y1 + 1 &&
                player.y <= slide.y2 &&
                player.x + player.width + player.velocity.x >= slide.x1 &&
                player.x + player.width <= slide.x1
            }
            function playerSlideBottomLeftCollisionSlide(player, slide) {
                return player.x + player.width > slide.x1 &&
                player.x < slide.x2 &&
                player.y + player.height > slide.y1 &&
                player.y < slide.y2 &&
                player.y + player.height >= slide.y2 - 10 - Math.abs(slide.x2 - player.x) / (slide.x2 - slide.x1) * (slide.y2 - slide.y1)
            }
            if (playerSlideBottomLeftCollisionFromBottom(player, slide)) {
                player.y = slide.y2
                player.velocity.y = 0.001
                player.velocity.x *= 0.3
            }
            else if (playerSlideBottomLeftCollisionFromLeft(player, slide)) {
                player.x = slide.x1 - player.width
                if (player.velocity.y !== 0) player.velocity.x = -4
                else if (player.velocity.y === 0) player.velocity.x = 0
            }
            else if (playerSlideBottomLeftCollisionSlide(player, slide)) {
                if (player.x > slide.x1 && player.x < slide.x2) {
                    player.y = slide.y2 - player.height - Math.abs(slide.x2 - player.x) / (slide.x2 - slide.x1) * (slide.y2 - slide.y1) - 5
                    if (player.velocity.x < 0) {
                        player.velocity.x = player.velocity.x * 0.8 + 0.2
                    } else if (player.velocity.x < 14) {
                        player.velocity.x += 0.3
                    }
                    player.velocity.y = 5.5
                    slide.color = 'rgba(189, 140, 255, 1)'
                } else if (player.x + player.width > slide.x1 && player.x <= slide.x1 && player.velocity.y != 0 && player.y + player.height >= slide.y1 + 5) {
                    player.velocity.y = 0.1
                    player.y = slide.y1 - player.height
                    if (player.velocity.x < 7) {
                    player.velocity.x += 3
                    player.velocity.y = 5.5
                    }
                }
            }
            else {
                slide.color = 'rgba(255, 255, 255, 1)'
            }
        }
    })
    // Player in wind
    winds.forEach(wind => {
        function playerInWind(wind) {
            return player.y + player.height > wind.y + 1 &&
            player.y < wind.y + wind.height - 1
        }
        if (playerInWind(wind)) {
            player.inWind = true
            // Player on normal or ice platform
            if (player.onPlatform === true && player.move !== 1) {
                player.velocity.x = windForce * 0.1
            }
            // Player on snow
            else if (player.onPlatform === true && player.move === 1) {
                player.velocity.x = 0
            }
            // Player in mid-air
            else if (player.onPlatform === false) {
                player.velocity.x += windForce * 0.05
            }
        }
    })
    // Player movement left & right
    function playerMoveLeft(keys, player) {
        return keys.left.pressed &&
        !keys.space.pressed &&
        player.velocity.y === 0 &&
        player.move !== 1
    }
    function playerMoveRight(keys, player) {
        return keys.right.pressed &&
        !keys.space.pressed &&
        player.velocity.y === 0 &&
        player.move !== 1
    }
    if (playerMoveLeft(keys, player)) {
        if (player.move === 0) {
            player.velocity.x = -4
        } else if (player.move === 2) {
            player.velocity.x += -0.15
        }
    } else if (playerMoveRight(keys, player)) {
        if (player.move === 0) {
            player.velocity.x = 4
        } else if (player.move === 2) {
            player.velocity.x += 0.15
        }
    }
        // Jump charge (stop moving)
    if (keys.space.pressed && player.velocity.y == 0) {
        player.color = 'green'
        player.velocityCharge += 0.3
        player.jumpCharge = true
        // Auto-jump if velocityCharge > 18
            // Jump left
        if (keys.space.pressed && keys.left.pressed && player.velocityCharge >= 18 && player.onPlatform === true) {
            if (player.move === 2 && player.velocity.x > 2) {
                player.velocity.x = -1
            } else {
                player.velocity.x = -7
            }
            player.velocity.y = -18
            player.color = 'red'
            player.velocityCharge = 0
            keys.space.pressed = false
            player.jumpCharge = false
        }
            // Jump right
        else if (keys.space.pressed && keys.right.pressed && player.velocityCharge >= 18 && player.onPlatform === true) {
            if (player.move === 2 && player.velocity.x < -2) {
                player.velocity.x = 1
            } else {
                player.velocity.x = 7
            }
            player.velocity.y = -18
            player.color = 'red'
            player.velocityCharge = 0
            keys.space.pressed = false
            player.jumpCharge = false
        }
            // Jump straight up (neither left or right is being hold)
        else if (keys.space.pressed && !keys.left.pressed && !keys.right.pressed && player.velocityCharge >= 18 && player.onPlatform === true) {
            player.velocity.y = -18
            player.color = 'red'
            player.velocityCharge = 0
            keys.space.pressed = false
            player.jumpCharge = false
        }
    }
    // Jump if 'SPACE' isn't being hold anymore
        // Jump left
    else if (!keys.space.pressed && keys.left.pressed && player.velocityCharge > 0.5 && player.onPlatform === true) {
        if (player.move === 2 && player.velocity.x > 2) {
            player.velocity.x = -1
        } else {
            player.velocity.x = -7
        }
        player.velocity.y = -player.velocityCharge
        player.color = 'red'
        player.velocityCharge = 0
        player.jumpCharge = false
    }
        // Jump right
    else if (!keys.space.pressed && keys.right.pressed && player.velocityCharge > 0.5 && player.onPlatform === true) {
        if (player.move === 2 && player.velocity.x < -2) {
            player.velocity.x = 1
        } else {
            player.velocity.x = 7
        }
        player.velocity.y = -player.velocityCharge
        player.color = 'red'
        player.velocityCharge = 0
        player.jumpCharge = false
    }
        // Jump straight up
    else if (!keys.space.pressed && !keys.left.pressed && !keys.right.pressed && player.velocityCharge > 0.5 && player.onPlatform === true) {
        player.velocity.y = -player.velocityCharge
        player.velocity.x = player.velocity.x
        player.color = 'red'
        player.velocityCharge = 0
    }
    // Player bounce of the wall if in mid-air and collided
    if (player.velocity.x == 0 && player.velocity.y != 0 && player.previousVelocity > 1 && player.jumpCharge === false) {
        player.velocity.x = -4
    }
    else if (player.velocity.x == 0 && player.velocity.y != 0 && player.previousVelocity < -1 && player.jumpCharge === false) {
        player.velocity.x = 4
    }
    // Wind particles visible if Player is in Wind area
    if (player.inWind === true && player.y + player.height / 2 > 0 && player.y + player.height / 2 < 600) {
        windParticles.forEach(windParticle => {
            windParticle.color = 'rgba(255, 255, 255, 1)'
        })        
    }
    else {
        windParticles.forEach(windParticle => {
        windParticle.color = 'rgba(255, 255, 255, 0)'
        })
    }
    player.onPlatform = false
    player.inWind = false
}