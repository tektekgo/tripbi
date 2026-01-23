import type { Proposal } from '@/types'
import CategoryIcon, { getCategoryLabel } from '@/components/ui/CategoryIcon'

interface CategorySelectorProps {
  value: Proposal['category'] | null
  onChange: (category: Proposal['category']) => void
  disabled?: boolean
}

const categories: Proposal['category'][] = [
  'flights',
  'hotels',
  'activities',
  'restaurants',
  'transportation',
  'tasks',
]

export default function CategorySelector({ value, onChange, disabled }: CategorySelectorProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {categories.map((category) => (
        <button
          key={category}
          type="button"
          onClick={() => onChange(category)}
          disabled={disabled}
          className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all
            ${value === category
              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30'
              : 'border-cream-300 bg-cream-100 hover:border-cream-400 hover:bg-cream-200 dark:border-surface-dark-border dark:bg-surface-dark-elevated'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          <CategoryIcon category={category} size="md" />
          <span className={`text-xs font-medium ${value === category ? 'text-primary-700 dark:text-primary-300' : 'text-cream-700 dark:text-cream-400'}`}>
            {getCategoryLabel(category)}
          </span>
        </button>
      ))}
    </div>
  )
}
