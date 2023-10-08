document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById('triangleCanvas');
    const ctx = canvas.getContext('2d');
    let dragging = false;


    const normalizationFactor = 100;
    const canvasMiddlePoint = [window.innerWidth / 2, window.innerHeight / 2];
    const colors = ['red', 'green', 'blue'];
    const pointColors = ['green', 'blue', 'red'];

    const points = [
        { x: canvasMiddlePoint[0], y: canvasMiddlePoint[1] - (0.1 * window.innerHeight) },
        { x: canvasMiddlePoint[0], y: canvasMiddlePoint[1] + (0.1 * window.innerHeight) },
        { x: canvasMiddlePoint[0] + (0.1 * window.innerWidth), y: canvasMiddlePoint[1] + (0.1 * window.innerHeight) }
    ];

    canvas.addEventListener('mousedown', () => dragging = true);
    canvas.addEventListener('mouseup', () => dragging = false);
    canvas.addEventListener('mousemove', movePoint);
    window.addEventListener('resize', resizeCanvas);

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        drawTriangle();
    }

    function movePoint(e) {
        if (dragging) {
            const rect = canvas.getBoundingClientRect();
            let mouseX = e.clientX - rect.left;
            let mouseY = e.clientY - rect.top;
            
            mouseX = snapToGrid(mouseX);
            mouseY = snapToGrid(mouseY);
            
            let nearest = points.slice(0, 2).reduce((a, p, i) => {
                let d = distance(mouseX, mouseY, p.x, p.y);
                return d < a.d ? {i, d} : a;
            }, {i: 0, d: distance(mouseX, mouseY, points[0].x, points[0].y)});
            
            points[nearest.i].x = mouseX;
            points[nearest.i].y = mouseY;
            
            points[2].x = points[1].x;
            points[2].y = points[0].y;
            
            drawTriangle();
        }
    }

    function drawTriangle() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        ctx.lineTo(points[1].x, points[1].y);
        ctx.lineTo(points[2].x, points[2].y);
        ctx.closePath();
        ctx.stroke();
        
        ['c', 'a', 'b'].forEach((label, i) => {
            let nextP = points[(i + 1) % 3];
            let color = colors[i];
            drawSquareOnLine(points[i], nextP, color, label);
        });
        
        ['A', 'B', 'C'].forEach((label, i) => {
            ctx.fillStyle = "black";
            ctx.fillText(label, points[i].x + 5, points[i].y - 5);
            drawPoint(points[i],pointColors[i])
        });
        
        const midPoints = [
            { x: (points[0].x + points[1].x) / 2, y: (points[0].y + points[1].y) / 2 },
            { x: (points[1].x + points[2].x) / 2, y: (points[1].y + points[2].y) / 2 },
            { x: (points[2].x + points[0].x) / 2, y: (points[2].y + points[0].y) / 2 }
        ];
        ['c', 'a', 'b'].forEach((label, i) => {
            let sideLength = calculateDistance(midPoints[i], points[i], normalizationFactor);
            ctx.fillStyle = colors[i];
            ctx.fillText(`${label} = ${Math.round(sideLength * 2)}`, midPoints[i].x + 10, midPoints[i].y - 10);
        });

        calculateSides();
    }

    function calculateSides() {
        let sides = points.map((p, i) => {
            let q = points[(i + 1) % 3];
            return Math.sqrt((p.x - q.x)**2 + (p.y - q.y)**2);
        });
    }

    function calculateDistance(point1, point2, normalizationFactor) {
        const dx = point2.x - point1.x;
        const dy = point2.y - point1.y;
        return Math.sqrt(dx*dx + dy*dy) / normalizationFactor;
    }

    function drawPoint(point, color = 'black', radius = 5) {
        ctx.beginPath();
        ctx.arc(point.x, point.y, radius, 0, 2 * Math.PI);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.closePath();
    }

    function drawSquareOnLine(point1, point2, color, label) {
        ctx.beginPath();
    
        let dx = point2.x - point1.x;
        let dy = point2.y - point1.y;
        let dist = calculateDistance(point1, point2, normalizationFactor);
        let orientation = calculateTriangleOrientation();

        let nx = -orientation * -(point2.y - point1.y) / (dist * normalizationFactor);
        let ny = -orientation * (point2.x - point1.x) / (dist * normalizationFactor);
        
        ctx.moveTo(point1.x, point1.y);
        ctx.lineTo(point1.x + nx * dist * normalizationFactor, point1.y + ny * dist * normalizationFactor);
        ctx.lineTo(point2.x + nx * dist * normalizationFactor, point2.y + ny * dist * normalizationFactor);
        ctx.lineTo(point2.x, point2.y);
        
        ctx.closePath();
        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        ctx.stroke();
        ctx.globalAlpha = 0.3;
        ctx.fill();
        ctx.globalAlpha = 1.0;

        ctx.fillStyle = color;
        if (label != "c") 
            text = label + "² = "
        else
            text = "a² + b² = c² = "

        ctx.fillText(text + Math.round(dist**2).toString(), 
            (point1.x + point2.x + nx * dist * normalizationFactor) / 2, 
            (point1.y + point2.y + ny * dist * normalizationFactor) / 2);

    }

    function calculateTriangleOrientation() {
        let [a, b, c] = points;
        let area = 0.5 * (-b.y*c.x + a.y*(-b.x + c.x) + a.x*(b.y - c.y) + b.x*c.y);

        // Return 1 for counter-clockwise, -1 for clockwise
        return area > 0 ? 1 : -1;
    }

    function snapToGrid(value) {
        return Math.round(value / normalizationFactor) * normalizationFactor;
    }
    
    function distance(x1, y1, x2, y2) {
        return Math.sqrt((x1 - x2)**2 + (y1 - y2)**2);
    }

    resizeCanvas();
});
