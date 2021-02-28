import AsyncStorage from '@react-native-community/async-storage';
import create from 'zustand';
import {persist} from 'zustand/middleware';
import {ActivityEvent} from '../../types/models';
import {fetchActivityLog, logActivity} from '../api/API';

interface ActivityState {
  logs: Record<string, ActivityEvent>;
  getActivityLog: (pk: string, sk: string, activityId: string) => void;
  logActivity: (pk: string, id: string, event: ActivityEvent) => void;
}

export const useActivityLogs = create<ActivityState>(
  persist<ActivityState>(
    (set) => ({
      logs: {},

      async logActivity(pk, id, event) {
        await logActivity(event);
        set((state) => ({
          ...state,
          logs: {
            ...state.logs,
            [pk + event.sk]: event,
          },
        }));
      },

      async getActivityLog(pk, sk, activityId) {
        const items = await fetchActivityLog({pk, sk});

        const map = items.data.Items.reduce((result, current) => {
          return {
            ...result,
            [pk + current.sk]: current,
          };
        }, {});

        set((state) => {
          return {
            ...state,
            logs: {
              ...state.logs,
              ...map,
            },
          };
        });
      },
    }),
    {
      name: 'activity-store',
      getStorage: () => AsyncStorage,
    },
  ),
);
