import { useState, useEffect } from 'react'
import { FolderPlus, Search, Filter, Loader2 } from 'lucide-react'
import ProjectCard from './ProjectCard'
import { supabase } from '../../lib/supabase'
import { jsPDF } from 'jspdf'

interface Project {
    id: string
    name: string
    description: string | null
    status: 'draft' | 'quoted' | 'ordered'
    total_estimate: number
    created_at: string
    item_count?: number
}

export default function ProjectsGrid() {
    const [projects, setProjects] = useState<Project[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [filterStatus, setFilterStatus] = useState<string>('all')

    useEffect(() => {
        loadProjects()
    }, [])

    const loadProjects = async () => {
        setIsLoading(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                setIsLoading(false)
                return
            }

            // Get projects with item count
            const { data, error } = await supabase
                .from('ele_project_lists')
                .select(`
          id,
          name,
          description,
          status,
          total_estimate,
          created_at,
          ele_project_list_items(count)
        `)
                .eq('user_id', user.id)
                .eq('is_active_cart', false)
                .order('created_at', { ascending: false })

            if (error) throw error

            const projectsWithCount = (data || []).map(project => ({
                ...project,
                item_count: project.ele_project_list_items?.[0]?.count || 0
            }))

            setProjects(projectsWithCount)
        } catch (err) {
            console.error('Error loading projects:', err)
        } finally {
            setIsLoading(false)
        }
    }

    const handleExportPdf = async (projectId: string) => {
        try {
            // Get project details with items
            const { data: project, error: projectError } = await supabase
                .from('ele_project_lists')
                .select('*')
                .eq('id', projectId)
                .single()

            if (projectError) throw projectError

            const { data: items, error: itemsError } = await supabase
                .from('ele_project_list_items')
                .select(`
          quantity,
          notes,
          ele_products(name, sku, price_list)
        `)
                .eq('list_id', projectId)

            if (itemsError) throw itemsError

            // Generate PDF
            const doc = new jsPDF()

            // Header
            doc.setFontSize(20)
            doc.setTextColor(49, 72, 122) // Primary color
            doc.text('Punto Electro', 20, 20)

            doc.setFontSize(16)
            doc.setTextColor(0, 0, 0)
            doc.text(`Presupuesto: ${project.name}`, 20, 35)

            doc.setFontSize(10)
            doc.setTextColor(100, 100, 100)
            doc.text(`Fecha: ${new Date().toLocaleDateString('es-AR')}`, 20, 45)

            // Table header
            let y = 60
            doc.setFontSize(10)
            doc.setTextColor(0, 0, 0)
            doc.setFont('helvetica', 'bold')
            doc.text('Producto', 20, y)
            doc.text('SKU', 100, y)
            doc.text('Cant.', 140, y)
            doc.text('Precio', 160, y)
            doc.text('Subtotal', 180, y)

            y += 5
            doc.line(20, y, 190, y)
            y += 8

            // Items
            doc.setFont('helvetica', 'normal')
            let total = 0

            items?.forEach((item: any) => {
                const product = item.ele_products
                const subtotal = (product?.price_list || 0) * item.quantity
                total += subtotal

                doc.text(product?.name?.substring(0, 35) || '', 20, y)
                doc.text(product?.sku || '', 100, y)
                doc.text(String(item.quantity), 140, y)
                doc.text(`$${(product?.price_list || 0).toLocaleString('es-AR')}`, 160, y)
                doc.text(`$${subtotal.toLocaleString('es-AR')}`, 180, y)

                y += 8
                if (y > 270) {
                    doc.addPage()
                    y = 20
                }
            })

            // Total
            y += 5
            doc.line(20, y, 190, y)
            y += 10
            doc.setFont('helvetica', 'bold')
            doc.setFontSize(12)
            doc.text(`Total: $${total.toLocaleString('es-AR')}`, 160, y)

            // Save
            doc.save(`presupuesto-${project.name.toLowerCase().replace(/\s+/g, '-')}.pdf`)

        } catch (err) {
            console.error('Error exporting PDF:', err)
        }
    }

    const filteredProjects = projects.filter(project => {
        const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesFilter = filterStatus === 'all' || project.status === filterStatus
        return matchesSearch && matchesFilter
    })

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="font-heading text-2xl font-bold text-[var(--color-primary)]">
                        Mis Proyectos
                    </h1>
                    <p className="text-[var(--color-text-muted)] mt-1">
                        Gestiona tus listas de materiales para obras
                    </p>
                </div>
                <a href="/" className="btn btn--primary">
                    <FolderPlus size={18} />
                    Nuevo Proyecto
                </a>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-light)]" />
                    <input
                        type="text"
                        placeholder="Buscar proyectos..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 border border-[var(--color-border)] rounded-xl focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-accent-glow)] transition-all"
                    />
                </div>
                <div className="relative">
                    <Filter size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-light)]" />
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="pl-11 pr-8 py-3 border border-[var(--color-border)] rounded-xl focus:outline-none focus:border-[var(--color-primary)] bg-white appearance-none cursor-pointer"
                    >
                        <option value="all">Todos</option>
                        <option value="draft">Borrador</option>
                        <option value="quoted">Cotizado</option>
                        <option value="ordered">Pedido</option>
                    </select>
                </div>
            </div>

            {/* Grid */}
            {isLoading ? (
                <div className="flex items-center justify-center py-16">
                    <Loader2 size={32} className="animate-spin text-[var(--color-primary)]" />
                </div>
            ) : filteredProjects.length === 0 ? (
                <div className="text-center py-16">
                    <div className="w-16 h-16 bg-[var(--color-bg)] rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <FolderPlus size={32} className="text-[var(--color-text-light)]" />
                    </div>
                    <h3 className="font-heading text-lg font-bold text-[var(--color-text)] mb-2">
                        No hay proyectos
                    </h3>
                    <p className="text-[var(--color-text-muted)] mb-4">
                        Crea tu primer proyecto desde el carrito
                    </p>
                    <a href="/" className="btn btn--primary">
                        Ir a la Tienda
                    </a>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProjects.map(project => (
                        <ProjectCard
                            key={project.id}
                            id={project.id}
                            name={project.name}
                            description={project.description}
                            status={project.status}
                            itemCount={project.item_count || 0}
                            totalEstimate={project.total_estimate || 0}
                            createdAt={project.created_at}
                            onExportPdf={() => handleExportPdf(project.id)}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}
