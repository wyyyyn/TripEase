import type { ReviewStatus } from '../../types/admin';

const config: Record<ReviewStatus, { label: string; className: string }> = {
  draft: { label: '草稿', className: 'bg-gray-100 text-gray-600' },
  pending: { label: '待审核', className: 'bg-amber-100 text-amber-700' },
  approved: { label: '已通过', className: 'bg-blue-100 text-blue-700' },
  rejected: { label: '已拒绝', className: 'bg-red-100 text-red-700' },
  published: { label: '已发布', className: 'bg-emerald-100 text-emerald-700' },
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
