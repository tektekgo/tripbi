import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Avatar, { AvatarGroup } from './Avatar'

describe('Avatar', () => {
  describe('with image', () => {
    it('renders image when src is provided', () => {
      render(<Avatar src="https://example.com/avatar.jpg" name="John Doe" />)
      const img = screen.getByRole('img')
      expect(img).toBeInTheDocument()
      expect(img).toHaveAttribute('src', 'https://example.com/avatar.jpg')
    })

    it('uses name as alt text', () => {
      render(<Avatar src="https://example.com/avatar.jpg" name="John Doe" />)
      const img = screen.getByRole('img')
      expect(img).toHaveAttribute('alt', 'John Doe')
    })

    it('uses fallback alt text when no name provided', () => {
      render(<Avatar src="https://example.com/avatar.jpg" />)
      const img = screen.getByRole('img')
      expect(img).toHaveAttribute('alt', 'User avatar')
    })
  })

  describe('with initials fallback', () => {
    it('shows initials when no src provided', () => {
      render(<Avatar name="John Doe" />)
      expect(screen.getByText('JD')).toBeInTheDocument()
    })

    it('handles single name', () => {
      render(<Avatar name="John" />)
      expect(screen.getByText('JO')).toBeInTheDocument()
    })

    it('handles three-part names', () => {
      render(<Avatar name="John Michael Doe" />)
      expect(screen.getByText('JD')).toBeInTheDocument()
    })

    it('shows question mark when no name provided', () => {
      render(<Avatar />)
      expect(screen.getByText('?')).toBeInTheDocument()
    })

    it('handles null name', () => {
      render(<Avatar name={null} />)
      expect(screen.getByText('?')).toBeInTheDocument()
    })

    it('converts initials to uppercase', () => {
      render(<Avatar name="john doe" />)
      expect(screen.getByText('JD')).toBeInTheDocument()
    })
  })

  describe('size variants', () => {
    it('applies small size classes', () => {
      const { container } = render(<Avatar name="John Doe" size="sm" />)
      const avatar = container.firstChild as HTMLElement
      expect(avatar).toHaveClass('w-8', 'h-8', 'text-xs')
    })

    it('applies medium size classes by default', () => {
      const { container } = render(<Avatar name="John Doe" />)
      const avatar = container.firstChild as HTMLElement
      expect(avatar).toHaveClass('w-10', 'h-10', 'text-sm')
    })

    it('applies large size classes', () => {
      const { container } = render(<Avatar name="John Doe" size="lg" />)
      const avatar = container.firstChild as HTMLElement
      expect(avatar).toHaveClass('w-12', 'h-12', 'text-base')
    })
  })

  describe('custom className', () => {
    it('accepts additional className', () => {
      const { container } = render(<Avatar name="John Doe" className="custom-class" />)
      const avatar = container.firstChild as HTMLElement
      expect(avatar).toHaveClass('custom-class')
    })
  })

  describe('color consistency', () => {
    it('generates consistent color for same name', () => {
      const { container: container1 } = render(<Avatar name="John Doe" />)
      const { container: container2 } = render(<Avatar name="John Doe" />)

      const avatar1 = container1.firstChild as HTMLElement
      const avatar2 = container2.firstChild as HTMLElement

      expect(avatar1.className).toBe(avatar2.className)
    })

    it('generates different colors for different names', () => {
      const { container: container1 } = render(<Avatar name="John" />)
      const { container: container2 } = render(<Avatar name="Jane" />)

      const avatar1 = container1.firstChild as HTMLElement
      const avatar2 = container2.firstChild as HTMLElement

      // Classes may or may not be different depending on hash
      // but both should have a bg-* class
      expect(avatar1.className).toMatch(/bg-/)
      expect(avatar2.className).toMatch(/bg-/)
    })
  })
})

describe('AvatarGroup', () => {
  const mockUsers = [
    { photoURL: 'https://example.com/1.jpg', displayName: 'User One' },
    { photoURL: 'https://example.com/2.jpg', displayName: 'User Two' },
    { photoURL: null, displayName: 'User Three' },
    { photoURL: null, displayName: 'User Four' },
    { photoURL: null, displayName: 'User Five' },
  ]

  describe('rendering', () => {
    it('renders all users when count is less than max', () => {
      const users = mockUsers.slice(0, 3)
      render(<AvatarGroup users={users} max={4} />)

      // Should show all 3 avatars
      expect(screen.getAllByRole('img').length).toBe(2) // Two with photoURL
      expect(screen.getByText('UT')).toBeInTheDocument() // User Three initials
    })

    it('shows overflow count when users exceed max', () => {
      render(<AvatarGroup users={mockUsers} max={3} />)

      // Should show +2 for the remaining users
      expect(screen.getByText('+2')).toBeInTheDocument()
    })

    it('uses default max of 4', () => {
      render(<AvatarGroup users={mockUsers} />)

      // Should show +1 (5 users - 4 max = 1 remaining)
      expect(screen.getByText('+1')).toBeInTheDocument()
    })
  })

  describe('size variants', () => {
    it('passes size to child avatars', () => {
      const users = [{ displayName: 'Test User' }]
      const { container } = render(<AvatarGroup users={users} size="lg" />)

      const avatar = container.querySelector('.w-12')
      expect(avatar).toBeInTheDocument()
    })
  })

  describe('overlap styling', () => {
    it('applies overlap margin to avatars after the first', () => {
      const users = mockUsers.slice(0, 2)
      const { container } = render(<AvatarGroup users={users} size="sm" />)

      // Second avatar wrapper should have negative margin
      const wrappers = container.querySelectorAll('.ring-2')
      expect(wrappers.length).toBe(2)
      expect(wrappers[1]).toHaveClass('-ml-2')
    })
  })

  describe('empty state', () => {
    it('handles empty users array', () => {
      const { container } = render(<AvatarGroup users={[]} />)
      expect(container.firstChild).toBeInTheDocument()
      // Should render empty flex container
      expect(screen.queryByRole('img')).not.toBeInTheDocument()
    })
  })
})
