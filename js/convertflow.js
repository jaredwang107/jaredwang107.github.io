// Build EXT lookup
const EXT_MAP = {};
if (typeof CATEGORIES !== 'undefined') CATEGORIES.forEach(cat => {
  const exts = cat.formats.map(f => f.ext.toLowerCase());
  exts.forEach(e => { EXT_MAP[e] = exts; });
});

function getOutputFormats(ext) {
  const e = ext.toLowerCase();
  // Override for common formats to show most useful conversions first
  const overrides = {
    'pdf': ['DOCX','PNG','JPG','TXT','HTML','XLSX','PPTX','SVG'],
    'docx': ['PDF','TXT','HTML','ODT','RTF','PNG','JPG'],
    'doc': ['PDF','DOCX','TXT','HTML','ODT','RTF'],
    'xlsx': ['PDF','CSV','ODS','HTML','DOCX'],
    'xls': ['PDF','XLSX','CSV','ODS'],
    'pptx': ['PDF','PNG','JPG','ODP'],
    'ppt': ['PDF','PPTX','PNG','JPG'],
    'png': ['JPG','WEBP','PDF','GIF','BMP','TIFF','SVG','AVIF','ICO'],
    'jpg': ['PNG','WEBP','PDF','GIF','BMP','TIFF','SVG','AVIF','ICO'],
    'jpeg': ['PNG','WEBP','PDF','GIF','BMP','TIFF','SVG','AVIF','ICO'],
    'webp': ['PNG','JPG','PDF','GIF','BMP','TIFF','AVIF'],
    'gif': ['PNG','JPG','WEBP','MP4','APNG'],
    'mp4': ['MP3','AVI','MOV','MKV','WEBM','GIF','M4V','WAV','AAC','OGG'],
    'mov': ['MP4','MP3','AVI','MKV','WEBM','WAV','AAC'],
    'avi': ['MP4','MP3','MOV','MKV','WEBM','WAV'],
    'mkv': ['MP4','MP3','AVI','MOV','WEBM','WAV'],
    'webm': ['MP4','MP3','OGG','WAV'],
    'ts': ['MP4','MP3','MOV','MKV'],
    'mts': ['MP4','MP3','MOV','MKV'],
    'm2ts': ['MP4','MP3','MOV','MKV'],
    'flv': ['MP4','MP3','AVI','MOV'],
    'wmv': ['MP4','MP3','AVI','MOV'],
    'mp3': ['WAV','OGG','FLAC','AAC','M4A','OPUS'],
    'wav': ['MP3','OGG','FLAC','AAC','M4A','OPUS'],
    'ogg': ['MP3','WAV','FLAC','AAC'],
    'flac': ['MP3','WAV','OGG','AAC','M4A'],
    'aac': ['MP3','WAV','OGG','FLAC','M4A'],
    'm4a': ['MP3','WAV','OGG','FLAC','AAC'],
    'heic': ['JPG','PNG','WEBP'],
    'svg': ['PNG','JPG','PDF','WEBP'],
    'gif': ['MP4','WEBM','PNG','JPG','APNG'],
    '3gp': ['MP4','MP3','AVI'],
    'wmv': ['MP4','MP3','AVI','MOV'],
    'flv': ['MP4','MP3','AVI','MOV'],
    'vob': ['MP4','MP3','AVI'],
    'mpg': ['MP4','MP3','AVI'],
    'mpeg': ['MP4','MP3','AVI'],
    'wma': ['MP3','WAV','OGG','AAC'],
    'aiff': ['MP3','WAV','OGG','FLAC'],
    'opus': ['MP3','WAV','OGG','AAC'],
  };
  if (overrides[e]) return overrides[e];
  const exts = EXT_MAP[e];
  if (exts) return exts.filter(x => x !== e).slice(0, 10).map(x => x.toUpperCase());
  return ['PDF','DOCX','TXT','PNG','JPG','MP4','MP3'];
}

const CAT_COLORS = {
  image: '#0891b2', video: '#dc2626', audio: '#7c3aed', document: '#059669',
  spreadsheet: '#0d9488', presentation: '#d97706', ebook: '#9333ea', archive: '#b45309',
  '3d': '#6366f1', cad: '#0e7490', font: '#be185d', database: '#15803d',
  code: '#2563eb', email: '#c026d3', subtitle: '#0284c7', gis: '#16a34a',
  data: '#1d4ed8', misc: '#6b7280'
};

function getCatColor(ext) {
  for (const cat of CATEGORIES) {
    if (cat.formats.some(f => f.ext.toLowerCase() === ext.toLowerCase())) return CAT_COLORS[cat.id] || '#6b7280';
  }
  return '#6b7280';
}

function formatBytes(b) {
  if (b < 1024) return b + ' B';
  if (b < 1048576) return (b/1024).toFixed(1) + ' KB';
  if (b < 1073741824) return (b/1048576).toFixed(1) + ' MB';
  return (b/1073741824).toFixed(2) + ' GB';
}

let files = [], isPro = false;

const MAX_BYTES = 2 * 1024 * 1024 * 1024;
const MAX_FREE  = 500 * 1024 * 1024;

function handleFiles(incoming) {
  Array.from(incoming).forEach(f => {
    if (f.size > MAX_BYTES) { showStatus(`"${f.name}" exceeds the 2 GB limit.`, 'error'); return; }
    files.push(f);
  });
  renderFileList();
}

function renderFileList() {
  const list = document.getElementById('fileList');
  const btn  = document.getElementById('convertBtn');
  const lim  = document.getElementById('limitNote');
  list.innerHTML = '';
  let showLimit = false;
  files.forEach((f, i) => {
    const ext = (f.name.split('.').pop() || 'bin');
    const fmts = getOutputFormats(ext);
    const tooBig = !isPro && f.size > MAX_FREE;
    if (tooBig) showLimit = true;
    const color = tooBig ? 'var(--danger)' : getCatColor(ext);
    const item = document.createElement('div');
    item.className = 'file-item';
    item.innerHTML = `
      <div class="file-icon-wrap" style="flex-shrink:0">
        <svg width="44" height="52" viewBox="0 0 44 52" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Body -->
          <rect x="0" y="0" width="44" height="52" rx="6" fill="#1e1e2e"/>
          <!-- Colored top band -->
          <rect x="0" y="0" width="44" height="22" rx="6" fill="${color}" opacity="0.25"/>
          <rect x="0" y="16" width="44" height="6" fill="${color}" opacity="0.25"/>
          <!-- Folded corner -->
          <path d="M30 0 L44 14 L30 14 Z" fill="${color}" opacity="0.5"/>
          <!-- Border -->
          <rect x="0.75" y="0.75" width="42.5" height="50.5" rx="5.25" stroke="${color}" stroke-opacity="0.4" stroke-width="1.5" fill="none"/>
          <!-- Extension label -->
          <text x="22" y="42" text-anchor="middle" font-family="'DM Mono',monospace" font-weight="700" font-size="${ext.length > 4 ? '7' : ext.length > 3 ? '8.5' : '10'}" fill="${color}" letter-spacing="0.5">.${ext.toUpperCase().slice(0,5)}</text>
        </svg>
      </div>
      <div class="file-info">
        <div class="file-name" title="${f.name}">${f.name}</div>
        <div class="file-size">${formatBytes(f.size)}${tooBig ? ' · <span style="color:var(--danger)">Exceeds free limit</span>' : ''}</div>
        <div class="progress-bar-wrap" id="pw-${i}"><div class="progress-bar-fill" id="pf-${i}"></div></div>
      </div>
      <select class="format-select">${fmts.map(fmt=>`<option${window._pendingOutputFmt && fmt.toLowerCase()===window._pendingOutputFmt ? ' selected' : ''}>${fmt}</option>`).join('')}</select>
      <button class="remove-btn" onclick="removeFile(${i})">×</button>`;
    list.appendChild(item);
  });
  btn.classList.toggle('visible', files.length > 0);
  if (lim) lim.style.display = showLimit ? 'flex' : 'none';
  clearStatus();
  // Clear pending format after applying it
  window._pendingOutputFmt = null;
}

// ── Read ?to= URL param on page load ─────────────────────────
(function() {
  const params = new URLSearchParams(window.location.search);
  const toFmt = params.get('to');
  if (!toFmt) return;

  // Store as pending output format - normalize aliases
  const fmtAliases = { 'jpeg':'jpg', 'tiff':'tif', 'mpeg':'mpg', 'htm':'html' };
  const normalizedFmt = fmtAliases[toFmt.toLowerCase()] || toFmt.toLowerCase();
  window._pendingOutputFmt = normalizedFmt;

  // Scroll to the drop zone
  const dz = document.getElementById('dropZone');
  if (dz) {
    setTimeout(() => {
      dz.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Show hint
      const hint = dz.querySelector('.drop-sub');
      if (hint) {
        if (!hint._origHTML) hint._origHTML = hint.innerHTML;
        hint.innerHTML = `Drop your file here — it will be converted to <span>.${normalizedFmt.toUpperCase()}</span>`;
        clearTimeout(hint._hintTimer);
        hint._hintTimer = setTimeout(() => { hint.innerHTML = hint._origHTML; }, 8000);
      }
      // Highlight the drop zone
      dz.style.borderColor = 'var(--accent)';
      dz.style.background = 'rgba(0,229,255,0.04)';
      setTimeout(() => {
        dz.style.borderColor = '';
        dz.style.background = '';
      }, 3000);
    }, 400);
  }

  // Clean the URL (safe - won't error in sandboxed iframes)
  try { history.replaceState({}, '', window.location.pathname); } catch(e) {}
})();

function removeFile(i) { files.splice(i, 1); renderFileList(); }

// ── CONVERTAPI SECRET — replace with your own from convertapi.com ──
const CONVERTAPI_SECRET = null; // Set via API_SECRET inside cloudConvert()

function startConvert() {
  if (!files.length) return;
  clearStatus();
  const btn = document.getElementById('convertBtn');
  btn.disabled = true; btn.textContent = 'Converting...';
  let idx = 0;
  function processNext() {
    if (idx >= files.length) { finishConvert(); return; }
    const i = idx++;
    const f = files[i];
    const pw = document.getElementById(`pw-${i}`);
    const pf = document.getElementById(`pf-${i}`);
    const sel = document.querySelectorAll('.format-select')[i];
    const targetFmt = sel ? sel.value.toLowerCase() : 'pdf';
    if (pw) pw.style.display = 'block';
    const setProgress = p => { if (pf) pf.style.width = p + '%'; };

    setProgress(10);
    convertFile(f, targetFmt, setProgress)
      .then(({ blob, filename }) => {
        setProgress(100);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = filename;
        document.body.appendChild(a); a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 3000);
        setTimeout(processNext, 400);
      })
      .catch(err => {
        console.error(err);
        if (pw) pw.style.display = 'none';
        let errMsg = err.message;
        if (errMsg === 'Failed to fetch' || errMsg.toLowerCase().includes('failed to fetch')) {
          errMsg = 'Network blocked — deploy to Cloudflare to use conversions. The API cannot be reached from the Claude preview sandbox.';
        }
        showStatus(`⚠ "${f.name}": ${errMsg}`, 'error');
        btn.disabled = false; btn.textContent = 'Convert All Files';
      });
  }
  processNext();
}

async function convertFile(file, targetFmt, setProgress) {
  const srcExt   = file.name.split('.').pop().toLowerCase();
  const baseName = file.name.replace(/\.[^.]+$/, '');
  const filename = `${baseName}.${targetFmt}`;

  // ── In-browser fast path: image ↔ image via Canvas ──────────
  const imgFmts = ['jpg','jpeg','png','webp','gif','bmp','tiff','avif','ico'];
  if (imgFmts.includes(srcExt) && imgFmts.includes(targetFmt)) {
    return imgConvert(file, targetFmt, filename, setProgress);
  }
  // SVG → raster
  if (srcExt === 'svg' && imgFmts.includes(targetFmt)) {
    return imgConvert(file, targetFmt, filename, setProgress);
  }
  // raster → SVG (embed)
  if (imgFmts.includes(srcExt) && targetFmt === 'svg') {
    const dataUrl = await fileToDataURL(file);
    const w = await imgWidth(file), h = await imgHeight(file);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><image href="${dataUrl}" width="${w}" height="${h}"/></svg>`;
    return { blob: new Blob([svg], { type: 'image/svg+xml' }), filename };
  }
  // text ↔ text
  const txtFmts = ['txt','md','markdown','html','htm','csv','json','xml','yaml','yml','log','css','js','ts','py','java','c','cpp','rs','go','sh','php','rb'];
  if (txtFmts.includes(srcExt) && txtFmts.includes(targetFmt)) {
    return textConvert(file, srcExt, targetFmt, filename, setProgress);
  }
  // any → zip
  if (targetFmt === 'zip') {
    return zipConvert(file, baseName, setProgress);
  }
  // image → pdf
  if (imgFmts.includes(srcExt) && targetFmt === 'pdf') {
    return imgToPdf(file, srcExt, filename, setProgress);
  }
  // text → pdf
  if (txtFmts.includes(srcExt) && targetFmt === 'pdf') {
    return textToPdf(file, filename, setProgress);
  }

  // ── ConvertAPI for video, audio, and everything else ──
  return cloudConvert(file, targetFmt, filename, setProgress);
}

// ── FFmpeg.wasm in-browser video/audio conversion ───────────
let _ffmpeg = null;
async function getFFmpeg() {
  if (_ffmpeg) return _ffmpeg;
  // Load FFmpeg via script tag to avoid CORS worker issues
  await new Promise((resolve, reject) => {
    if (window.FFmpegWASM) return resolve();
    const s = document.createElement('script');
    s.src = 'https://unpkg.com/@ffmpeg/ffmpeg@0.11.6/dist/ffmpeg.min.js';
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });
  const { createFFmpeg, fetchFile } = window.FFmpegWASM || FFmpeg;
  const ff = createFFmpeg({
    log: false,
    corePath: 'https://unpkg.com/@ffmpeg/core@0.11.0/dist/ffmpeg-core.js',
  });
  await ff.load();
  _ffmpeg = { ff, fetchFile };
  return _ffmpeg;
}

async function ffmpegConvert(file, srcExt, targetFmt, filename, setProgress) {
  setProgress(5);
  let ffmpegObj;
  try {
    ffmpegObj = await getFFmpeg();
  } catch(e) {
    throw new Error('FFmpeg failed to load. Please try a different browser or check your connection.');
  }
  const { ff, fetchFile } = ffmpegObj;
  setProgress(20);
  ff.setProgress(({ ratio }) => setProgress(20 + Math.round(ratio * 70)));
  const inName = `input.${srcExt}`;
  const outName = `output.${targetFmt}`;
  ff.FS('writeFile', inName, await fetchFile(file));
  setProgress(30);

  const args = ['-i', inName, '-threads', '0'];
  if (['mp3','aac','ogg','flac','wav','m4a','opus'].includes(targetFmt)) {
    args.push('-vn'); // audio only - much faster
    if (targetFmt === 'mp3') args.push('-q:a', '4', '-ar', '44100');
    if (targetFmt === 'aac') args.push('-b:a', '128k');
    if (targetFmt === 'wav') args.push('-ar', '44100');
  }
  if (targetFmt === 'gif') {
    args.push('-vf', 'fps=10,scale=480:-1:flags=lanczos', '-loop', '0');
  }
  // Speed up video conversions
  if (['mp4','webm','mkv','mov','avi'].includes(targetFmt)) {
    args.push('-preset', 'ultrafast', '-crf', '28', '-movflags', '+faststart');
  }
  args.push(outName);

  await ff.run(...args);
  const data = ff.FS('readFile', outName);
  const mimeMap = {
    mp4:'video/mp4', webm:'video/webm', avi:'video/x-msvideo', mov:'video/quicktime',
    mkv:'video/x-matroska', mp3:'audio/mpeg', wav:'audio/wav', ogg:'audio/ogg',
    flac:'audio/flac', aac:'audio/aac', m4a:'audio/m4a', gif:'image/gif',
    opus:'audio/opus', ts:'video/mp2t'
  };
  const mime = mimeMap[targetFmt] || 'application/octet-stream';
  setProgress(98);
  return { blob: new Blob([data.buffer], { type: mime }), filename };
}

// ── ConvertAPI ───────────────────────────────────────────────
async function cloudConvert(file, targetFmt, filename, setProgress) {
  // CloudConvert API - handles all formats: video, audio, documents, images
  const CC_KEY = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiY2ZkZGQzNDk0NGJkZTlmNTFhYWZiOTUzMzk2ZGViZjVlMWMxYjA5OTJmMDBlOGFjZTJmY2UzNzkyOWM1ODBmYWQ3NmFlMjJmY2VlMzA0ZDkiLCJpYXQiOjE3NzgxMTM3MjQuMTQ3OTcxLCJuYmYiOjE3NzgxMTM3MjQuMTQ3OTcyLCJleHAiOjQ5MzM3ODczMjQuMTQwMjgxLCJzdWIiOiI3NDU3MDAxMSIsInNjb3BlcyI6WyJ0YXNrLnJlYWQiLCJ0YXNrLndyaXRlIl19.dVHvT54OE-rnFl6_UlEJDJwgQpSYTvxmTiJIgerNClhWafvtLmZAb7sxgS6ry4aowSX5hcsY2bPy78K2hztWWhBYzp1riEbCqjRrcnHzI-wrdLJSBJtGuYtfgyr4x1q6eLUGScfsuH8B30Zu_l_n79xeTt2DHKybkP9hBXJ7HdZsxEcamwRaLxZLsL2BVK7fqfxJ6xiNZdnhDn5CnXlqrVUU1ieU2ax-UR_8aWPyn1Yi4pv2rgqG81DuQQQwYX0CdDPKCxFf0TCuJuBCo0rfHodwgY_n0H5fCKvsI0P0AV8DUbCXcRnzDTWVq0n1DAsFL7_ZeMMJ2pkgfPcmszrT87uGgsdHcoFdxeHXjsr_4J8H-UFKWyvUr5qO3Q0Ubr-2FElDJSIObaXLvGS1YUZ1uqTA_Ir6Xk3Dyk0SNawYwAcESXWygYRXiY4tPePbXpFqrBmDjyp6AJg26JDdaAWrvrERCLbdvsiHoGxkkVIKVkfmJh3eeIxjDOLDuUeyELi9F5uIe7vXYqznfUdqpPDCX2Dmf18axyI6Vpax78gnDigiXBreKBzXeKuYzeVDD3mqBzqDqAiToJyBAaddioSdcdXl5tQVDqNm4HE2vuY5WLyGZydfBz7P2VWIi6OMobvX2I-S3UZbLCc3ZavFYvfUsDhLP4VtR_UeXmIrjzRGlew';

  setProgress(10);

  // Step 1: Create conversion job
  let jobRes, job;
  try {
    jobRes = await fetch('https://api.cloudconvert.com/v2/jobs', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${CC_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tasks: {
          'upload-file':  { operation: 'import/upload' },
          'convert-file': { operation: 'convert', input: 'upload-file', output_format: targetFmt },
          'export-file':  { operation: 'export/url', input: 'convert-file' }
        }
      })
    });
    job = await jobRes.json();
  } catch(e) { throw new Error('CloudConvert connection failed: ' + e.message); }

  if (!jobRes.ok) {
    const msg = job?.message || job?.code || JSON.stringify(job).slice(0,200);
    throw new Error('CloudConvert job error: ' + msg);
  }

  const uploadTask = job.data.tasks.find(t => t.name === 'upload-file');
  if (!uploadTask?.result?.form) throw new Error('No upload URL from CloudConvert.');

  setProgress(20);

  // Step 2: Upload file to CloudConvert S3
  const uploadForm = new FormData();
  Object.entries(uploadTask.result.form.parameters).forEach(([k,v]) => uploadForm.append(k, v));
  uploadForm.append('file', file, file.name);
  const upRes = await fetch(uploadTask.result.form.url, { method: 'POST', body: uploadForm });
  if (!upRes.ok) throw new Error('Upload to CloudConvert failed: ' + upRes.status);

  setProgress(35);

  // Step 3: Poll for job completion
  const jobId = job.data.id;
  let result = null;
  for (let i = 0; i < 120; i++) {
    await new Promise(r => setTimeout(r, 3000));
    const pollRes = await fetch(`https://api.cloudconvert.com/v2/jobs/${jobId}`, {
      headers: { 'Authorization': `Bearer ${CC_KEY}` }
    });
    const pollData = await pollRes.json();
    const status = pollData.data?.status;
    setProgress(35 + Math.min(i * 1.5, 55));
    if (status === 'finished') { result = pollData.data; break; }
    if (status === 'error') {
      const errTask = pollData.data?.tasks?.find(t => t.status === 'error');
      throw new Error('Conversion failed: ' + (errTask?.message || 'Unknown error'));
    }
  }
  if (!result) throw new Error('Conversion timed out after 6 minutes.');

  setProgress(93);

  // Step 4: Download result
  const exportTask = result.tasks.find(t => t.name === 'export-file');
  const fileUrl = exportTask?.result?.files?.[0]?.url;
  if (!fileUrl) throw new Error('No download URL in CloudConvert response.');
  const dlRes = await fetch(fileUrl);
  if (!dlRes.ok) throw new Error('Download failed: ' + dlRes.status);
  const blob = await dlRes.blob();
  return { blob, filename };
}

async function imgConvert(file, targetFmt, filename, setProgress) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      const ctx = canvas.getContext('2d');
      if (['jpg','jpeg'].includes(targetFmt)) { ctx.fillStyle = '#fff'; ctx.fillRect(0,0,canvas.width,canvas.height); }
      ctx.drawImage(img, 0, 0);
      setProgress(75);
      const mime = targetFmt==='jpg'||targetFmt==='jpeg' ? 'image/jpeg' : targetFmt==='webp' ? 'image/webp' : 'image/png';
      canvas.toBlob(blob => {
        if (!blob) return reject(new Error('Canvas conversion failed'));
        setProgress(95); resolve({ blob, filename });
      }, mime, 0.93);
    };
    img.onerror = () => reject(new Error('Could not load image'));
    img.src = URL.createObjectURL(file);
  });
}

async function textConvert(file, srcExt, targetFmt, filename, setProgress) {
  let text = await file.text();
  setProgress(50);
  if (['txt','md','markdown'].includes(srcExt) && ['html','htm'].includes(targetFmt)) {
    text = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body{font-family:sans-serif;max-width:800px;margin:2rem auto;padding:0 1rem;line-height:1.7}</style></head><body>\n`
      + text.split('\n').map(l => {
          if (l.startsWith('### ')) return `<h3>${l.slice(4)}</h3>`;
          if (l.startsWith('## '))  return `<h2>${l.slice(3)}</h2>`;
          if (l.startsWith('# '))   return `<h1>${l.slice(2)}</h1>`;
          if (l.startsWith('- '))   return `<li>${l.slice(2)}</li>`;
          if (!l.trim())            return '<br>';
          return `<p>${l}</p>`;
        }).join('\n') + '\n</body></html>';
  } else if (['html','htm'].includes(srcExt) && targetFmt === 'txt') {
    text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi,'').replace(/<script[^>]*>[\s\S]*?<\/script>/gi,'').replace(/<[^>]+>/g,'').replace(/\n{3,}/g,'\n\n').trim();
  } else if (srcExt === 'json' && targetFmt === 'csv') {
    try {
      const arr = JSON.parse(text); const rows = Array.isArray(arr) ? arr : [arr];
      const keys = Object.keys(rows[0]||{});
      text = [keys.join(','), ...rows.map(r => keys.map(k => JSON.stringify(r[k]??'')).join(','))].join('\n');
    } catch(e) {}
  } else if (srcExt === 'csv' && targetFmt === 'json') {
    const rows = text.trim().split('\n').map(r => r.split(','));
    text = JSON.stringify(rows.slice(1).map(r => Object.fromEntries(rows[0].map((h,i) => [h.trim(), r[i]?.trim()]))), null, 2);
  }
  setProgress(92);
  return { blob: new Blob([text], { type: 'text/plain' }), filename };
}

async function zipConvert(file, baseName, setProgress) {
  await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js');
  const zip = new window.JSZip();
  zip.file(file.name, file);
  setProgress(60);
  const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } });
  setProgress(95);
  return { blob, filename: baseName + '.zip' };
}

async function imgToPdf(file, srcExt, filename, setProgress) {
  await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF({ orientation: img.width > img.height ? 'l' : 'p', unit: 'px', format: [img.width, img.height] });
      pdf.addImage(img, ['jpg','jpeg'].includes(srcExt) ? 'JPEG' : 'PNG', 0, 0, img.width, img.height);
      setProgress(92);
      resolve({ blob: pdf.output('blob'), filename });
    };
    img.onerror = () => reject(new Error('Could not load image'));
    img.src = URL.createObjectURL(file);
  });
}

async function textToPdf(file, filename, setProgress) {
  await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
  const text = await file.text();
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF();
  const lines = pdf.splitTextToSize(text, 180);
  let y = 15;
  lines.forEach(line => { if (y > 280) { pdf.addPage(); y = 15; } pdf.text(line, 15, y); y += 7; });
  setProgress(92);
  return { blob: pdf.output('blob'), filename };
}

function fileToDataURL(file) {
  return new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(file); });
}
function imgWidth(file)  { return new Promise(res => { const i = new Image(); i.onload = () => res(i.naturalWidth);  i.src = URL.createObjectURL(file); }); }
function imgHeight(file) { return new Promise(res => { const i = new Image(); i.onload = () => res(i.naturalHeight); i.src = URL.createObjectURL(file); }); }

const _loadedScripts = {};
function loadScript(src) {
  if (_loadedScripts[src]) return _loadedScripts[src];
  _loadedScripts[src] = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src; s.onload = resolve; s.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(s);
  });
  return _loadedScripts[src];
}

function finishConvert() {
  const btn = document.getElementById('convertBtn');
  btn.disabled = false; btn.textContent = 'Convert All Files';
  showStatus(`${files.length} file${files.length > 1 ? 's' : ''} converted — check your downloads.`, 'success');
  // Track stats
  const stats = JSON.parse(localStorage.getItem('cf_stats') || '{"conversions":0,"bytes":0,"formats":[]}');
  const history = JSON.parse(localStorage.getItem('cf_history') || '[]');
  const selects = document.querySelectorAll('.format-select');
  files.forEach((f, i) => {
    const ext = f.name.split('.').pop() || 'bin';
    const toFmt = selects[i] ? selects[i].value : 'PDF';
    stats.conversions++;
    stats.bytes = (stats.bytes || 0) + f.size;
    stats.formats = [...(stats.formats || []), ext.toUpperCase()];
    history.unshift({ from: ext.toUpperCase(), to: toFmt, name: f.name, color: getCatColor(ext), time: new Date().toLocaleTimeString('en-US', {hour:'2-digit', minute:'2-digit'}) });
  });
  localStorage.setItem('cf_stats', JSON.stringify(stats));
  localStorage.setItem('cf_history', JSON.stringify(history.slice(0,50)));
}

function showStatus(msg, type) { const el = document.getElementById('statusMsg'); if(el){ el.innerHTML = msg; el.className = `status-msg ${type}`; } }
function clearStatus() { const el = document.getElementById('statusMsg'); if(el) el.className = 'status-msg'; }

document.addEventListener('DOMContentLoaded', () => {
  const dropZone = document.getElementById('dropZone');
  const fileInput = document.getElementById('fileInput');
  if (!dropZone || !fileInput) return;
  ['dragenter','dragover','dragleave','drop'].forEach(ev => {
    dropZone.addEventListener(ev, e => { e.preventDefault(); e.stopPropagation(); });
  });
  ['dragenter','dragover'].forEach(ev => dropZone.addEventListener(ev, () => dropZone.classList.add('dragover')));
  ['dragleave','drop'].forEach(ev => dropZone.addEventListener(ev, () => dropZone.classList.remove('dragover')));
  dropZone.addEventListener('drop', e => handleFiles(e.dataTransfer.files));
  dropZone.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', () => handleFiles(fileInput.files));
});
