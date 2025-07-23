import { request } from '@/http/request';

/**
 * 上传
 */
export function fetchUpload(payload: { file: File; biz: string }) {
  const fd = new FormData();
  fd.append('file', payload.file);       // 字段名必须叫 file
  fd.append('biz', payload.biz);         // 你后端需要 biz 就附带

  // 不要手动写 Content‑Type，axios 会自动带 boundary
  return request.post<string>('/sys/upload', fd);
}
