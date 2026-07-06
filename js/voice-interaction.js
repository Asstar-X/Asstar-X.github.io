// DOM Elements
const micBtn = document.getElementById('mic-btn');
const statusBadge = document.getElementById('status-badge');
const statusText = document.getElementById('status-text');
const chatLog = document.getElementById('chat-log');
const textInput = document.getElementById('text-input');
const sendBtn = document.getElementById('send-btn');
const orbCanvas = document.getElementById('orb-canvas');
const waveformCanvas = document.getElementById('waveform-canvas');

// State variables
let isListening = false;
let isSpeaking = false;
let isThinking = false;
let assistantState = 'idle'; // 'idle', 'listening', 'thinking', 'speaking'

// Audio variables for visualizer
let audioCtx = null;
let analyser = null;
let micStream = null;
let dataArray = [];
let sourceNode = null;
let volumeLevel = 0; // 0 to 100

// Canvas context setups
const orbCtx = orbCanvas.getContext('2d');
const waveCtx = waveformCanvas.getContext('2d');

function resizeCanvases() {
    orbCanvas.width = orbCanvas.parentElement.clientWidth;
    orbCanvas.height = orbCanvas.parentElement.clientHeight;
    waveformCanvas.width = waveformCanvas.parentElement.clientWidth;
    waveformCanvas.height = waveformCanvas.parentElement.clientHeight;
}
window.addEventListener('resize', resizeCanvases);
resizeCanvases();

// Web Speech API
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = null;

if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'zh-CN';

    recognition.onstart = () => {
        setAssistantState('listening');
        appendChat('正在聆听...', 'assistant-temp');
    };

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        // Clear temporary bubble
        removeTempBubble();
        appendChat(transcript, 'user');
        processCommand(transcript);
    };

    recognition.onerror = (event) => {
        removeTempBubble();
        console.error('Speech Recognition Error: ', event.error);
        if (event.error === 'not-allowed') {
            appendChat('麦克风权限被拒绝，请检查浏览器地址栏右侧的权限设置。', 'assistant');
        } else if (event.error === 'no-speech') {
            appendChat('未检测到语音输入，请再说一遍。', 'assistant');
        } else {
            appendChat('语音识别出现异常，您可以直接在输入框中打字。', 'assistant');
        }
        setAssistantState('idle');
    };

    recognition.onend = () => {
        if (assistantState === 'listening') {
            setAssistantState('idle');
        }
    };
} else {
    console.warn('SpeechRecognition not supported in this browser.');
}

// Speech Synthesis
function speakText(text, callback) {
    if ('speechSynthesis' in window) {
        // Cancel any ongoing speaking
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'zh-CN';
        utterance.rate = 1.0;
        utterance.pitch = 1.0;

        utterance.onstart = () => {
            setAssistantState('speaking');
        };

        utterance.onend = () => {
            setAssistantState('idle');
            if (callback) callback();
        };

        utterance.onerror = (err) => {
            console.error('SpeechSynthesis Error: ', err);
            setAssistantState('idle');
            if (callback) callback();
        };

        // Find a nice Chinese voice if possible
        const voices = window.speechSynthesis.getVoices();
        const zhVoice = voices.find(v => v.lang.includes('zh') || v.name.includes('Chinese') || v.name.includes('Google'));
        if (zhVoice) {
            utterance.voice = zhVoice;
        }

        window.speechSynthesis.speak(utterance);
    } else {
        // No TTS support
        if (callback) callback();
    }
}

// Initialize Audio context on click to conform to browser autoplay policy
async function initAudio() {
    if (audioCtx) return;
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        micStream = stream;
        
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        sourceNode = audioCtx.createMediaStreamSource(stream);
        sourceNode.connect(analyser);
        
        dataArray = new Uint8Array(analyser.frequencyBinCount);
    } catch (err) {
        console.warn('Microphone access denied or not available: ', err);
    }
}

// State Machine Controller
function setAssistantState(state) {
    assistantState = state;
    
    // CSS styles mapping
    micBtn.className = 'mic-btn';
    statusBadge.className = 'status-badge';
    
    if (state === 'listening') {
        statusText.innerText = '正在聆听...';
        statusBadge.classList.add('listening');
        micBtn.classList.add('active');
    } else if (state === 'thinking') {
        statusText.innerText = '正在思考...';
        statusBadge.classList.add('thinking');
        micBtn.classList.add('thinking');
    } else if (state === 'speaking') {
        statusText.innerText = '正在说话...';
        statusBadge.classList.add('speaking');
        micBtn.classList.add('speaking');
    } else {
        statusText.innerText = '系统空闲';
        micBtn.classList.add('idle');
    }
}

// Speech Synthesis & Recognition Trigger
micBtn.addEventListener('click', async () => {
    await initAudio();

    if (assistantState === 'listening') {
        if (recognition) recognition.stop();
        setAssistantState('idle');
    } else {
        if (recognition) {
            try {
                recognition.start();
            } catch (e) {
                recognition.stop();
                setTimeout(() => recognition.start(), 200);
            }
        } else {
            appendChat('当前浏览器不支持语音识别功能，请直接输入文字进行交流。', 'assistant');
        }
    }
});

// Chat utilities
function appendChat(text, sender) {
    const bubble = document.createElement('div');
    bubble.className = `chat-bubble ${sender}`;
    bubble.innerText = text;
    chatLog.appendChild(bubble);
    chatLog.scrollTop = chatLog.scrollHeight;
}

function removeTempBubble() {
    const temp = chatLog.querySelector('.assistant-temp');
    if (temp) temp.remove();
}

// Text Fallback Execution
function handleTextInput() {
    const val = textInput.value.trim();
    if (!val) return;
    textInput.value = '';
    
    appendChat(val, 'user');
    processCommand(val);
}

sendBtn.addEventListener('click', handleTextInput);
textInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleTextInput();
});

// Process Speech or Text Command
function processCommand(cmd) {
    setAssistantState('thinking');
    
    const text = cmd.toLowerCase().trim();
    let responseText = '';
    let action = null;

    // Direct route command parsing
    if (text.includes('论文') || text.includes('学术') || text.includes('papers')) {
        responseText = '正在调起粒子引擎，前往 Nova 学术论文板块。';
        action = () => {
            document.body.classList.remove('page-ready');
            setTimeout(() => { window.location.href = 'nova.html?tab=papers'; }, 260);
        };
    } else if (text.includes('轨道') || text.includes('时间轴') || text.includes('星系') || text.includes('orbit')) {
        responseText = '正在为您接通星系项目轨道。';
        action = () => {
            document.body.classList.remove('page-ready');
            setTimeout(() => { window.location.href = 'orbit.html'; }, 260);
        };
    } else if (text.includes('项目') || text.includes('雷达') || text.includes('trending')) {
        responseText = '正在重构网格，前往 Nova 开源热门项目板块。';
        action = () => {
            document.body.classList.remove('page-ready');
            setTimeout(() => { window.location.href = 'nova.html?tab=projects'; }, 260);
        };
    } else if (text.includes('新闻') || text.includes('焦点') || text.includes('资讯') || text.includes('focus') || text.includes('nova')) {
        responseText = '正在为您接通 Nova 综合前沿资讯面板。';
        action = () => {
            document.body.classList.remove('page-ready');
            setTimeout(() => { window.location.href = 'nova.html?tab=focus'; }, 260);
        };
    } else if (text.includes('联系') || text.includes('邮箱') || text.includes('微信') || text.includes('contact')) {
        responseText = '如需联系我们，请发送邮件至 asstarx7@gmail.com，或添加微信 GitscYee。';
    } else if (text.includes('工具') || text.includes('tools') || text.includes('atlas')) {
        responseText = '正在为您拉起效率面板，进入 Atlas 提效工具库。';
        action = () => {
            document.body.classList.remove('page-ready');
            setTimeout(() => { window.location.href = 'atlas.html'; }, 260);
        };
    } else if (text.includes('你好') || text.includes('嗨') || text.includes('hello')) {
        responseText = '你好！我是 Asstar 智能语音助理。我可以带你去导航到其它界面、跳转到效率工具，或者为你介绍系统功能。';
    } else if (text.includes('你是谁') || text.includes('介绍自己')) {
        responseText = '我是 Asstar 宇宙导航协议中的语音交互核心。我的任务是打破维度，通过声音来调度您的网页跳转以及控制页面视觉参数。';
    } else {
        responseText = '关于其他问题与深度定制，属于付费服务，请联系下方的微信或邮箱名片。';
    }

    // Simulate slight AI thinking latency
    setTimeout(() => {
        appendChat(responseText, 'assistant');
        speakText(responseText, () => {
            if (action) action();
        });
    }, 600);
}

// Demo card clicks
window.speakDemo = function(cmd) {
    textInput.value = cmd;
    handleTextInput();
};

// Render Loops for visualizers
let animTime = 0;

function animateOrb() {
    requestAnimationFrame(animateOrb);
    animTime += 0.02;

    // Clear visualizer
    orbCtx.clearRect(0, 0, orbCanvas.width, orbCanvas.height);
    const cx = orbCanvas.width / 2;
    const cy = orbCanvas.height / 2;

    // Read live volume if analyser is active
    let amp = 0;
    if (analyser && micStream) {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
        }
        amp = sum / dataArray.length; // average volume 0 - 255
    } else {
        // Procedural breath pulse fallback
        if (assistantState === 'listening') amp = 40 + Math.sin(animTime * 5) * 20;
        else if (assistantState === 'thinking') amp = 50 + Math.sin(animTime * 8) * 15;
        else if (assistantState === 'speaking') amp = 30 + Math.abs(Math.sin(animTime * 4)) * 40;
        else amp = 10 + Math.sin(animTime * 2.5) * 5; // idle breath
    }

    // Adjust base radius depending on volume amplitude
    let baseRadius = 90 + amp * 0.45;
    if (baseRadius > 140) baseRadius = 140;

    // Orb theme coloring mapping
    let color = 'rgba(0, 240, 255, '; // default cyan
    let shadowColor = '#00F0FF';
    if (assistantState === 'thinking') {
        color = 'rgba(138, 43, 226, ';
        shadowColor = '#8a2be2';
    } else if (assistantState === 'speaking') {
        color = 'rgba(46, 204, 113, ';
        shadowColor = '#2ecc71';
    } else if (assistantState === 'idle') {
        color = 'rgba(127, 140, 141, ';
        shadowColor = '#7f8c8d';
    }

    // Draw outer particles aura
    orbCtx.save();
    orbCtx.shadowBlur = 30;
    orbCtx.shadowColor = shadowColor;
    
    const numWaves = 4;
    for (let w = 0; w < numWaves; w++) {
        orbCtx.beginPath();
        const waveOffset = w * (Math.PI / 2) + animTime;
        
        for (let a = 0; a <= Math.PI * 2; a += 0.05) {
            const noise = Math.sin(a * 5 + waveOffset) * (8 + amp * 0.15);
            const r = baseRadius + noise - (w * 10);
            const x = cx + Math.cos(a) * r;
            const y = cy + Math.sin(a) * r;
            if (a === 0) orbCtx.moveTo(x, y);
            else orbCtx.lineTo(x, y);
        }
        
        orbCtx.closePath();
        orbCtx.strokeStyle = color + `${0.6 - w * 0.15})`;
        orbCtx.lineWidth = 1.5 + (numWaves - w) * 0.5;
        orbCtx.stroke();
    }

    // Inner high energy core
    orbCtx.shadowBlur = 45;
    orbCtx.beginPath();
    orbCtx.arc(cx, cy, baseRadius * 0.65, 0, Math.PI * 2);
    const coreGradient = orbCtx.createRadialGradient(cx, cy, 0, cx, cy, baseRadius * 0.65);
    coreGradient.addColorStop(0, '#ffffff');
    coreGradient.addColorStop(0.3, color + '0.8)');
    coreGradient.addColorStop(1, 'transparent');
    orbCtx.fillStyle = coreGradient;
    orbCtx.fill();
    orbCtx.restore();
}

function animateWaveform() {
    requestAnimationFrame(animateWaveform);
    waveCtx.clearRect(0, 0, waveformCanvas.width, waveformCanvas.height);

    const w = waveformCanvas.width;
    const h = waveformCanvas.height;
    const cy = h / 2;

    waveCtx.beginPath();
    waveCtx.moveTo(0, cy);

    let strokeColor = 'rgba(0, 240, 255, 0.4)';
    if (assistantState === 'thinking') strokeColor = 'rgba(138, 43, 226, 0.4)';
    else if (assistantState === 'speaking') strokeColor = 'rgba(46, 204, 113, 0.4)';
    else if (assistantState === 'idle') strokeColor = 'rgba(255, 255, 255, 0.1)';

    waveCtx.strokeStyle = strokeColor;
    waveCtx.lineWidth = 2;

    // Draw wave curves
    const frequency = 0.015;
    let amplitude = 2;
    
    if (analyser && micStream) {
        analyser.getByteTimeDomainData(dataArray);
        waveCtx.beginPath();
        const sliceWidth = w * 1.0 / dataArray.length;
        let x = 0;
        for (let i = 0; i < dataArray.length; i++) {
            const v = dataArray[i] / 128.0;
            const y = v * cy;
            if (i === 0) waveCtx.moveTo(x, y);
            else waveCtx.lineTo(x, y);
            x += sliceWidth;
        }
        waveCtx.stroke();
    } else {
        // Fallback simulation
        if (assistantState === 'listening') amplitude = 12;
        else if (assistantState === 'thinking') amplitude = 5;
        else if (assistantState === 'speaking') amplitude = 16;
        
        for (let x = 0; x < w; x++) {
            const noise = Math.sin(x * frequency + animTime * 4) * Math.cos(x * 0.005 + animTime) * amplitude;
            waveCtx.lineTo(x, cy + noise);
        }
        waveCtx.stroke();
    }
}

// Start render visualizers
animateOrb();
animateWaveform();

// --- ASPLAYER TAB INITIALIZATION AND CONTROL ---
window.isAsplayerActive = false;

document.addEventListener('DOMContentLoaded', () => {
    const tabs = document.querySelectorAll('#voice-primary-tabs .source-tab');
    const asliveContent = document.getElementById('aslive-tab-content');
    const asplayerContent = document.getElementById('asplayer-tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            tabs.forEach(t => t.classList.remove('active'));
            e.currentTarget.classList.add('active');
            
            const targetTab = e.currentTarget.dataset.tab;
            if (targetTab === 'aslive') {
                asliveContent.style.display = 'block';
                asplayerContent.style.display = 'none';
                window.isAsplayerActive = false;
                
                // Hide track info panel on AsLive tab
                const trackInfo = document.querySelector('.asplayer-track-info');
                if (trackInfo) trackInfo.style.display = 'none';

                // Trigger resize event to let canvases recalculate their size
                window.dispatchEvent(new Event('resize'));
            } else if (targetTab === 'asplayer') {
                asliveContent.style.display = 'none';
                asplayerContent.style.display = 'block';
                window.isAsplayerActive = true;

                // Show track info panel on Asplayer tab
                const trackInfo = document.querySelector('.asplayer-track-info');
                if (trackInfo) trackInfo.style.display = 'flex';

                // Trigger resize event to let WebGL renderer adjust its viewport size
                window.dispatchEvent(new Event('resize'));
                
                // Automatically play the default track
                if (typeof window.playAsplayerDefault === 'function') {
                    window.playAsplayerDefault();
                }
            }
        });
    });
});

// --- Asplayer (AsVox) Visualizer Script ---
(function () {
    // --- 1. THREE.JS SCENE ---
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.002); // Pure black fog

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 35;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.getElementById('asplayer-canvas-container').appendChild(renderer.domElement);

    // Particle Sphere
    const geometry = new THREE.SphereGeometry(12, 128, 128); 
    const material = new THREE.PointsMaterial({
        size: 0.15,
        color: 0xffffff,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending,
        vertexColors: true
    });

    const count = geometry.attributes.position.count;
    const colors = [];
    const color1 = new THREE.Color(0x00f2ff);
    const color2 = new THREE.Color(0xbd00ff);
    const originalPositions = geometry.attributes.position.array.slice();

    for (let i = 0; i < count; i++) {
        const mixed = color1.clone().lerp(color2, Math.random());
        colors.push(mixed.r, mixed.g, mixed.b);
    }
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    const sphere = new THREE.Points(geometry, material);
    scene.add(sphere);

    // --- 2. AUDIO & MONITOR SYSTEM ---
    let audioContext, analyser, dataArray;
    let isAudioInit = false;
    const audioElement = document.getElementById('asplayer-audio-element');
    const inputElement = document.getElementById('asplayer-audio-input');

    // EQ UI Selectors
    const eqSubFill = document.querySelector('[data-band="sub"] .asplayer-eq-bar-fill');
    const eqLowFill = document.querySelector('[data-band="low"] .asplayer-eq-bar-fill');
    const eqMidFill = document.querySelector('[data-band="mid"] .asplayer-eq-bar-fill');
    const eqHighFill = document.querySelector('[data-band="high"] .asplayer-eq-bar-fill');

    const eqSubVal = document.querySelector('[data-band="sub"] .asplayer-eq-value');
    const eqLowVal = document.querySelector('[data-band="low"] .asplayer-eq-value');
    const eqMidVal = document.querySelector('[data-band="mid"] .asplayer-eq-value');
    const eqHighVal = document.querySelector('[data-band="high"] .asplayer-eq-value');

    // Smoothed Values for 3D Sphere
    let smoothedBass = 0;
    let smoothedAvg = 0;

    inputElement.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;

        const nameDisplay = document.getElementById('asplayer-track-name');
        nameDisplay.textContent = file.name;
        nameDisplay.style.opacity = '1';

        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            analyser = audioContext.createAnalyser();
            analyser.fftSize = 256; // Smaller FFT size is enough for visualizer bars
            analyser.smoothingTimeConstant = 0.8; 

            const source = audioContext.createMediaElementSource(audioElement);
            source.connect(analyser);
            analyser.connect(audioContext.destination);
            
            dataArray = new Uint8Array(analyser.frequencyBinCount);
            isAudioInit = true;
        }

        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }

        const objectUrl = URL.createObjectURL(file);
        audioElement.src = objectUrl;
        audioElement.play().then(() => {
            if (audioContext.state === 'suspended') {
                audioContext.resume();
            }
        }).catch(err => {
            console.warn("Audio play started, context check:", err);
        });
    });

    // Exposed function to auto-play default track if not initialized
    window.playAsplayerDefault = function() {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            analyser = audioContext.createAnalyser();
            analyser.fftSize = 256;
            analyser.smoothingTimeConstant = 0.8;

            const source = audioContext.createMediaElementSource(audioElement);
            source.connect(analyser);
            analyser.connect(audioContext.destination);
            
            dataArray = new Uint8Array(analyser.frequencyBinCount);
            isAudioInit = true;
        }
        
        if (audioElement.paused) {
            if (audioContext.state === 'suspended') {
                audioContext.resume();
            }
            audioElement.play().then(() => {
                if (audioContext.state === 'suspended') {
                    audioContext.resume();
                }
            }).catch(err => {
                console.warn("Autoplay default audio failed:", err);
            });
        }
    };

    // Play/Pause button controller
    const playBtn = document.getElementById('asplayer-play-btn');
    const playIcon = document.getElementById('asplayer-play-icon');
    const pauseIcon = document.getElementById('asplayer-pause-icon');

    if (playBtn) {
        playBtn.addEventListener('click', () => {
            if (!audioContext) {
                window.playAsplayerDefault();
                return;
            }

            if (audioElement.paused) {
                if (audioContext.state === 'suspended') {
                    audioContext.resume();
                }
                audioElement.play();
            } else {
                audioElement.pause();
            }
        });
    }

    // Sync HTML5 audio play/pause status with play/pause icons
    audioElement.addEventListener('play', () => {
        if (playIcon) playIcon.style.display = 'none';
        if (pauseIcon) pauseIcon.style.display = 'block';
    });

    audioElement.addEventListener('pause', () => {
        if (playIcon) playIcon.style.display = 'block';
        if (pauseIcon) pauseIcon.style.display = 'none';
    });

    // --- 3. HELPER FUNCTIONS ---
    function lerp(start, end, amt) {
        return (1 - amt) * start + amt * end;
    }

    function getAverage(arr, start, end) {
        let sum = 0;
        let count = 0;
        for (let i = start; i <= end && i < arr.length; i++) {
            sum += arr[i];
            count++;
        }
        return count > 0 ? sum / count : 0;
    }

    // --- 4. ANIMATION LOOP ---
    let time = 0;
    let mouseX = 0, mouseY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX - window.innerWidth / 2) * 0.0005;
        mouseY = (e.clientY - window.innerHeight / 2) * 0.0005;
    });

    function animate() {
        requestAnimationFrame(animate);
        
        // Only run loop calculations/renders if Asplayer is active
        if (!window.isAsplayerActive) return;

        time += 0.005;

        // Variables for audio data
        let bassTarget = 0;
        let avgTarget = 0;

        if (isAudioInit) {
            analyser.getByteFrequencyData(dataArray);
            
            // 1. Process Data for 3D Sphere
            const overallSum = dataArray.reduce((a, b) => a + b, 0);
            avgTarget = overallSum / dataArray.length;
            bassTarget = dataArray[5] / 255; // Low frequency index

            // 2. Update Dynamic EQ Bands UI
            updateEQBands(dataArray);
        } else {
            // Idle monitor/EQ animation
            updateIdleEQ(time);
        }

        // Smooth audio values for physics
        smoothedBass = lerp(smoothedBass, bassTarget, 0.08); 
        smoothedAvg = lerp(smoothedAvg, avgTarget / 255, 0.1);

        // --- 3D SPHERE LOGIC (UNCHANGED) ---
        const scaleTarget = 1 + (smoothedBass * 0.3); 
        sphere.scale.lerp(new THREE.Vector3(scaleTarget, scaleTarget, scaleTarget), 0.05);

        const positions = sphere.geometry.attributes.position.array;
        const audioForce = smoothedAvg * 5.0; 

        for (let i = 0; i < count; i++) {
            const px = originalPositions[i * 3];
            const py = originalPositions[i * 3 + 1];
            const pz = originalPositions[i * 3 + 2];

            let noise = Math.sin(px * 0.4 + time * 2) * 
                        Math.cos(py * 0.3 + time * 1.5) * 
                        Math.sin(pz * 0.4 + time * 2.5);

            const displacement = 1 + (noise * 0.1) + (noise * audioForce * 0.25);

            positions[i * 3]     = px * displacement;
            positions[i * 3 + 1] = py * displacement;
            positions[i * 3 + 2] = pz * displacement;
        }
        sphere.geometry.attributes.position.needsUpdate = true;
        sphere.rotation.y += 0.001 + (smoothedAvg * 0.002); 
        sphere.rotation.x += (mouseY - sphere.rotation.x) * 0.05;
        sphere.rotation.y += (mouseX - sphere.rotation.y) * 0.05;

        renderer.render(scene, camera);
    }

    // --- 5. EQ UPDATE LOGIC ---
    function updateEQBands(data) {
        // Get values for each band (0 - 255)
        const subVal = getAverage(data, 1, 10);
        const lowVal = getAverage(data, 11, 35);
        const midVal = getAverage(data, 36, 80);
        const highVal = getAverage(data, 81, 120);

        // Convert to percentage
        const subPct = Math.round((subVal / 255) * 100);
        const lowPct = Math.round((lowVal / 255) * 100);
        const midPct = Math.round((midVal / 255) * 100);
        const highPct = Math.round((highVal / 255) * 100);

        // Update UI elements
        if (eqSubFill) eqSubFill.style.height = subPct + '%';
        if (eqLowFill) eqLowFill.style.height = lowPct + '%';
        if (eqMidFill) eqMidFill.style.height = midPct + '%';
        if (eqHighFill) eqHighFill.style.height = highPct + '%';

        if (eqSubVal) eqSubVal.textContent = subPct + '%';
        if (eqLowVal) eqLowVal.textContent = lowPct + '%';
        if (eqMidVal) eqMidVal.textContent = midPct + '%';
        if (eqHighVal) eqHighVal.textContent = highPct + '%';
    }

    // Smoothed idle values for natural look
    let idleSub = 0, idleLow = 0, idleMid = 0, idleHigh = 0;

    function updateIdleEQ(t) {
        // Generate targets (0 to 30%)
        const subTarget = 10 + Math.sin(t * 3.5) * 8 + Math.cos(t * 1.2) * 4;
        const lowTarget = 12 + Math.cos(t * 2.8) * 7 + Math.sin(t * 1.5) * 5;
        const midTarget = 8 + Math.sin(t * 4.2) * 6 + Math.cos(t * 2.1) * 3;
        const highTarget = 6 + Math.cos(t * 5.0) * 5 + Math.sin(t * 2.5) * 2;

        // Smooth targets using lerp
        idleSub = lerp(idleSub, subTarget, 0.1);
        idleLow = lerp(idleLow, lowTarget, 0.1);
        idleMid = lerp(idleMid, midTarget, 0.1);
        idleHigh = lerp(idleHigh, highTarget, 0.1);

        const subPct = Math.round(Math.max(0, idleSub));
        const lowPct = Math.round(Math.max(0, idleLow));
        const midPct = Math.round(Math.max(0, idleMid));
        const highPct = Math.round(Math.max(0, idleHigh));

        if (eqSubFill) eqSubFill.style.height = subPct + '%';
        if (eqLowFill) eqLowFill.style.height = lowPct + '%';
        if (eqMidFill) eqMidFill.style.height = midPct + '%';
        if (eqHighFill) eqHighFill.style.height = highPct + '%';

        if (eqSubVal) eqSubVal.textContent = subPct + '%';
        if (eqLowVal) eqLowVal.textContent = lowPct + '%';
        if (eqMidVal) eqMidVal.textContent = midPct + '%';
        if (eqHighVal) eqHighVal.textContent = highPct + '%';
    }

    animate();

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

})();
