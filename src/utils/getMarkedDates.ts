import {streakRanges} from 'date-streaks';
import {ActivityEvent} from '../../types/models';

export const getColor = (str: string) => {
  var hash = 0;
  if (str.length === 0) return hash;
  for (var i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash;
  }
  var color = '#';
  for (var i = 0; i < 3; i++) {
    var value = (hash >> (i * 8)) & 255;
    color += ('00' + value.toString(16)).substr(-2);
  }
  return color;
};

export default function getMarkedDates(
  logs: Record<string, ActivityEvent>,
  pk: string[],
  activityId: string,
) {
  const allStreaks = pk.map((email) => {
    const data = Object.keys(logs)
      .filter((key) => key.indexOf(email + 'activity_' + activityId) > -1)
      .reduce((result, id) => {
        const instance = logs[id];
        const iso = instance.sk.replace('activity_' + activityId + '_', '');
        const date = iso.split('T')[0];
        const count = (result[date] || 0) + instance.duration;

        return {
          ...result,
          [date]: count,
        };
      }, {});

    const commits = Object.keys(data).map((d) => ({
      date: d,
      count: data[d] / 60,
    }));

    const streaks = streakRanges({dates: commits.map((d) => new Date(d.date))});

    return streaks.reduce((final, current) => {
      const {start, end} = current;
      const s = start.toISOString().split('T')[0];
      const e = end && end.toISOString().split('T')[0];
      if (!e) {
        return {
          ...final,
          [s]: {
            periods: [
              {
                color: getColor(email),
                textColor: 'white',
                startingDay: true,
                endingDay: true,
              },
            ],
          },
        };
      }

      const middleDates: any = Array.from({
        length: current.duration - 2,
      }).reduce((middle: any, _, index) => {
        const newDate = new Date(
          new Date(s).getTime() + 3600 * 24 * (index + 1) * 1000,
        )
          .toISOString()
          .split('T')[0];
        return {
          ...middle,
          [newDate]: {
            periods: [
              {
                color: getColor(email),
                textColor: 'white',
              },
            ],
          },
        };
      }, {});
      return {
        ...final,
        [s]: {
          periods: [
            {
              color: getColor(email),
              textColor: 'white',
              startingDay: true,
            },
          ],
        },
        [e]: {
          periods: [
            {
              color: getColor(email),
              textColor: 'white',
              endingDay: true,
            },
          ],
        },
        ...middleDates,
      };
    }, {});
  });

  let final = {};

  allStreaks.forEach((markedDates) => {
    Object.keys(markedDates).forEach((date) => {
      final[date] = final[date] || {periods: []};
      final[date].periods = [
        ...final[date].periods,
        ...markedDates[date].periods,
      ];
    });
  });

  return final;
}
