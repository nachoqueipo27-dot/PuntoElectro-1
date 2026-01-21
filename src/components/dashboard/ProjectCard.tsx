import { FolderOpen, Calendar, FileText, MoreVertical, Download } from 'lucide-react'

interface ProjectCardProps {
    id: string
    name: string
    description?: string | null
    status: 'draft' | 'quoted' | 'ordered'
    itemCount: number
    totalEstimate: number
    createdAt: string
    onView?: () => void
    onExportPdf?: () => void
}

export default function ProjectCard({
    name,
    description,
    status,
    itemCount,
    totalEstimate,
    createdAt,
    onView,
    onExportPdf
}: ProjectCardProps) {
    const statusColors = {
        draft: { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Borrador' },
        quoted: { bg: 'bg-blue-100', text: 'text-blue-600', label: 'Cotizado' },
        ordered: { bg: 'bg-green-100', text: 'text-green-600', label: 'Pedido' },
    }

    const statusStyle = statusColors[status] || statusColors.draft

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('es-AR', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        })
    }

    return (
        <div className="project-card group">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="project-card__icon">
                    <FolderOpen size={24} className="text-[var(--color-primary)]" />
                </div>
                <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 ${statusStyle.bg} ${statusStyle.text} text-xs font-semibold rounded-full`}>
                        {statusStyle.label}
                    </span>
                    <button className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-[var(--color-surface-hover)] rounded-lg transition-all">
                        <MoreVertical size={16} className="text-[var(--color-text-muted)]" />
                    </button>
                </div>
            </div>

            {/* Title */}
            <h3 className="project-card__title">{name}</h3>
            {description && (
                <p className="text-sm text-[var(--color-text-muted)] mt-1 line-clamp-2">
                    {description}
                </p>
            )}

            {/* Meta */}
            <div className="project-card__meta">
                <div className="project-card__meta-item">
                    <span className="project-card__meta-label flex items-center gap-1.5">
                        <FileText size={14} />
                        Productos
                    </span>
                    <span className="project-card__meta-value">{itemCount}</span>
                </div>
                <div className="project-card__meta-item">
                    <span className="project-card__meta-label flex items-center gap-1.5">
                        <Calendar size={14} />
                        Creado
                    </span>
                    <span className="project-card__meta-value">{formatDate(createdAt)}</span>
                </div>
                <div className="project-card__meta-item">
                    <span className="project-card__meta-label">Total</span>
                    <span className="project-card__meta-value project-card__meta-value--primary">
                        ${totalEstimate.toLocaleString('es-AR')}
                    </span>
                </div>
            </div>

            {/* Actions (visible on hover) */}
            <div className="flex gap-2 mt-4 pt-4 border-t border-[var(--color-border)] opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={onView}
                    className="btn btn--primary flex-1 text-sm py-2"
                >
                    Ver Detalle
                </button>
                <button
                    onClick={onExportPdf}
                    className="btn btn--secondary p-2"
                    title="Exportar PDF"
                >
                    <Download size={16} />
                </button>
            </div>
        </div>
    )
}
