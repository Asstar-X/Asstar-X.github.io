// 3D 太空宇宙交互场景 - Three.js 实现
// 说明：纯前端实现，兼容 GitHub Pages，无后端依赖

import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js';

// ---------- 数据持久化 ----------
const STORAGE_KEY = 'asstar_space_planets_v1';

function loadPlanetsFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function savePlanetsToStorage(planets) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(planets));
}

// 预置行星
const defaultPlanets = [
  {
    id: 'creative',
    name: '创意星',
    description: '设计、艺术、手工的灵感之源。',
    tags: ['设计', '艺术', '手工'],
    color: 0x74a7ff,
    ring: true,
    wechatLink: '#',
    groupCount: 0,
    radius: 4,
    orbitRadius: 26,
    orbitSpeed: 0.003
  },
  {
    id: 'knowledge',
    name: '知识星',
    description: '学习、阅读、思考的心智增益场。',
    tags: ['学习', '阅读', '思考'],
    color: 0x9ef7d3,
    ring: false,
    wechatLink: '#',
    groupCount: 0,
    radius: 3.3,
    orbitRadius: 36,
    orbitSpeed: 0.0025
  },
  {
    id: 'technology',
    name: '科技星',
    description: '数码、科学、前沿的加速器。',
    tags: ['数码', '科学', '前沿'],
    color: 0xffd37e,
    ring: false,
    wechatLink: '#',
    groupCount: 0,
    radius: 3.8,
    orbitRadius: 48,
    orbitSpeed: 0.0022
  },
  {
    id: 'gossip',
    name: '八卦星',
    description: '每天新闻，光速吃瓜。',
    tags: ['资讯', '新闻', '热榜'],
    color: 0xff9fb6,
    ring: true,
    wechatLink: '#',
    groupCount: 0,
    radius: 3.0,
    orbitRadius: 20,
    orbitSpeed: 0.0035
  }
];

let planetsData = loadPlanetsFromStorage() || defaultPlanets;

// ---------- Three.js 场景 ----------
const root = document.getElementById('three-root');
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
root.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x02030a, 120, 220);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1500);
camera.position.set(0, 26, 78);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.minDistance = 10;
controls.maxDistance = 240;

// 环境光 + 恒星光
scene.add(new THREE.AmbientLight(0x465a87, 0.75));
const starLight = new THREE.PointLight(0xe7f0ff, 65, 0, 1.8);
starLight.position.set(0, 0, 0);
scene.add(starLight);

// 远景星空
const starGeo = new THREE.BufferGeometry();
const starCount = 3000;
const starPositions = new Float32Array(starCount * 3);
for (let i = 0; i < starCount; i++) {
  const r = 600 * (0.6 + Math.random() * 0.4);
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos(2 * Math.random() - 1);
  starPositions[i * 3 + 0] = r * Math.sin(phi) * Math.cos(theta);
  starPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
  starPositions[i * 3 + 2] = r * Math.cos(phi);
}
starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
const starMat = new THREE.PointsMaterial({ color: 0x9fb7ff, size: 1.2, sizeAttenuation: true, transparent: true, opacity: 0.85 });
const stars = new THREE.Points(starGeo, starMat);
scene.add(stars);

// 星云薄雾（球体内雾化）
const nebulaGeo = new THREE.SphereGeometry(520, 64, 64);
const nebulaMat = new THREE.ShaderMaterial({
  transparent: true,
  depthWrite: false,
  uniforms: { uTime: { value: 0 } },
  vertexShader: `
    varying vec3 vPos;
    void main(){
      vPos = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
    }
  `,
  fragmentShader: `
    varying vec3 vPos;
    uniform float uTime;
    float noise(vec3 p){
      return fract(sin(dot(p, vec3(12.9898,78.233,54.53))) * 43758.5453);
    }
    void main(){
      float n = noise(normalize(vPos) * 6.0 + uTime*0.02);
      float a = smoothstep(0.25, 0.95, n) * 0.22;
      gl_FragColor = vec4(0.10, 0.22, 0.55, a);
    }
  `
});
const nebula = new THREE.Mesh(nebulaGeo, nebulaMat);
scene.add(nebula);

// 中央恒星
const sunGeo = new THREE.SphereGeometry(8, 64, 64);
const sunMat = new THREE.MeshStandardMaterial({
  color: 0xe7f0ff,
  emissive: 0x89a7ff,
  emissiveIntensity: 0.65,
  roughness: 0.35,
  metalness: 0.0
});
const sun = new THREE.Mesh(sunGeo, sunMat);
scene.add(sun);

// 行星容器与光环辅助
const planetsGroup = new THREE.Group();
scene.add(planetsGroup);

const ringMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.15, side: THREE.DoubleSide });

function createPlanetMesh(item) {
  const geo = new THREE.SphereGeometry(item.radius, 48, 48);
  const mat = new THREE.MeshStandardMaterial({
    color: item.color,
    roughness: 0.6,
    metalness: 0.15,
    emissive: new THREE.Color(item.color).multiplyScalar(0.04),
    emissiveIntensity: 1
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.userData = { ...item, angle: Math.random() * Math.PI * 2 };

  // 轨道环
  const orbitRing = new THREE.Mesh(new THREE.RingGeometry(item.orbitRadius - 0.05, item.orbitRadius + 0.05, 128), ringMaterial);
  orbitRing.rotation.x = -Math.PI / 2;
  planetsGroup.add(orbitRing);

  // 行星自有环
  if (item.ring) {
    const ring = new THREE.Mesh(new THREE.RingGeometry(item.radius * 1.4, item.radius * 2.2, 64), new THREE.MeshStandardMaterial({ color: item.color, transparent: true, opacity: 0.35, side: THREE.DoubleSide }));
    ring.rotation.x = -Math.PI / 2.4;
    mesh.add(ring);
  }
  return mesh;
}

const planetMeshes = [];
function rebuildPlanets() {
  // 清理
  planetMeshes.splice(0).forEach(m => planetsGroup.remove(m));
  // 重建
  for (const p of planetsData) {
    const mesh = createPlanetMesh(p);
    planetMeshes.push(mesh);
    planetsGroup.add(mesh);
  }
}
rebuildPlanets();

// Raycaster 点击拾取
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

function onPointerDown(event) {
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const intersects = raycaster.intersectObjects(planetMeshes);
  if (intersects.length) {
    const target = intersects[0].object.userData;
    showPanel(target.id);
  }
}
renderer.domElement.addEventListener('pointerdown', onPointerDown);

// 动画循环
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const t = clock.getElapsedTime();

  nebula.material.uniforms.uTime.value = t;
  sun.rotation.y += 0.003;
  stars.rotation.y += 0.0004;

  for (const mesh of planetMeshes) {
    const u = mesh.userData;
    u.angle += u.orbitSpeed;
    const x = Math.cos(u.angle) * u.orbitRadius;
    const z = Math.sin(u.angle) * u.orbitRadius;
    mesh.position.set(x, 0, z);
    mesh.rotation.y += 0.0025;
  }

  controls.update();
  renderer.render(scene, camera);
}
animate();

// 视角预设
const cameraPresets = {
  free: () => new THREE.Vector3(0, 26, 78),
  top: () => new THREE.Vector3(0, 120, 0.01),
  ring: () => new THREE.Vector3(90, 20, 0),
  deep: () => new THREE.Vector3(-40, 12, 140)
};

function moveCameraTo(target) {
  const from = camera.position.clone();
  const to = target.clone();
  const start = performance.now();
  const duration = 900;
  function step(now) {
    const p = Math.min(1, (now - start) / duration);
    const k = 1 - Math.pow(1 - p, 3);
    camera.position.lerpVectors(from, to, k);
    camera.lookAt(0, 0, 0);
    if (p < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

document.querySelectorAll('.ui-btn[data-camera]').forEach(btn => {
  btn.addEventListener('click', () => {
    const key = btn.getAttribute('data-camera');
    moveCameraTo(cameraPresets[key]());
  });
});

// ---------- 行星详情面板 ----------
const panel = document.getElementById('planet-panel');
const panelTitle = document.getElementById('panel-title');
const panelDesc = document.getElementById('panel-desc');
const panelTags = document.getElementById('panel-tags');
const panelLink = document.getElementById('panel-link');
const panelCount = document.getElementById('panel-count');
const panelClose = document.getElementById('panel-close');
const panelEdit = document.getElementById('panel-edit');
const panelDelete = document.getElementById('panel-delete');

function showPanel(id) {
  const p = planetsData.find(x => x.id === id);
  if (!p) return;
  panelTitle.textContent = p.name;
  panelDesc.textContent = p.description || '';
  panelTags.innerHTML = (p.tags || []).map(t => `<span class="badge">${t}</span>`).join('');
  panelLink.textContent = p.wechatLink || '—';
  if (p.wechatLink && /^https?:\/\//.test(p.wechatLink)) {
    panelLink.href = p.wechatLink;
  } else {
    panelLink.href = 'javascript:void(0)';
  }
  panelCount.textContent = String(p.groupCount ?? '-');
  panel.dataset.id = p.id;
  panel.style.display = 'block';
}
panelClose.addEventListener('click', () => panel.style.display = 'none');

panelEdit.addEventListener('click', () => {
  const id = panel.dataset.id;
  const p = planetsData.find(x => x.id === id);
  if (p) openModal(p);
});

panelDelete.addEventListener('click', () => {
  const id = panel.dataset.id;
  const idx = planetsData.findIndex(x => x.id === id);
  if (idx >= 0) {
    planetsData.splice(idx, 1);
    savePlanetsToStorage(planetsData);
    rebuildPlanets();
    panel.style.display = 'none';
  }
});

// ---------- 添加/编辑行星弹窗 ----------
const mask = document.getElementById('modal-mask');
const modalClose = document.getElementById('modal-close');
const modalCancel = document.getElementById('modal-cancel');
const modalSave = document.getElementById('modal-save');
const modalTitle = document.getElementById('modal-title');
const fName = document.getElementById('f-name');
const fDesc = document.getElementById('f-desc');
const fTags = document.getElementById('f-tags');
const fLink = document.getElementById('f-link');
const fCount = document.getElementById('f-count');

let editingId = null;

function openModal(data) {
  editingId = data?.id || null;
  modalTitle.textContent = editingId ? '编辑行星' : '添加行星';
  fName.value = data?.name || '';
  fDesc.value = data?.description || '';
  fTags.value = (data?.tags || []).join(',');
  fLink.value = data?.wechatLink || '';
  fCount.value = data?.groupCount ?? '';
  mask.style.display = 'flex';
}

function closeModal() { mask.style.display = 'none'; }

document.getElementById('add-planet-btn').addEventListener('click', () => openModal());
modalClose.addEventListener('click', closeModal);
modalCancel.addEventListener('click', closeModal);

modalSave.addEventListener('click', () => {
  const name = fName.value.trim();
  if (!name) return;
  const next = {
    id: editingId || (name + '-' + Math.random().toString(36).slice(2, 7)),
    name,
    description: fDesc.value.trim(),
    tags: fTags.value.split(',').map(s => s.trim()).filter(Boolean),
    wechatLink: fLink.value.trim(),
    groupCount: Math.max(0, Number(fCount.value || 0)),
    color: (editingId ? (planetsData.find(p => p.id === editingId).color) : 0x74a7ff),
    ring: (editingId ? (planetsData.find(p => p.id === editingId).ring) : false),
    radius: (editingId ? (planetsData.find(p => p.id === editingId).radius) : 3.2 + Math.random()*1.8),
    orbitRadius: (editingId ? (planetsData.find(p => p.id === editingId).orbitRadius) : 22 + Math.random()*36),
    orbitSpeed: (editingId ? (planetsData.find(p => p.id === editingId).orbitSpeed) : 0.002 + Math.random()*0.0015)
  };

  const existedIdx = planetsData.findIndex(p => p.id === next.id);
  if (existedIdx >= 0) planetsData[existedIdx] = { ...planetsData[existedIdx], ...next };
  else planetsData.push(next);

  savePlanetsToStorage(planetsData);
  rebuildPlanets();
  closeModal();
});

// 自适应
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});


