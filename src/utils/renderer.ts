/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { TemplateElement } from '../types';

/**
 * Helper to render an HTMLVideoElement on Canvas keeping its aspect ratio (object-fit: cover) with zoom and offset panning.
 */
export function drawVideoCover(
  ctx: CanvasRenderingContext2D,
  video: HTMLVideoElement,
  x: number,
  y: number,
  w: number,
  h: number,
  zoom: number = 1.0,
  offsetX: number = 0,
  offsetY: number = 0
) {
  try {
    const videoWidth = video.videoWidth;
    const videoHeight = video.videoHeight;
    if (videoWidth && videoHeight) {
      ctx.save();
      
      // 1. Fill black background first to avoid transparent leaks
      ctx.fillStyle = '#000000';
      ctx.fillRect(x, y, w, h);

      // 2. Clip to bounding box to prevent overlapping
      ctx.beginPath();
      ctx.rect(x, y, w, h);
      ctx.clip();

      // 3. Calculate "contain" dimensions for the original video
      const scaleContain = Math.min(w / videoWidth, h / videoHeight);
      const containW = videoWidth * scaleContain;
      const containH = videoHeight * scaleContain;

      // 4. Apply zoom to the contain dimensions (allows < 1.0 or > 1.0 zoom)
      const dw = containW * zoom;
      const dh = containH * zoom;

      // 5. Center inside target box and apply translation offset
      const dx = x + (w - dw) / 2 + offsetX;
      const dy = y + (h - dh) / 2 + offsetY;

      // 6. Draw video using standard contain bounds
      ctx.drawImage(video, 0, 0, videoWidth, videoHeight, dx, dy, dw, dh);
      ctx.restore();
    } else {
      ctx.fillStyle = '#000000';
      ctx.fillRect(x, y, w, h);
      ctx.drawImage(video, x, y, w, h);
    }
  } catch (err) {
    try {
      ctx.fillStyle = '#000000';
      ctx.fillRect(x, y, w, h);
      ctx.drawImage(video, x, y, w, h);
    } catch (e) {}
  }
}

/**
 * Programmatically renders a set of template elements onto an HTML5 Canvas at full 1080px scale.
 * Supports exporting real high-resolution images!
 */
export async function renderElementsToCanvas(
  ctx: CanvasRenderingContext2D,
  elements: TemplateElement[],
  width: number,
  height: number,
  variableValues: Record<string, string> = {},
  videoElement?: HTMLVideoElement,
  transparent: boolean = false
): Promise<void> {
  // Clear canvas
  if (transparent) {
    ctx.clearRect(0, 0, width, height);
  } else {
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);
  }

  // If we have a videoElement, and no elements of type 'video' are visible,
  // draw it as a full-screen background underlay preserving aspect ratio
  const hasVisibleVideoElement = elements.some(el => el.type === 'video' && el.visible);
  if (videoElement && !hasVisibleVideoElement) {
    drawVideoCover(ctx, videoElement, 0, 0, width, height);
  }

  // Helper to replace text variables
  const replaceVariables = (text: string) => {
    let result = text;
    Object.entries(variableValues).forEach(([key, val]) => {
      // replace all instances of {{key}}
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'gi');
      result = result.replace(regex, val);
    });
    return result;
  };

  // Helper to load image asynchronously with CORS support
  const loadImage = (url: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      // If it is a local data URL, load it directly without CORS or cache busters
      if (url.startsWith('data:')) {
        img.src = url;
        img.onload = () => resolve(img);
        img.onerror = (e) => reject(e);
        return;
      }

      img.crossOrigin = 'anonymous'; // request CORS access

      // Append unique cache buster query parameter to force clean CORS request
      // and prevent the browser from using a cached non-CORS version of the image
      let corsUrl = url;
      try {
        if (url.startsWith('http://') || url.startsWith('https://')) {
          const urlObj = new URL(url);
          urlObj.searchParams.set('cors_bypass', Date.now().toString() + '_' + Math.random().toString(36).substr(2, 5));
          corsUrl = urlObj.toString();
        }
      } catch (e) {
        corsUrl = url + (url.includes('?') ? '&' : '?') + 'cors_bypass=' + Date.now();
      }

      img.src = corsUrl;
      img.onload = () => resolve(img);
      img.onerror = () => {
        // Fallback to a safe base64 pixel image on load failure
        // A local base64 data-url never fails and is 100% guaranteed not to taint the canvas
        const fallback = new Image();
        fallback.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
        fallback.onload = () => resolve(fallback);
        fallback.onerror = (err) => reject(err);
      };
    });
  };

  // Process elements in order of layers (layer index)
  for (const el of elements) {
    if (!el.visible) continue;

    ctx.save();

    // Setup global element transparency
    ctx.globalAlpha = el.opacity / 100;

    // Apply rotation around the center of the element
    const centerX = el.x + el.width / 2;
    const centerY = el.y + el.height / 2;
    ctx.translate(centerX, centerY);
    ctx.rotate((el.rotation * Math.PI) / 180);
    ctx.translate(-centerX, -centerY);

    try {
      if (el.type === 'shape') {
        ctx.fillStyle = el.content.startsWith('#') || el.content.startsWith('rgb') ? el.content : '#0c8ce9';
        
        // Draw shape with borders and rounded corners if specified
        const radius = el.borderRadius || 0;
        if (radius > 0) {
          ctx.beginPath();
          ctx.roundRect(el.x, el.y, el.width, el.height, radius);
          ctx.fill();
          if (el.borderWidth && el.borderColor) {
            ctx.lineWidth = el.borderWidth;
            ctx.strokeStyle = el.borderColor;
            ctx.stroke();
          }
        } else {
          ctx.fillRect(el.x, el.y, el.width, el.height);
          if (el.borderWidth && el.borderColor) {
            ctx.lineWidth = el.borderWidth;
            ctx.strokeStyle = el.borderColor;
            ctx.strokeRect(el.x, el.y, el.width, el.height);
          }
        }
      }

      else if (el.type === 'image' || el.type === 'logo' || el.type === 'video') {
        const radius = el.type === 'logo' ? (el.borderRadius || el.width / 2) : (el.borderRadius || 0);

        if (radius > 0) {
          ctx.beginPath();
          ctx.roundRect(el.x, el.y, el.width, el.height, radius);
          ctx.clip();
        }

        if (el.type === 'video' && videoElement) {
          // Render current frame of live video player preserving its original aspect ratio
          drawVideoCover(ctx, videoElement, el.x, el.y, el.width, el.height);
        } else {
          // Note: For videos, we render a static frame of the placeholder or poster image if no video element is active
          const imgUrl = el.type === 'video' 
            ? 'https://images.unsplash.com/photo-1536240478700-b869070f9279?w=800' // premium frame placeholder
            : el.content;

          const img = await loadImage(imgUrl);
          ctx.drawImage(img, el.x, el.y, el.width, el.height);
        }
      }

      else if (el.type === 'button') {
        const bg = el.backgroundColor || '#0c8ce9';
        const txtColor = el.color || '#ffffff';
        const radius = el.borderRadius || 12;

        // Draw button shape
        ctx.fillStyle = bg;
        ctx.beginPath();
        ctx.roundRect(el.x, el.y, el.width, el.height, radius);
        ctx.fill();

        if (el.shadow) {
          ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
          ctx.shadowBlur = 15;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 4;
        }

        // Draw button text centered
        const buttonText = replaceVariables(el.content);
        ctx.fillStyle = txtColor;
        ctx.shadowColor = 'transparent'; // reset shadow for text

        // Calculate font size
        ctx.font = `600 ${el.fontSize}px 'Inter', sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(buttonText, el.x + el.width / 2, el.y + el.height / 2);
      }

      else if (el.type === 'text') {
        const textValue = replaceVariables(el.content);
        ctx.fillStyle = el.color;

        if (el.shadow) {
          ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
          ctx.shadowBlur = 10;
          ctx.shadowOffsetX = 2;
          ctx.shadowOffsetY = 2;
        }

        const fontFam = el.fontFamily === 'Space Grotesk' ? '"Space Grotesk", sans-serif' : el.fontFamily === 'Fira Code' ? '"Fira Code", monospace' : '"Inter", sans-serif';
        ctx.font = `500 ${el.fontSize}px ${fontFam}`;
        ctx.textAlign = el.align;
        ctx.textBaseline = 'top';

        // Word wrapping
        const words = textValue.split(' ');
        let line = '';
        const lines: string[] = [];
        const maxWidth = el.width;

        for (let n = 0; n < words.length; n++) {
          const testLine = line + words[n] + ' ';
          const metrics = ctx.measureText(testLine);
          const testWidth = metrics.width;
          if (testWidth > maxWidth && n > 0) {
            lines.push(line);
            line = words[n] + ' ';
          } else {
            line = testLine;
          }
        }
        lines.push(line);

        // Draw wrapped lines
        let drawX = el.x;
        if (el.align === 'center') {
          drawX = el.x + el.width / 2;
        } else if (el.align === 'right') {
          drawX = el.x + el.width;
        }

        const lineHeight = el.fontSize * 1.25;
        lines.forEach((l, idx) => {
          ctx.fillText(l.trim(), drawX, el.y + idx * lineHeight);
        });
      }
    } catch (err) {
      console.error('Error rendering element', el.name, err);
    }

    ctx.restore();
  }
}

/**
 * Triggers a file download in the user's browser.
 */
export function downloadDataUrl(dataUrl: string, fileName: string) {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
