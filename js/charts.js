/**
 * SIP-KOMPETENSI — BAPPEDA PROVINSI LAMPUNG
 * Vector SVG Chart Engine
 */

const Charts = {
  /**
   * Generates an SVG Competency Radar Chart
   * @param {string} containerId
   * @param {Array<{label: string, current: number, target: number, max: number}>} data
   */
  renderRadar(containerId, data) {
    const el = document.getElementById(containerId);
    if (!el) return;

    const width = 380;
    const height = 340;
    const cx = width / 2;
    const cy = height / 2;
    const radius = 110;
    const totalAxes = data.length;
    const angleSlice = (Math.PI * 2) / totalAxes;

    let svg = `<svg viewBox="0 0 ${width} ${height}" class="radar-chart-svg" style="width: 100%; height: auto; max-height: 330px; font-family: inherit;">`;

    // Draw concentric polygon rings (Levels 1 to 4)
    for (let level = 1; level <= 4; level++) {
      const r = (radius / 4) * level;
      let points = [];
      for (let i = 0; i < totalAxes; i++) {
        const angle = i * angleSlice - Math.PI / 2;
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);
        points.push(`${x},${y}`);
      }
      svg += `<polygon points="${points.join(' ')}" fill="none" stroke="var(--color-border)" stroke-dasharray="3,3" stroke-width="1"/>`;
      svg += `<text x="${cx + 4}" y="${cy - r + 3}" font-size="9" fill="var(--color-text-muted)">Lvl ${level}</text>`;
    }

    // Draw axis lines and labels
    for (let i = 0; i < totalAxes; i++) {
      const angle = i * angleSlice - Math.PI / 2;
      const x = cx + radius * Math.cos(angle);
      const y = cy + radius * Math.sin(angle);
      svg += `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="var(--color-border)" stroke-width="1.2"/>`;

      // Label positioning
      const lx = cx + (radius + 24) * Math.cos(angle);
      const ly = cy + (radius + 18) * Math.sin(angle);
      const textAnchor = Math.abs(Math.cos(angle)) < 0.2 ? 'middle' : Math.cos(angle) > 0 ? 'start' : 'end';
      svg += `<text x="${lx}" y="${ly}" font-size="10.5" font-weight="600" fill="var(--color-text-secondary)" text-anchor="${textAnchor}" dominant-baseline="middle">${data[i].label}</text>`;
    }

    // Target Polygon
    let targetPoints = [];
    for (let i = 0; i < totalAxes; i++) {
      const angle = i * angleSlice - Math.PI / 2;
      const r = (radius / 4) * data[i].target;
      targetPoints.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`);
    }
    svg += `<polygon points="${targetPoints.join(' ')}" fill="none" stroke="var(--color-primary)" stroke-width="2" stroke-dasharray="5,4" />`;

    // Current Polygon
    let currentPoints = [];
    for (let i = 0; i < totalAxes; i++) {
      const angle = i * angleSlice - Math.PI / 2;
      const r = (radius / 4) * data[i].current;
      currentPoints.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`);
    }
    svg += `<polygon points="${currentPoints.join(' ')}" fill="rgba(47, 128, 237, 0.24)" stroke="var(--color-accent)" stroke-width="2.5" />`;

    // Points on vertices
    for (let i = 0; i < totalAxes; i++) {
      const angle = i * angleSlice - Math.PI / 2;
      const r = (radius / 4) * data[i].current;
      const px = cx + r * Math.cos(angle);
      const py = cy + r * Math.sin(angle);
      svg += `<circle cx="${px}" cy="${py}" r="4" fill="var(--color-accent)" stroke="#FFFFFF" stroke-width="1.5" />`;
    }

    svg += `</svg>`;
    el.innerHTML = svg;
  },

  /**
   * Circular Progress Bar
   * @param {string} containerId
   * @param {number} percentage
   * @param {string} subtitle
   */
  renderCircularProgress(containerId, percentage, subtitle = 'Completed') {
    const el = document.getElementById(containerId);
    if (!el) return;

    const size = 160;
    const strokeWidth = 14;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    const svg = `
      <div style="position: relative; width: ${size}px; height: ${size}px; margin: 0 auto;">
        <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" style="transform: rotate(-90deg);">
          <circle cx="${size / 2}" cy="${size / 2}" r="${radius}" stroke="var(--color-border-subtle)" stroke-width="${strokeWidth}" fill="none" />
          <circle cx="${size / 2}" cy="${size / 2}" r="${radius}" stroke="var(--color-accent)" stroke-width="${strokeWidth}" stroke-linecap="round" fill="none"
            stroke-dasharray="${circumference}" stroke-dashoffset="${offset}" style="transition: stroke-dashoffset 800ms ease;" />
        </svg>
        <div style="position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; pointer-events: none;">
          <span style="font-size: 28px; font-weight: 800; color: var(--color-text-primary); line-height: 1;">${percentage}%</span>
          <span style="font-size: 11px; font-weight: 600; color: var(--color-text-muted); margin-top: 4px; text-transform: uppercase;">${subtitle}</span>
        </div>
      </div>
    `;
    el.innerHTML = svg;
  },

  /**
   * Donut Chart with Legend
   * @param {string} containerId
   * @param {Array<{label: string, value: number, color: string}>} slices
   */
  renderDonut(containerId, slices) {
    const el = document.getElementById(containerId);
    if (!el) return;

    const size = 160;
    const strokeWidth = 24;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const total = slices.reduce((acc, curr) => acc + curr.value, 0);

    let currentAngle = 0;
    let circleSegments = '';

    slices.forEach(slice => {
      const slicePercentage = slice.value / total;
      const strokeLength = slicePercentage * circumference;
      const spaceLength = circumference - strokeLength;
      const strokeOffset = -currentAngle * circumference;

      circleSegments += `
        <circle cx="${size / 2}" cy="${size / 2}" r="${radius}"
          stroke="${slice.color}" stroke-width="${strokeWidth}" fill="none"
          stroke-dasharray="${strokeLength} ${spaceLength}"
          stroke-dashoffset="${strokeOffset}"
          style="transition: stroke-dasharray 600ms ease;" />
      `;
      currentAngle += slicePercentage;
    });

    let legendHtml = '<div style="display: flex; flex-direction: column; gap: 8px; justify-content: center;">';
    slices.forEach(slice => {
      const pct = Math.round((slice.value / total) * 100);
      legendHtml += `
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 16px; font-size: 12px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="width: 10px; height: 10px; border-radius: 50%; background: ${slice.color};"></span>
            <span style="color: var(--color-text-secondary); font-weight: 500;">${slice.label}</span>
          </div>
          <span style="font-weight: 700; color: var(--color-text-primary);">${pct}% (${slice.value})</span>
        </div>
      `;
    });
    legendHtml += '</div>';

    el.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-around; gap: 20px; flex-wrap: wrap; padding: 10px 0;">
        <div style="position: relative; width: ${size}px; height: ${size}px; flex-shrink: 0;">
          <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" style="transform: rotate(-90deg);">
            ${circleSegments}
          </svg>
          <div style="position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; pointer-events: none;">
            <span style="font-size: 19px; font-weight: 800; color: var(--color-text-primary);">${total}</span>
            <span style="font-size: 10px; color: var(--color-text-muted); text-transform: uppercase;">Total</span>
          </div>
        </div>
        ${legendHtml}
      </div>
    `;
  },

  /**
   * Grouped Bar Chart (Rencana vs Realisasi)
   * @param {string} containerId
   * @param {Array<{label: string, rencana: number, realisasi: number}>} data
   */
  renderGroupedBar(containerId, data) {
    const el = document.getElementById(containerId);
    if (!el) return;

    const maxVal = Math.max(...data.map(d => Math.max(d.rencana, d.realisasi)), 10);
    const height = 180;

    let barsHtml = '';
    data.forEach(item => {
      const hRencana = Math.round((item.rencana / maxVal) * 100);
      const hRealisasi = Math.round((item.realisasi / maxVal) * 100);

      barsHtml += `
        <div style="flex: 1; display: flex; flex-direction: column; align-items: center; height: 100%; justify-content: flex-end; gap: 6px;">
          <div style="display: flex; align-items: flex-end; gap: 4px; height: 120px; width: 100%; justify-content: center;">
            <div style="width: 14px; height: ${hRencana}%; background: var(--color-primary); border-radius: 4px 4px 0 0; position: relative; transition: height 400ms ease;" title="Rencana: ${item.rencana}">
              <span style="position: absolute; top: -16px; left: 50%; transform: translateX(-50%); font-size: 9px; font-weight: 700; color: var(--color-primary);">${item.rencana}</span>
            </div>
            <div style="width: 14px; height: ${hRealisasi}%; background: var(--color-accent); border-radius: 4px 4px 0 0; position: relative; transition: height 400ms ease;" title="Realisasi: ${item.realisasi}">
              <span style="position: absolute; top: -16px; left: 50%; transform: translateX(-50%); font-size: 9px; font-weight: 700; color: var(--color-accent);">${item.realisasi}</span>
            </div>
          </div>
          <span style="font-size: 10.5px; font-weight: 600; color: var(--color-text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 60px; text-align: center;">${item.label}</span>
        </div>
      `;
    });

    el.innerHTML = `
      <div>
        <div style="display: flex; justify-content: flex-end; gap: 16px; margin-bottom: 14px; font-size: 11.5px;">
          <div style="display: flex; align-items: center; gap: 6px;"><span style="width: 10px; height: 10px; background: var(--color-primary); border-radius: 2px;"></span><span style="color: var(--color-text-secondary);">Rencana</span></div>
          <div style="display: flex; align-items: center; gap: 6px;"><span style="width: 10px; height: 10px; background: var(--color-accent); border-radius: 2px;"></span><span style="color: var(--color-text-secondary);">Realisasi</span></div>
        </div>
        <div style="display: flex; align-items: flex-end; height: ${height}px; border-bottom: 1px solid var(--color-border); padding-bottom: 8px; gap: 8px;">
          ${barsHtml}
        </div>
      </div>
    `;
  },

  /**
   * Trend Line Chart (Jan - Des)
   * @param {string} containerId
   * @param {Array<number>} points
   * @param {Array<string>} labels
   */
  renderTrendLine(containerId, points, labels) {
    const el = document.getElementById(containerId);
    if (!el) return;

    const width = 500;
    const height = 180;
    const padding = 30;
    const maxVal = Math.max(...points, 100);
    const minVal = 0;

    const stepX = (width - padding * 2) / (points.length - 1);
    const coords = points.map((val, idx) => {
      const x = padding + idx * stepX;
      const y = height - padding - ((val - minVal) / (maxVal - minVal)) * (height - padding * 2);
      return { x, y, val };
    });

    // Build smooth bezier path
    let pathD = `M ${coords[0].x} ${coords[0].y}`;
    for (let i = 1; i < coords.length; i++) {
      const prev = coords[i - 1];
      const curr = coords[i];
      const cp1x = prev.x + (curr.x - prev.x) / 2;
      const cp1y = prev.y;
      const cp2x = prev.x + (curr.x - prev.x) / 2;
      const cp2y = curr.y;
      pathD += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`;
    }

    const areaD = `${pathD} L ${coords[coords.length - 1].x} ${height - padding} L ${coords[0].x} ${height - padding} Z`;

    let dotsSvg = '';
    let labelsSvg = '';
    coords.forEach((c, idx) => {
      dotsSvg += `<circle cx="${c.x}" cy="${c.y}" r="4" fill="var(--color-accent)" stroke="#FFFFFF" stroke-width="2"/>`;
      if (idx % 2 === 0 || idx === points.length - 1) {
        labelsSvg += `<text x="${c.x}" y="${height - 10}" font-size="9.5" fill="var(--color-text-muted)" text-anchor="middle">${labels[idx]}</text>`;
      }
    });

    const svg = `
      <svg viewBox="0 0 ${width} ${height}" style="width: 100%; height: auto; font-family: inherit;">
        <defs>
          <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#2F80ED" stop-opacity="0.3"/>
            <stop offset="100%" stop-color="#2F80ED" stop-opacity="0.0"/>
          </linearGradient>
        </defs>
        <line x1="${padding}" y1="${height - padding}" x2="${width - padding}" y2="${height - padding}" stroke="var(--color-border)" stroke-width="1"/>
        <line x1="${padding}" y1="${padding}" x2="${width - padding}" y2="${padding}" stroke="var(--color-border-subtle)" stroke-dasharray="3,3" stroke-width="1"/>
        <path d="${areaD}" fill="url(#trendGrad)"/>
        <path d="${pathD}" fill="none" stroke="var(--color-accent)" stroke-width="2.5" stroke-linecap="round"/>
        ${dotsSvg}
        ${labelsSvg}
      </svg>
    `;
    el.innerHTML = svg;
  }
};
