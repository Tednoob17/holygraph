// DOM Elements
const userForm = document.getElementById('user-form');
const graphSection = document.getElementById('graph-section');
const inputSection = document.querySelector('.input-section');
const resetBtn = document.getElementById('reset-btn');
const canvas = document.getElementById('view');

// Form submission handler
userForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get form values
    const username = document.getElementById('username').value.trim();
    const cursusId = document.getElementById('cursus_id').value.trim();
    const campusId = document.getElementById('campus_id').value.trim();
    const apiUrl = document.getElementById('api_url').value.trim();
    
    // Construct the fetch URL with user parameters
    const fetchUrl = `${apiUrl}?cursus_id=${encodeURIComponent(cursusId)}&campus_id=${encodeURIComponent(campusId)}&login=${encodeURIComponent(username)}`;
    
    // Update canvas data attribute
    canvas.setAttribute('data-fetch-url', fetchUrl);
    canvas.setAttribute('data-quest', '42next');
    
    // Display user information
    document.getElementById('display-username').textContent = username;
    document.getElementById('display-cursus').textContent = cursusId;
    document.getElementById('display-campus').textContent = campusId;
    document.getElementById('display-url').textContent = fetchUrl;
    
    // Show graph section and hide input section
    inputSection.style.display = 'none';
    graphSection.style.display = 'block';
    
    // Initialize the graph visualization
    initializeGraph(fetchUrl);
});

// Reset button handler
resetBtn.addEventListener('click', function() {
    graphSection.style.display = 'none';
    inputSection.style.display = 'block';
    
    // Clear canvas
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
});

// Graph initialization and visualization
function initializeGraph(fetchUrl) {
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    const container = canvas.parentElement;
    canvas.width = container.offsetWidth - 4; // Account for border
    canvas.height = 600;
    
    // Clear previous content
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Display loading message
    ctx.font = '20px Arial';
    ctx.fillStyle = '#667eea';
    ctx.textAlign = 'center';
    ctx.fillText('Loading project data...', canvas.width / 2, canvas.height / 2 - 20);
    
    // Attempt to fetch and display data
    // Note: This will likely fail due to CORS, but we'll show a visualization anyway
    fetch(fetchUrl)
        .then(response => response.json())
        .then(data => {
            // If successful, render the actual data
            renderProjectGraph(ctx, data);
        })
        .catch(error => {
            // If fetch fails (likely CORS), render a demo visualization
            console.log('Fetch failed (expected due to CORS), rendering demo:', error);
            renderDemoGraph(ctx);
        });
}

// Render actual project graph from API data
function renderProjectGraph(ctx, data) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // This would contain actual graph rendering logic based on 42 API response
    // For now, we'll show basic information
    ctx.font = '16px Arial';
    ctx.fillStyle = '#333';
    ctx.textAlign = 'left';
    ctx.fillText('Project data received successfully!', 20, 30);
    ctx.fillText('Implement custom graph rendering here based on your data structure.', 20, 60);
}

// Render demo graph visualization
function renderDemoGraph(ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 150;
    
    // Draw central node
    drawNode(ctx, centerX, centerY, 30, 'Main Project', '#667eea');
    
    // Draw connected nodes in a circle
    const nodeCount = 6;
    const projects = ['Project 1', 'Project 2', 'Project 3', 'Project 4', 'Project 5', 'Project 6'];
    
    for (let i = 0; i < nodeCount; i++) {
        const angle = (i / nodeCount) * Math.PI * 2 - Math.PI / 2;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        
        // Draw connection line
        ctx.strokeStyle = '#e0e0e0';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(x, y);
        ctx.stroke();
        
        // Draw node
        const color = i % 2 === 0 ? '#764ba2' : '#667eea';
        drawNode(ctx, x, y, 20, projects[i], color);
    }
    
    // Draw info text
    ctx.font = 'italic 14px Arial';
    ctx.fillStyle = '#999';
    ctx.textAlign = 'center';
    ctx.fillText('Demo visualization - Connect to actual API for real data', centerX, canvas.height - 20);
}

// Helper function to draw a node
function drawNode(ctx, x, y, radius, label, color) {
    // Draw circle
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw border
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // Draw label
    ctx.fillStyle = '#333';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(label, x, y + radius + 15);
}

// Make canvas responsive
window.addEventListener('resize', function() {
    if (graphSection.style.display !== 'none') {
        const container = canvas.parentElement;
        canvas.width = container.offsetWidth - 4;
        
        // Redraw the graph after resize
        const fetchUrl = canvas.getAttribute('data-fetch-url');
        if (fetchUrl) {
            renderDemoGraph(canvas.getContext('2d'));
        }
    }
});
