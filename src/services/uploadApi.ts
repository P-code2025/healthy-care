import { http } from "./http";

export const uploadImage = async (base64: string): Promise<string> => {
  const res = await http.request<{ url: string }>('/api/upload-image', {
    method: 'POST',
    json: { image: base64 },
  });
  return res.url; 
};