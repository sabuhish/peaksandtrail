import { api } from '@/lib/api';
import type { Tour, TourCreate, TourUpdate, TourWithParticipants } from '@/types';

export const toursService = {
  async getAll(skip: number = 0, limit: number = 100): Promise<Tour[]> {
    const response = await api.get<Tour[]>('/tours/', {
      params: { skip, limit }
    });
    return response.data;
  },

  async getById(id: string): Promise<TourWithParticipants> {
    const response = await api.get<TourWithParticipants>(`/tours/${id}`);
    return response.data;
  },

  async create(data: TourCreate): Promise<Tour> {
    const response = await api.post<Tour>('/tours/', data);
    return response.data;
  },

  async update(id: string, data: TourUpdate): Promise<Tour> {
    const response = await api.put<Tour>(`/tours/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/tours/${id}`);
  },

  async exportTour(id: string): Promise<ArrayBuffer> {
    const response = await api.get(`/tours/${id}/export`, {
      responseType: 'arraybuffer',
    });
    return response.data;
  },
};
