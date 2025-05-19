
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
                // Nova paleta de cores do Kairos
                kairos: {
                    'blue-deep': '#002D72',
                    'purple': '#6B5B95',
                    'blue-light': '#4A90E2',
                    'dark': '#121A2F',
                    'white': '#FFFFFF',
                    'gray-light': '#F5F5F7',
                },
                // Task category colors
                category: {
                  personal: '#E5DEFF',
                  work: '#D3E4FD',
                  fitness: '#F2FCE2',
                  academic: '#FEF7CD',
                  default: '#FFDEE2',
                },
                // Dark mode category colors  
                "category-dark": {
                  personal: '#5D4A9C',
                  work: '#3A5F8A',
                  fitness: '#55803E',
                  academic: '#9C7E23',
                  default: '#9C3D4A',
                }
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
                'fade-in': {
                  '0%': {
                    opacity: '0',
                    transform: 'translateY(10px)'
                  },
                  '100%': {
                    opacity: '1',
                    transform: 'translateY(0)'
                  }
                },
                'slide-in': {
                  '0%': {
                    transform: 'translateX(100%)',
                    opacity: '0'
                  },
                  '100%': {
                    transform: 'translateX(0)',
                    opacity: '1'
                  }
                }
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
                'fade-in': 'fade-in 0.3s ease-out',
                'slide-in': 'slide-in 0.4s ease-out'
			},
            fontFamily: {
                'sans': ['SF Pro Display', 'Roboto', 'system-ui', 'sans-serif'],
            },
            backgroundImage: {
                'gradient-blue-purple': 'linear-gradient(90deg, #4A90E2 0%, #6B5B95 100%)',
            }
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
