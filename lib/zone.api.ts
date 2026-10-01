import type { Zone } from "@/types/zone";

const getBaseUrl = () => {
  const url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
  const trimmed = url.trim().replace(/\/+$/, "");
  return trimmed.endsWith("/api") ? trimmed : `${trimmed}/api`;
};

const API_BASE_URL = getBaseUrl();

const createHeaders = (token: string) => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
});

export async function getZones(
  token: string,
  params: { search?: string; status?: string; page?: number; limit?: number } = {}
): Promise<{ data: Zone[]; pagination?: { total: number; page: number; limit: number; pages: number } }> {
  const query = new URLSearchParams();
  if (params.search) query.set("search", params.search);
  if (params.status && params.status !== "ALL") query.set("status", params.status);
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));

  const res = await fetch(`${API_BASE_URL}/zones?${query.toString()}`, {
    headers: createHeaders(token),
    cache: "no-store",
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Failed to fetch zones");
  }

  return { data: data.data || [], pagination: data.pagination };
}

export async function getZoneById(token: string, id: string): Promise<Zone> {
  const res = await fetch(`${API_BASE_URL}/zones/${id}`, {
    headers: createHeaders(token),
    cache: "no-store",
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Failed to fetch zone");
  }

  return data.data;
}

export async function createZone(token: string, payload: Partial<Zone>): Promise<Zone> {
  const res = await fetch(`${API_BASE_URL}/zones`, {
    method: "POST",
    headers: createHeaders(token),
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Failed to create zone");
  }

  return data.data;
}

export async function updateZone(token: string, id: string, payload: Partial<Zone>): Promise<Zone> {
  const res = await fetch(`${API_BASE_URL}/zones/${id}`, {
    method: "PUT",
    headers: createHeaders(token),
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Failed to update zone");
  }

  return data.data;
}

export async function deleteZone(token: string, id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/zones/${id}`, {
    method: "DELETE",
    headers: createHeaders(token),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Failed to delete zone");
  }
}
