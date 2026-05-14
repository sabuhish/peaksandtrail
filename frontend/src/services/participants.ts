import { api } from '@/lib/api';
import type { Participant, ParticipantCreate, ParticipantUpdate } from '@/types';

export const participantsService = {
  async getAll(tourId?: string, skip: number = 0, limit: number = 100): Promise<Participant[]> {
    const params: any = { skip, limit };
    if (tourId) params.tour_id = tourId;
    const response = await api.get<Participant[]>('/participants/', { params });
    return response.data;
  },

  async getById(id: string): Promise<Participant> {
    const response = await api.get<Participant>(`/participants/${id}`);
    return response.data;
  },

  async create(data: ParticipantCreate): Promise<Participant> {
    const payload = {
      ...data,
      birth_date: data.birth_date === '' ? null : data.birth_date,
      email: data.email === '' ? null : data.email,
    };
    const response = await api.post<Participant>('/participants/', payload);
    return response.data;
  },

  async update(id: string, data: ParticipantUpdate): Promise<Participant> {
    const payload = {
      ...data,
      ...(data.birth_date !== undefined && { birth_date: data.birth_date === '' ? null : data.birth_date }),
      ...(data.email !== undefined && { email: data.email === '' ? null : data.email }),
    };
    const response = await api.put<Participant>(`/participants/${id}`, payload);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/participants/${id}`);
  },

  async search(query: string): Promise<Participant[]> {
    const response = await api.get<Participant[]>('/participants/search', { params: { q: query } });
    return response.data;
  },
};
