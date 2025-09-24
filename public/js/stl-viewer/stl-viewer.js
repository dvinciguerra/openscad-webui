import './three.min.js';
import './STLLoader.js';
import './OrbitControls.js';

class STLViewer extends HTMLElement {
  static get observedAttributes() {return ['model'];}

  constructor() {
    super();
    this.model = null;
    this._ready = false;
  }

  connectedCallback() {
    this.connected = true;

    const shadowRoot = this.attachShadow({ mode: 'open' });
    this._container = document.createElement('div');
    this._container.style.width = '100%';
    this._container.style.height = '100%';
    shadowRoot.appendChild(this._container);

    if (!this.hasAttribute('model')) {
      throw new Error('model attribute is required');
    }

    // three.js setup 1x
    const parentDimensions = this.parentElement.parentElement.getBoundingClientRect();

    const clientWidth = this._container.clientWidth || parentDimensions.width || '200';
    const clientHeight = this._container.clientHeight || parentDimensions.height || '400';

    this.camera = new THREE.PerspectiveCamera(70, clientWidth / clientHeight, 1, 1000);
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(clientWidth, clientHeight);
    this._container.appendChild(this.renderer.domElement);

    this.camera.aspect = clientWidth / clientHeight;
    this.camera.updateProjectionMatrix();

    window.addEventListener('resize', () => {
      this.renderer.setSize(this._container.clientWidth, this._container.clientHeight);
      this.camera.aspect = this._container.clientWidth / this._container.clientHeight;
      this.camera.updateProjectionMatrix();
    });

    this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableZoom = true;

    this.scene = new THREE.Scene();
    this.scene.add(new THREE.HemisphereLight(0xffffff, 1.5));

    // loop
    const animate = () => {
      this.controls.update();
      this.renderer.render(this.scene, this.camera);
      if (this.connected) requestAnimationFrame(animate);
    };
    animate();

    this._ready = true;

    // se já veio com atributo, carrega
    if (this.hasAttribute('model')) this._loadModel(this.getAttribute('model'));

    console.log(this.parentElement.parentElement.getBoundingClientRect());
  }

  attributeChangedCallback(name, oldVal, newVal) {
    if (name === 'model' && this._ready && newVal && newVal !== oldVal) {
      this._loadModel(newVal);
    }
  }

  disconnectedCallback() {
    this.connected = false;
  }

  _loadModel(url) {
    // remove mesh anterior, se houver
    if (this._mesh) { this.scene.remove(this._mesh); this._mesh.geometry.dispose(); this._mesh.material.dispose(); this._mesh = null; }

    new THREE.STLLoader().load(url, (geometry) => {
      const material = new THREE.MeshPhongMaterial({ color: 0x6A39FF, specular: 100, shininess: 100 });
      const mesh = new THREE.Mesh(geometry, material);
      this.scene.add(mesh);
      this._mesh = mesh;

      // centraliza e enquadra
      geometry.computeBoundingBox();
      const center = new THREE.Vector3();
      geometry.boundingBox.getCenter(center);
      geometry.translate(-center.x, -center.y, -center.z);

      const size = new THREE.Vector3();
      geometry.boundingBox.getSize(size);
      const largest = Math.max(size.x, size.y, size.z);
      this.camera.position.set(0, 0, largest * 1.5);
      this.controls.autoRotate = true;
      this.controls.autoRotateSpeed = 1;
    });
  }

  set model(url) { this.setAttribute('model', url); }
  get model() {return this.getAttribute('model');}
}

customElements.define('stl-viewer', STLViewer);