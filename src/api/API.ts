
import { ActivityEvent, User } from '../../types/models';
import APICaller from './ApiCaller';

export const getUser = (email: string): Promise<User | {}> => APICaller.get(`/user/${email}`);
export const createUser = (user: User) => APICaller.put(`/user/${user.pk}`, user);
export const logActivity = (event: ActivityEvent) => APICaller.post('/log/activity', event);

