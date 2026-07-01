'use client'

export function slideInOut() {
  try {
    document.documentElement.animate(
      [
        {
          opacity: 1,
          transform: 'translateY(0)'
        },
        {
          opacity: 0.2,
          scale: 0.8,
          transform: 'translateY(-35%)'
        }
      ],
      {
        duration: 1000,
        easing: 'cubic-bezier(0.87, 0, 0.13, 1)',
        fill: 'forwards',
        pseudoElement: '::view-transition-old(root)'
      }
    )

    document.documentElement.animate(
      [
        {
          clipPath: 'polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)'
        },
        {
          clipPath: 'polygon(0% 100%, 100% 100%, 100% 0%, 0% 0%)'
        }
      ],
      {
        duration: 1000,
        easing: 'cubic-bezier(0.87, 0, 0.13, 1)',
        fill: 'forwards',
        pseudoElement: '::view-transition-new(root)'
      }
    )
  } catch {
    /* empty */
  }
}

export function upPage() {
  document.documentElement.animate(
    [
      {
        scale: 1,
        opacity: 1,
        transform: 'translateY(0)',
        filter: 'blur(0)'
      },
      {
        scale: 0.85,
        opacity: 1,
        transform: 'translateY(5%)',
        filter: 'blur(8px)'
      },
      {
        scale: 0.85,
        opacity: 0.9,
        transform: 'translateY(5%)',
        filter: 'blur(16px)'
      }
    ],
    {
      duration: 1000,
      easing: 'cubic-bezier(0.5, 0.2, 0.3, 1)',
      fill: 'forwards',
      pseudoElement: '::view-transition-old(root)'
    }
  )

  document.documentElement.animate(
    [
      {
        transform: 'translateY(200%)'
      },
      {
        transform: 'translateY(100%)'
      },
      {
        transform: 'translateY(0)'
      }
    ],
    {
      duration: 1000,
      easing: 'cubic-bezier(0.5, 0.2, 0.3, 1)',
      fill: 'none',
      pseudoElement: '::view-transition-new(root)'
    }
  )
}

export function circle() {
  try {
    document.documentElement.animate(
      {
        clipPath: ['circle(0 at 50% 50%)', 'circle(100% at 50% 50%)']
      },
      {
        duration: 800,
        pseudoElement: '::view-transition-new(root)'
      }
    )
  } catch {
    /* empty */
  }
}

export function circleExpand(event: MouseEvent) {
  try {
    const x = event.clientX
    const y = event.clientY
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    )

    document.documentElement.animate([{ opacity: 1 }, { opacity: 0 }], {
      duration: 1000,
      easing: 'ease-out',
      fill: 'forwards',
      pseudoElement: '::view-transition-old(root)'
    })

    document.documentElement.animate(
      [
        { clipPath: `circle(0px at ${x}px ${y}px)` },
        { clipPath: `circle(${endRadius}px at ${x}px ${y}px)` }
      ],
      {
        duration: 1000,
        easing: 'ease-out',
        fill: 'forwards',
        pseudoElement: '::view-transition-new(root)'
      }
    )
  } catch {
    /* empty */
  }
}
