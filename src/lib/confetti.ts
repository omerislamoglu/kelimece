import confetti from 'canvas-confetti'

export function firePangramConfetti() {
  confetti({
    particleCount: 80,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#4f46e5', '#8b5cf6', '#a78bfa', '#6366f1', '#10b981'],
    ticks: 150,
    gravity: 1.2,
    scalar: 0.9,
  })
}

export function fireAllFoundConfetti() {
  const duration = 2000
  const end = Date.now() + duration

  function frame() {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: ['#4f46e5', '#8b5cf6', '#10b981'],
    })
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: ['#4f46e5', '#8b5cf6', '#10b981'],
    })

    if (Date.now() < end) {
      requestAnimationFrame(frame)
    }
  }

  frame()
}
