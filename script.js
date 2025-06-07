// Basic Scene Setup
let scene, camera, renderer;
let textDisplayElement;
let textMesh, font;
let shuffledTextPool = [];
let currentIndex = 0;

// --- TEXT POOL DEFINITION ---
const textPool = [];

// 1. Populate with ASCII characters (Printable characters from 32 to 126)
// for (let i = 32; i <= 126; i++) {
//     textPool.push(String.fromCharCode(i));
// }

// 2. Populate with the specified list of commands
const commands = [
    "Command", "FORWARD", "BACK", "RIGHT", "LEFT", "PENUP", "PENDOWN",
    "SETPOS", "SETHEADING", "HOME", "CLEARSCREEN", "CLEAN", "HIDETURTLE",
    "SHOWTURTLE", "PENCOLOR", "BACKGROUND", "WRAP", "FENCE", "WINDOW",
    "SUM", "DIFFERENCE", "PRODUCT", "QUOTIENT", "REMAINDER", "SQRT",
    "RANDOM", "SIN", "COS", "TAN", "ARCTAN", "TO", "END", "REPEAT", "IF",
    "IFELSE", "STOP", "OUTPUT", "MAKE", "WAIT", "GO", "LABEL", "OP",
    "BACKGROUND", "BACK", "CLEARSCREEN", "FORWARD", "HIDETURTLE", "LEFT",
    "PENCOLOR", "PENDOWN", "PENUP", "RIGHT", "SETHEADING", "SHOWTURTLE",
    "SETPOS", "HOME", "CLEAN", "WRAP", "FENCE", "WINDOW", "BG", "BK",
    "CS", "FD", "HT", "LT", "PC", "PD", "PU", "RT", "SETH", "ST", "FD",
    "BK", "RT", "LT", "PU", "PD", "SETH", "CS", "HT", "ST", "PC", "BG"
];

// Use a Set to get unique commands, then spread back into an array
const uniqueCommands = [...new Set(commands)];

// Add the unique commands to the text pool
textPool.push(...uniqueCommands);

// --- SHUFFLE FUNCTION ---
function shuffleArray(array) {
    const shuffled = [...array]; // Create a copy
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// --- THREE.JS INITIALIZATION AND LOGIC ---
function init() {
    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    // Camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 15;

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Get text display element
    textDisplayElement = document.getElementById('textDisplay');

    // Load font and create shuffled version of textPool
    loadFont().then(() => {
        shuffledTextPool = shuffleArray(textPool);
        startTextPresentation();
    });

    // Event Listeners
    window.addEventListener('resize', onWindowResize, false);

    // Start animation loop
    animate();
}

// --- FONT LOADING ---
function loadFont() {
    return new Promise((resolve) => {
        const loader = new THREE.FontLoader();
        // Using a basic font that's similar to VT323
        loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', (loadedFont) => {
            font = loadedFont;
            resolve();
        });
    });
}

// --- 3D TEXT CREATION ---
function create3DText(text, is3D = false) {
    // Remove existing text mesh
    if (textMesh) {
        scene.remove(textMesh);
    }

    if (is3D && font) {
        // Create 3D text geometry
        const textGeometry = new THREE.TextGeometry(text, {
            font: font,
            size: 2,
            height: 0.5,
            curveSegments: 12,
            bevelEnabled: true,
            bevelThickness: 0.1,
            bevelSize: 0.05,
            bevelOffset: 0,
            bevelSegments: 5
        });

        // Center the geometry
        textGeometry.computeBoundingBox();
        const centerOffsetX = -0.5 * (textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x);
        const centerOffsetY = -0.5 * (textGeometry.boundingBox.max.y - textGeometry.boundingBox.min.y);
        textGeometry.translate(centerOffsetX, centerOffsetY, 0);

        // Create material
        const textMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
        
        // Create mesh
        textMesh = new THREE.Mesh(textGeometry, textMaterial);
        scene.add(textMesh);

        // Hide HTML text
        textDisplayElement.style.display = 'none';
    } else {
        // Use HTML text for 2D display
        textDisplayElement.textContent = text;
        textDisplayElement.style.display = 'flex';
    }
}

// --- TEXT PRESENTATION FUNCTION ---
function startTextPresentation() {
    // Always display "GO" as the first word
    create3DText("GO", false);
    currentIndex++; // Increment to start from the second item in the next iteration
    
    // Start the normal cycling after exactly 2 seconds
    setTimeout(displayNextText, 2000);
}

function displayNextText() {
    // Cycle through the pool twice
    if (currentIndex >= shuffledTextPool.length * 2) {
        // Always display "SHOWTURTLE" as the last word using HTML with VT323 font
        textDisplayElement.textContent = "SHOWTURTLE";
        textDisplayElement.style.display = 'flex';
        
        // Flash 5 times before disappearing
        setTimeout(() => {
            flashSHOWTURTLE();
        }, 1000); // Hold for 1 second before flashing
        return;
    }
    
    // Display the current item (use modulo to wrap around)
    create3DText(shuffledTextPool[currentIndex % shuffledTextPool.length], false);
    
    // Move to next item
    currentIndex++;
    
    // Calculate dynamic delay: starts at 700ms, decreases exponentially to 0.5ms over 3 seconds
    const startDelay = 700; // in ms
    const endDelay = 0.5;   // in ms        
    const duration = 3000; // in ms

    // Calculate elapsed time (approximation based on iterations)
    const elapsedTime = Math.min(currentIndex * 25, duration);
    const progress = elapsedTime / duration;
    
    // Exponential decay interpolation
    const exponentialProgress = 1 - Math.exp(-6 * progress);
    const currentDelay = startDelay - (startDelay - endDelay) * exponentialProgress;
    
    // Schedule the next text change
    setTimeout(displayNextText, currentDelay);
}

function flashSHOWTURTLE() {
    let flashCount = 0;
    
    function doFlash() {
        if (flashCount < 5) {
            // Hide text
            textDisplayElement.style.opacity = '0';
            
            setTimeout(() => {
                // Show text
                textDisplayElement.style.opacity = '1';
                flashCount++;
                
                setTimeout(doFlash, 300); // Flash interval
            }, 300);
        } else {
            // After 5 flashes, hide completely after 3 seconds total
            setTimeout(() => {
                textDisplayElement.style.display = 'none';
            }, 1000);
        }
    }
    
    doFlash();
}

// --- UTILITY FUNCTIONS ---
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

// Let's go!
init();