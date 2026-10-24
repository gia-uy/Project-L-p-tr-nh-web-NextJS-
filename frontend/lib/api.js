export const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5020/api").replace(/\/$/, "");

export async function apiRequest(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...options.headers,
      },
    });
  } catch {
    throw new Error("Không thể kết nối máy chủ. Hãy kiểm tra Backend và NEXT_PUBLIC_API_URL.");
  }

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(body.error || "Yêu cầu không thành công");
    error.details = body.details || [];
    error.status = response.status;
    throw error;
  }
  return body;
}

export const jsonBody = (value) => JSON.stringify(value);
