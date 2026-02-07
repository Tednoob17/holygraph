// HolyGraph - 42 Project Graph Renderer
class HolyGraph {
    constructor(canvasId, dataUrl) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.projects = [];
        this.layers = {};
        this.selectedLayer = null;
        this.offset = { x: 0, y: 0 };
        this.scale = 0.15;
        this.isDragging = false;
        this.lastMouse = { x: 0, y: 0 };
        this.hoveredProject = null;
        
        this.colors = {
            background: '#0f0f23',
            rings: '#1a4a4a',
            available: '#00babc',
            unavailable: '#4a4a5a',
            done: '#5cb85c',
            in_progress: '#f0ad4e',
            failed: '#d9534f',
            highlight: '#ffd700',
            text: '#ffffff',
            connection: '#2a5a5a'
        };

        this.init(dataUrl);
    }

    async init(dataUrl) {
        this.setupCanvas();
        this.setupEvents();
        this.createUI();
        await this.loadData(dataUrl);
        this.centerGraph();
        this.render();
    }

    setupCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        window.addEventListener('resize', () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            this.render();
        });
    }

    setupEvents() {
        this.canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
        this.canvas.addEventListener('mouseup', () => this.onMouseUp());
        this.canvas.addEventListener('wheel', (e) => this.onWheel(e));
        this.canvas.addEventListener('mouseleave', () => this.onMouseUp());
    }

    createUI() {
        const ui = document.createElement('div');
        ui.className = 'graph-ui';
        ui.innerHTML = `
            <select id="cursus-select">
                <option value="42cursus">42cursus</option>
            </select>
            <select id="layer-select">
                <option value="">Please select a layer</option>
            </select>
            <button id="search-btn" title="Search">🔍</button>
        `;
        document.body.appendChild(ui);

        // Add UI styles
        const style = document.createElement('style');
        style.textContent = `
            .graph-ui {
                position: fixed;
                top: 20px;
                left: 20px;
                display: flex;
                gap: 10px;
                z-index: 1000;
            }
            .graph-ui select, .graph-ui button {
                background: #1a1a2e;
                color: #fff;
                border: 1px solid #00babc;
                padding: 8px 16px;
                border-radius: 4px;
                font-size: 14px;
                cursor: pointer;
            }
            .graph-ui select:hover, .graph-ui button:hover {
                background: #2a2a4e;
            }
            .tooltip {
                position: fixed;
                background: rgba(26, 26, 46, 0.95);
                border: 1px solid #00babc;
                border-radius: 8px;
                padding: 12px 16px;
                color: #fff;
                font-size: 13px;
                max-width: 300px;
                z-index: 1001;
                pointer-events: none;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
            }
            .tooltip h3 { color: #00babc; margin: 0 0 8px 0; font-size: 15px; }
            .tooltip p { margin: 4px 0; opacity: 0.9; }
            .tooltip .difficulty { color: #f0ad4e; }
            .tooltip .duration { color: #5bc0de; }
        `;
        document.head.appendChild(style);

        document.getElementById('layer-select').addEventListener('change', (e) => {
            this.selectedLayer = e.target.value || null;
            this.render();
        });
    }

    async loadData(dataUrl) {
        try {
            const response = await fetch(dataUrl);
            this.projects = await response.json();
            this.extractLayers();
            this.populateLayerSelect();
        } catch (error) {
            console.error('Failed to load project data:', error);
        }
    }

    extractLayers() {
        const layerMap = {
            'Algo & AI & Data': ['expert-system', 'n-puzzle', 'gomoku', 'rubik', 'krpsim', 'ft_linear_regression', 'dslr', 'multilayer-perceptron', 'total-perspective-vortex'],
            'Graphics': ['fdf', 'fract-ol', 'minirt', 'cub3d', 'scop', '42run', 'humangl', 'shaderpixel', 'particle-system', 'ft_vox'],
            'System & Kernel': ['libftasm', 'nm-otool', 'malloc', 'ft_script', 'philosophers', 'little-penguin-1', 'kfs-1', 'kfs-2', 'kfs-3', 'kfs-4', 'kfs-5', 'kfs-6', 'kfs-7', 'kfs-8', 'kfs-9', 'kfs-x', 'ft_linux', 'drivers-and-interrupts', 'process-and-memory', 'filesystem'],
            'Security': ['snow-crash', 'rainfall', 'override', 'boot2root', 'famine', 'pestilence', 'war', 'death', 'durex', 'matt-daemon', 'woody-woodpacker'],
            'Web & Mobile': ['camagru', 'matcha', 'hypertube', 'piscine-php', 'piscine-ruby-on-rails', 'ft_hangouts', 'swifty-companion', 'swifty-proteins', 'piscine-swift-ios', 'music-room'],
            'Unix & Network': ['minishell', '21sh', '42sh', 'ft_p', 'irc', 'ft_ping', 'ft_traceroute', 'ft_nmap', 'zappy', 'lem-ipc', 'taskmaster'],
            'DevOps': ['init', 'roger-skyline-1', 'roger-skyline-2', 'cloud-1', 'docker-1'],
            'Object Oriented': ['piscine-cpp', 'abstract-vm', 'bomberman', 'nibbler', 'avaj-launcher', 'swingy', 'fix-me', 'piscine-object']
        };

        this.layers = layerMap;
    }

    populateLayerSelect() {
        const select = document.getElementById('layer-select');
        Object.keys(this.layers).forEach(layer => {
            const option = document.createElement('option');
            option.value = layer;
            option.textContent = layer;
            select.appendChild(option);
        });
    }

    centerGraph() {
        if (this.projects.length === 0) return;
        
        let minX = Infinity, maxX = -Infinity;
        let minY = Infinity, maxY = -Infinity;
        
        this.projects.forEach(p => {
            minX = Math.min(minX, p.x);
            maxX = Math.max(maxX, p.x);
            minY = Math.min(minY, p.y);
            maxY = Math.max(maxY, p.y);
        });

        const centerX = (minX + maxX) / 2;
        const centerY = (minY + maxY) / 2;
        
        this.offset.x = this.canvas.width / 2 - centerX * this.scale;
        this.offset.y = this.canvas.height / 2 - centerY * this.scale;
    }

    worldToScreen(x, y) {
        return {
            x: x * this.scale + this.offset.x,
            y: y * this.scale + this.offset.y
        };
    }

    screenToWorld(x, y) {
        return {
            x: (x - this.offset.x) / this.scale,
            y: (y - this.offset.y) / this.scale
        };
    }

    onMouseDown(e) {
        this.isDragging = true;
        this.lastMouse = { x: e.clientX, y: e.clientY };
        this.canvas.style.cursor = 'grabbing';
    }

    onMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        if (this.isDragging) {
            const dx = e.clientX - this.lastMouse.x;
            const dy = e.clientY - this.lastMouse.y;
            this.offset.x += dx;
            this.offset.y += dy;
            this.lastMouse = { x: e.clientX, y: e.clientY };
            this.render();
        } else {
            this.checkHover(mouseX, mouseY);
        }
    }

    onMouseUp() {
        this.isDragging = false;
        this.canvas.style.cursor = 'grab';
    }

    onWheel(e) {
        e.preventDefault();
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        const worldBefore = this.screenToWorld(mouseX, mouseY);
        
        const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
        this.scale *= zoomFactor;
        this.scale = Math.max(0.05, Math.min(1, this.scale));
        
        const worldAfter = this.screenToWorld(mouseX, mouseY);
        this.offset.x += (worldAfter.x - worldBefore.x) * this.scale;
        this.offset.y += (worldAfter.y - worldBefore.y) * this.scale;
        
        this.render();
    }

    checkHover(mouseX, mouseY) {
        const world = this.screenToWorld(mouseX, mouseY);
        let found = null;

        for (const project of this.projects) {
            const dist = Math.sqrt((project.x - world.x) ** 2 + (project.y - world.y) ** 2);
            const radius = this.getProjectRadius(project) / this.scale;
            if (dist < radius) {
                found = project;
                break;
            }
        }

        if (found !== this.hoveredProject) {
            this.hoveredProject = found;
            this.render();
            this.showTooltip(found, mouseX, mouseY);
        } else if (found) {
            this.updateTooltipPosition(mouseX, mouseY);
        }
    }

    showTooltip(project, x, y) {
        let tooltip = document.querySelector('.tooltip');
        if (!project) {
            if (tooltip) tooltip.remove();
            return;
        }

        if (!tooltip) {
            tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            document.body.appendChild(tooltip);
        }

        tooltip.innerHTML = `
            <h3>${project.name}</h3>
            <p>${project.description || ''}</p>
            <p class="difficulty">Difficulty: ${project.difficulty || 'N/A'} XP</p>
            <p class="duration">Duration: ${project.duration || 'N/A'}</p>
            <p>State: ${project.state}</p>
        `;
        
        this.updateTooltipPosition(x, y);
    }

    updateTooltipPosition(x, y) {
        const tooltip = document.querySelector('.tooltip');
        if (tooltip) {
            tooltip.style.left = (x + 15) + 'px';
            tooltip.style.top = (y + 15) + 'px';
        }
    }

    getProjectRadius(project) {
        const baseRadius = project.kind === 'big_project' ? 25 : 
                          project.kind === 'piscine' ? 22 : 18;
        return baseRadius;
    }

    isInSelectedLayer(project) {
        if (!this.selectedLayer) return false;
        const layerProjects = this.layers[this.selectedLayer] || [];
        return layerProjects.some(slug => project.slug && project.slug.includes(slug));
    }

    getProjectColor(project) {
        if (this.isInSelectedLayer(project)) {
            return this.colors.highlight;
        }
        
        switch (project.state) {
            case 'done': return this.colors.done;
            case 'available': return this.colors.available;
            case 'in_progress': return this.colors.in_progress;
            case 'failed': return this.colors.failed;
            default: return this.colors.unavailable;
        }
    }

    render() {
        const ctx = this.ctx;
        ctx.fillStyle = this.colors.background;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.drawRings();
        this.drawConnections();
        this.drawProjects();
    }

    drawRings() {
        const ctx = this.ctx;
        const center = this.worldToScreen(3000, 3000);
        
        ctx.strokeStyle = this.colors.rings;
        ctx.lineWidth = 1;
        
        for (let i = 1; i <= 8; i++) {
            const radius = i * 150 * this.scale;
            ctx.beginPath();
            ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);
            ctx.stroke();
        }
    }

    drawConnections() {
        const ctx = this.ctx;
        ctx.strokeStyle = this.colors.connection;
        ctx.lineWidth = 1;

        this.projects.forEach(project => {
            if (project.by && project.by.length > 0) {
                project.by.forEach(connection => {
                    if (connection.points && connection.points.length >= 2) {
                        ctx.beginPath();
                        for (let i = 0; i < connection.points.length; i++) {
                            const point = this.worldToScreen(connection.points[i][0], connection.points[i][1]);
                            if (i === 0) {
                                ctx.moveTo(point.x, point.y);
                            } else {
                                ctx.lineTo(point.x, point.y);
                            }
                        }
                        ctx.stroke();
                    }
                });
            }
        });
    }

    drawProjects() {
        const ctx = this.ctx;

        this.projects.forEach(project => {
            const pos = this.worldToScreen(project.x, project.y);
            const radius = this.getProjectRadius(project) * this.scale;
            const color = this.getProjectColor(project);
            const isHighlighted = this.isInSelectedLayer(project);
            const isHovered = this.hoveredProject === project;

            // Glow effect for highlighted projects
            if (isHighlighted) {
                ctx.save();
                ctx.shadowColor = this.colors.highlight;
                ctx.shadowBlur = 20;
                ctx.beginPath();
                ctx.arc(pos.x, pos.y, radius + 5, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
                ctx.fill();
                ctx.restore();
            }

            // Main circle
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.fill();

            // Border
            ctx.strokeStyle = isHovered ? '#fff' : 'rgba(255,255,255,0.3)';
            ctx.lineWidth = isHovered ? 3 : 1;
            ctx.stroke();

            // Label
            if (this.scale > 0.1) {
                ctx.fillStyle = this.colors.text;
                ctx.font = `${Math.max(10, 12 * this.scale / 0.15)}px sans-serif`;
                ctx.textAlign = 'center';
                ctx.fillText(project.name, pos.x, pos.y + radius + 15);
            }
        });
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('view');
    if (canvas) {
        const dataUrl = canvas.dataset.fetchUrl || 'project_data.json';
        new HolyGraph('view', dataUrl);
    }
});
