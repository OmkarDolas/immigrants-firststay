import { type ServiceRequestStatus } from '@/types'

const CONFIG: Record<ServiceRequestStatus, { label: string; className: string }> = {
  pending:     { label: 'Pending',     className: 'bg-amber-100 text-amber-800'  },
  in_progress: { label: 'In Progress', className: 'bg-blue-100 text-blue-800'   },
  completed:   { label: 'Completed',   className: 'bg-green-100 text-green-800' },
  cancelled:   { label: 'Cancelled',   className: 'bg-gray-100 text-gray-700'   },
}

export function ServiceRequestStatusBadge({ status }: { status: ServiceRequestStatus }) {
  const { label, className } = CONFIG[status] ?? CONFIG.pending
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${className}`}>
      {label}
    </span>
  )
}
