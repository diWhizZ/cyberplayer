// Minimalny stub przeglądarki do testów integracyjnych demorecorder.html.
// Udostępnia tylko te API, których realnie używa aplikacja — bez canvas 2D,
// Web Audio i MediaRecorder (nie są potrzebne do testu ładowania projektu).
import vm from "node:vm";
import { readAppScript } from "./helpers.mjs";

const noop = () => {};

function createContext2D() {
  const gradient = { addColorStop: noop };
  const base = {
    canvas: null,
    font: "",
    fillStyle: "",
    strokeStyle: "",
    lineWidth: 1,
    globalAlpha: 1,
    globalCompositeOperation: "source-over",
    shadowBlur: 0,
    shadowColor: "",
    textAlign: "left",
    textBaseline: "top",
    measureText: text => ({ width: String(text || "").length * 6 }),
    createRadialGradient: () => gradient,
    createLinearGradient: () => gradient
  };
  return new Proxy(base, {
    get(target, property) {
      if (property in target) return target[property];
      return noop;
    },
    set(target, property, value) {
      target[property] = value;
      return true;
    }
  });
}

function createElement(id) {
  const listeners = new Map();
  return {
    id,
    tagName: "DIV",
    style: { setProperty: noop, removeProperty: noop, display: "" },
    dataset: {},
    disabled: false,
    innerText: "",
    textContent: "",
    href: "",
    download: "",
    width: 0,
    height: 0,
    classList: {
      _set: new Set(),
      add(name) { this._set.add(name); },
      remove(name) { this._set.delete(name); },
      toggle(name, state) { if (state) this._set.add(name); else this._set.delete(name); },
      contains(name) { return this._set.has(name); }
    },
    addEventListener(type, handler) {
      if (!listeners.has(type)) listeners.set(type, []);
      listeners.get(type).push(handler);
    },
    dispatch(type, event) {
      for (const handler of listeners.get(type) || []) handler(event || {});
    },
    setAttribute: noop,
    getAttribute: () => null,
    removeAttribute: noop,
    appendChild: noop,
    remove: noop,
    click: noop,
    matches: () => false,
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 100, height: 10 }),
    getContext: () => createContext2D(),
    captureStream: () => ({ getVideoTracks: () => [], getAudioTracks: () => [] }),
    focus: noop
  };
}

export async function bootApp() {
  const script = await readAppScript();
  const elements = new Map();
  const blobs = [];

  const getElementById = id => {
    if (!elements.has(id)) elements.set(id, createElement(id));
    return elements.get(id);
  };

  class AudioStub {
    constructor() {
      this._listeners = new Map();
      this.src = "";
      this.currentTime = 0;
      this.duration = NaN;
      this.paused = true;
    }
    addEventListener(type, handler) {
      if (!this._listeners.has(type)) this._listeners.set(type, []);
      this._listeners.get(type).push(handler);
    }
    dispatch(type, event) {
      for (const handler of this._listeners.get(type) || []) handler(event || {});
    }
    load() {}
    play() { this.paused = false; return Promise.resolve(); }
    pause() { this.paused = true; }
    removeAttribute(name) { if (name === "src") this.src = ""; }
  }

  class ImageStub {
    constructor() {
      this.width = 0;
      this.height = 0;
      this.onload = null;
      this.onerror = null;
    }
    set src(value) {
      this._src = String(value);
      setImmediate(() => {
        if (/broken/i.test(this._src)) {
          if (this.onerror) this.onerror();
          return;
        }
        this.width = 64;
        this.height = 36;
        if (this.onload) this.onload();
      });
    }
    get src() { return this._src; }
  }

  class FileReaderStub {
    readAsText(file) {
      setImmediate(() => {
        this.result = file && typeof file.__text === "string" ? file.__text : "";
        if (this.onload) this.onload({ target: this });
      });
    }
  }

  class BlobStub {
    constructor(parts, options) {
      this.parts = parts || [];
      this.type = (options && options.type) || "";
      this.size = this.parts.reduce((sum, part) => sum + String(part).length, 0);
      blobs.push(this);
    }
    text() { return Promise.resolve(this.parts.join("")); }
  }

  const documentElement = createElement("html");
  const body = createElement("body");
  const sandbox = {
    console,
    setTimeout: (handler) => { if (typeof handler === "function") handler(); return 0; },
    clearTimeout: noop,
    setImmediate,
    Promise,
    Math,
    Date,
    URL: {
      // URL z nazwą pliku — dzięki temu ImageStub może zasymulować plik,
      // którego nie da się zdekodować (nazwa zawierająca "broken").
      createObjectURL: object => `blob:${object && object.name ? object.name : "stub"}`,
      revokeObjectURL: noop
    },
    Blob: BlobStub,
    Image: ImageStub,
    Audio: AudioStub,
    FileReader: FileReaderStub,
    MediaRecorder: undefined,
    Uint8Array,
    Float32Array,
    Number,
    String,
    Array,
    Object,
    JSON,
    Set,
    Map,
    document: {
      documentElement,
      body,
      getElementById,
      querySelectorAll: () => [],
      querySelector: () => null,
      createElement: tag => createElement(`created:${tag}`),
      addEventListener: noop,
      fullscreenElement: null
    },
    innerWidth: 1280,
    innerHeight: 720,
    addEventListener: noop,
    requestAnimationFrame: () => 0,
    cancelAnimationFrame: noop
  };
  sandbox.window = sandbox;
  sandbox.globalThis = sandbox;

  const probe = `
;globalThis.__app = {
  audio,
  loadProject,
  handleDroppedFiles,
  collectDroppedFiles,
  applySceneTimeline,
  exportProjectJson,
  rebuildScenePlan,
  getScenePlan: () => scenePlan,
  getManifestScenes: () => manifestScenes,
  getImageAssets: () => imageAssets,
  getIssues: () => projectIssues,
  getManifest: () => projectManifest,
  getMeta: () => projectMeta,
  getRender: () => renderSettings,
  getTheme: () => themeName,
  getEq: () => eqMode,
  getStatus: () => document.getElementById("status").textContent
};`;

  const context = vm.createContext(sandbox);
  new vm.Script(script + probe, { filename: "demorecorder.html" }).runInContext(context);

  return {
    app: sandbox.__app,
    blobs,
    status: () => getElementById("status").textContent,
    timeLabel: () => getElementById("time").textContent,
    sandbox
  };
}

// Obiekty utworzone wewnątrz kontekstu vm mają prototypy z innego realm'u,
// więc assert.deepEqual narzeka na "same structure but not reference-equal".
// Helpery przepisują wyniki na zwykłe tablice/obiekty z realm'u testowego.
export function toArray(value) {
  return Array.from(value);
}
export function planSummary(plan) {
  return Array.from(plan, scene => ({
    name: scene.name,
    start: scene.start,
    end: scene.end,
    duration: scene.duration,
    transition: scene.transition,
    hasImg: Boolean(scene.img)
  }));
}
export function missingSummary(missing) {
  return Array.from(missing, item => ({ role: item.role, name: item.name }));
}

export function projectFile(name, text) {
  return { name, type: "application/json", __text: text };
}
export function textFile(name, text) {
  return { name, type: "", __text: text };
}
export function imageFile(name) {
  return { name, type: "image/jpeg" };
}
export function audioFile(name) {
  return { name, type: "audio/mpeg" };
}
