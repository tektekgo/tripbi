import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Modal from './Modal'

// Mock HTMLDialogElement methods since jsdom doesn't fully support them
beforeEach(() => {
  HTMLDialogElement.prototype.showModal = vi.fn()
  HTMLDialogElement.prototype.close = vi.fn()
})

describe('Modal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    title: 'Test Modal',
    children: <div data-testid="modal-content">Modal content</div>,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('renders when isOpen is true', () => {
      render(<Modal {...defaultProps} />)
      // jsdom doesn't fully support dialog role, so query by text
      expect(screen.getByText('Test Modal')).toBeInTheDocument()
      expect(screen.getByText('Modal content')).toBeInTheDocument()
    })

    it('does not render when isOpen is false', () => {
      render(<Modal {...defaultProps} isOpen={false} />)
      expect(screen.queryByText('Test Modal')).not.toBeInTheDocument()
    })

    it('renders title correctly', () => {
      render(<Modal {...defaultProps} title="Custom Title" />)
      expect(screen.getByText('Custom Title')).toBeInTheDocument()
    })

    it('renders children correctly', () => {
      render(
        <Modal {...defaultProps}>
          <button>Click me</button>
          <p>Some text</p>
        </Modal>
      )
      // jsdom dialog is "hidden" so use hidden: true to access elements
      expect(screen.getByRole('button', { name: 'Click me', hidden: true })).toBeInTheDocument()
      expect(screen.getByText('Some text')).toBeInTheDocument()
    })
  })

  describe('close functionality', () => {
    it('calls onClose when clicking close button', () => {
      const onClose = vi.fn()
      render(<Modal {...defaultProps} onClose={onClose} />)

      // Use hidden: true since jsdom doesn't properly handle dialog visibility
      const closeButton = screen.getByRole('button', { name: /close modal/i, hidden: true })
      fireEvent.click(closeButton)

      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('calls onClose when clicking backdrop (dialog element)', () => {
      const onClose = vi.fn()
      const { container } = render(<Modal {...defaultProps} onClose={onClose} />)

      const dialog = container.querySelector('dialog')
      expect(dialog).toBeInTheDocument()
      fireEvent.click(dialog!)

      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('does not call onClose when clicking modal content', () => {
      const onClose = vi.fn()
      render(<Modal {...defaultProps} onClose={onClose} />)

      const content = screen.getByText('Modal content')
      fireEvent.click(content)

      expect(onClose).not.toHaveBeenCalled()
    })
  })

  describe('size variants', () => {
    it('applies small size class', () => {
      const { container } = render(<Modal {...defaultProps} size="sm" />)
      // The size class is on the inner div (second child of dialog)
      const modalWrapper = container.querySelector('dialog > div')
      expect(modalWrapper).toHaveClass('max-w-sm')
    })

    it('applies medium size class by default', () => {
      const { container } = render(<Modal {...defaultProps} />)
      const modalWrapper = container.querySelector('dialog > div')
      expect(modalWrapper).toHaveClass('max-w-md')
    })

    it('applies large size class', () => {
      const { container } = render(<Modal {...defaultProps} size="lg" />)
      const modalWrapper = container.querySelector('dialog > div')
      expect(modalWrapper).toHaveClass('max-w-lg')
    })

    it('applies extra large size class', () => {
      const { container } = render(<Modal {...defaultProps} size="xl" />)
      const modalWrapper = container.querySelector('dialog > div')
      expect(modalWrapper).toHaveClass('max-w-xl')
    })
  })

  describe('dialog element behavior', () => {
    it('calls showModal when opened', () => {
      render(<Modal {...defaultProps} />)
      expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalled()
    })

    it('sets overflow hidden on body when opened', () => {
      render(<Modal {...defaultProps} />)
      expect(document.body.style.overflow).toBe('hidden')
    })

    it('resets overflow when closed', () => {
      const { rerender } = render(<Modal {...defaultProps} />)
      expect(document.body.style.overflow).toBe('hidden')

      rerender(<Modal {...defaultProps} isOpen={false} />)
      expect(document.body.style.overflow).toBe('')
    })
  })

  describe('accessibility', () => {
    it('has close button with aria-label', () => {
      render(<Modal {...defaultProps} />)
      // Use hidden: true for jsdom dialog compatibility
      const closeButton = screen.getByRole('button', { name: /close modal/i, hidden: true })
      expect(closeButton).toHaveAttribute('aria-label', 'Close modal')
    })

    it('renders title as h2 heading', () => {
      render(<Modal {...defaultProps} />)
      // Use hidden: true for jsdom dialog compatibility
      const heading = screen.getByRole('heading', { level: 2, hidden: true })
      expect(heading).toHaveTextContent('Test Modal')
    })
  })
})
