/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type TemplateType = 'video' | 'carousel';

export interface TemplateElement {
  id: string;
  name: string;
  type: 'text' | 'image' | 'video' | 'shape' | 'logo' | 'button';
  x: number; // standard coordinate space: width is always 1080, height is 1920 (video) or 1080 (carousel)
  y: number;
  width: number;
  height: number;
  rotation: number; // degrees 0-360
  opacity: number; // 0-100
  content: string; // text content (with variables like {{title}}) or asset URL / color
  fontFamily: string;
  fontSize: number; // relative to 1080px base
  color: string;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  shadow: boolean;
  align: 'left' | 'center' | 'right';
  visible: boolean;
}

export interface CarouselSlide {
  id: string;
  elements: TemplateElement[];
}

export interface Template {
  id: string;
  name: string;
  type: TemplateType;
  // For video templates: we have a single slide/timeline.
  // For carousel templates: we can have up to 10 slides.
  slides: CarouselSlide[];
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  templateId: string;
  createdAt: string;
  lastGenerated?: string;
}

export interface HistoryItem {
  id: string;
  projectName: string;
  templateName: string;
  templateType: TemplateType;
  date: string;
  count: number;
  timeSpentSec: number;
  exportFormat: string;
  exportQuality: string;
  exportFps: number;
  outputPath: string;
  previewUrls: string[]; // generated image/thumbnail URLs
}

export interface ImportAsset {
  id: string;
  name: string;
  type: 'video' | 'image' | 'audio' | 'logo';
  url: string; // object URL or preloaded asset URL
  size?: string;
}

export interface ExportConfig {
  format: 'MP4' | 'PNG' | 'JPG';
  quality: '720p' | '1080p' | '1440p' | '4K';
  fps: 30 | 60;
}
