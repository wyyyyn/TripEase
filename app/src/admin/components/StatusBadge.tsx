import type { ReviewStatus } from '../../shared/types/admin';

const config: Record<ReviewStatus, { label: string; className: string }> = {
  draft: { label: '草稿', className: 'bg-gray-100 text-gray-600' },
  pending: { label: '待审核', className: 'bg-amber-50 text-amber-600' },
  approved: { label: '已通过', className: 'bg-blue-50 text-blue-600' },
  rejected: { label: '已拒绝', className: 'bg-red-50 text-red-600' },
  published: { label: '已发布', className: 'bg-emerald-50 text-emerald-600' },
  offline: { label: '已下线', className: 'bg-gray-100 text-gray-500' },
};

export default function StatusBadge({ status }: { status: ReviewStatus }) {
  const { label, className } = config[status];
  return (
    <span className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full ${className}`}>
      {label}
    </span>
  );
}
