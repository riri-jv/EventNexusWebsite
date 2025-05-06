'use client'

import { useTheme } from 'next-themes'
import { useCallback } from 'react'
import Particles from 'react-tsparticles'
import { loadSlim } from 'tsparticles-slim'
import type { Engine } from 'tsparticles-engine'

export default function StarryBackground() {
  const { theme } = useTheme()

  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine)
  }, [])

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      options={{
        fullScreen: { enable: true, zIndex: -1 },
        background: {
          color: { value: theme === 'dark' ? '#121212' : '#ffffff' },
        },
        particles: {
          color: { value: theme === 'dark' ? '#ffffff' : '#673AB7' },
          number: {
            value: 100,
            density: {
              enable: true,
              area: 800,
            },
          },
          size: {
            value: { min: 0.8, max: 1.5 },
            random: true,
          },
          move: {
            enable: theme === 'dark' ? false : true,  // In light mode, particles move; in dark mode, they don't
            speed: 0.2,
            direction: 'none',
            outModes: {
              default: 'bounce',
            },
          },
          opacity: {
            value: 0.8,
            random: true,
            animation: {
              enable: true,
              speed: 0.5,
              minimumValue: 0.3,
              sync: false,
            },
          },
        },
        interactivity: {
          events: {
            onHover: {
              enable: theme === 'dark' ? false : true,  // In dark mode, no interaction; in light mode, attraction
              mode: 'attract',  // Particles will be attracted to the mouse pointer in light mode
            },
            onClick: { enable: false },
            resize: true,
          },
          modes: {
            attract: {
              distance: 150,  // Radius of attraction
              duration: 0.4,  // Duration of attraction
              speed: 1,      // Speed of attraction
            },
          },
        },
        detectRetina: true,
        lineLinked: theme === 'light' ? {
          enable: true,
          distance: 150,
          color: '#D1C4E9',  // Soft lavender/purple color
          opacity: 0.5,
          width: 0.5,
          move: {
            enable: true,   // Lines should move in light mode
            speed: 0.3,
          },
        } : {
          enable: false,   // No lines in dark mode
        },
      }}
    />
  )
}
