import {
  Button,
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp} from '@react-navigation/native';
import ago from 's-ago';

import {StackParams} from '..';
import {useProfile} from '../store/UserStore';
import {useActivityLogs} from '../store/ActivityLogStore';
import {ScrollView, TouchableOpacity} from 'react-native-gesture-handler';
import activityJsonMapper from '../utils/activityJsonMapper';
import Animation from 'lottie-react-native';
import {Calendar, CalendarList, Agenda} from 'react-native-calendars';
const screenWidth = Dimensions.get('window').width;
import {summary, streakRanges} from 'date-streaks';
import {
  LineChart,
  BarChart,
  PieChart,
  ProgressChart,
  ContributionGraph,
  StackedBarChart,
} from 'react-native-chart-kit';
type Props = {
  navigation: StackNavigationProp<StackParams, 'Activity'>;
  route: RouteProp<StackParams, 'Activity'>;
};
const Activity = (props: Props) => {
  const activityId = props.route.params.id;
  const activityName = props.route.params.name;
  const user = useProfile();

  const [date, setDate] = useState('2021-02');

  const isFavAlready = user.activities[activityId];
  const activity = useActivityLogs();

  useEffect(() => {
    activity.getActivityLog(user.pk, `${activityId}_${date}`, activityId);
  }, []);

  const log = async () => {
    const date = new Date();

    activity.logActivity(activityId, {
      duration: 60,
      pk: user.pk,
      sk: 'activity_' + activityId + '_' + date.toISOString(),
    });
  };

  const json = activityJsonMapper[activityName];

  const data = Object.keys(activity.logs[activityId] || {}).reduce(
    (result, id) => {
      const instance = activity.logs[activityId][id];
      const iso = instance.sk.replace('activity_' + activityId + '_', '');
      const date = iso.split('T')[0];
      const count = (result[date] || 0) + instance.duration;
      return {
        ...result,
        [date]: count,
      };
    },
    {},
  );

  const commits = Object.keys(data).map((d) => ({
    date: d,
    count: data[d] / 60,
  }));

  const streaks = streakRanges({dates: commits.map((d) => new Date(d.date))});
  const map = streaks.reduce((final, current) => {
    const {start, end} = current;
    const s = start.toISOString().split('T')[0];
    const e = end && end.toISOString().split('T')[0];
    if (!end)
      return {
        ...final,
        [s]: {
          color: '#70d7c7',
          textColor: 'white',
          startingDay: true,
          endingDay: true,
        },
      };

    // end and start both are there
    return {
      ...final,
      [s]: {
        color: '#70d7c7',
        textColor: 'white',
        startingDay: true,
      },
      [e]: {
        color: '#70d7c7',
        textColor: 'white',
        endingDay: true,
      },
      ...Array.from({length: current.duration - 2}).reduce(
        (middle, current, index) => {
          console.log(s);
          const newDate = new Date(
            new Date(s).getTime() + 3600 * 24 * (index + 1) * 1000,
          )
            .toISOString()
            .split('T')[0];
          return {
            ...middle,
            [newDate]: {
              color: '#70d7c7',
              textColor: 'white',
            },
          };
        },
        {},
      ),
    };
  }, {});
  console.log(streaks, '========', map);

  // const streak = commits.reduce((commit, initialObj, index) => {
  //   if (index === 0) {
  //     // @ts-ignore
  //     initialObj[commit.date] = {startingDate: true, color: '#70d7c7'};
  //   } else if (index === commits.length - 1) {
  //     // @ts-ignore
  //     initialObj[commit.date] = {endingDate: true, color: '#70d7c7'};
  //   } else {
  //     // @ts-ignore
  //     initialObj[commit.date] = {color: '#70d7c7'}
  //   }
  //   return initialObj;
  // }, {} as any);
  // // console.log(
  //   'streakssss',
  //   streakRanges({
  //     dates: commits.map((d) => new Date(d.date)),
  //   }),
  // );
  // const streaks = streakRanges({
  //   dates: commits.map((d) => new Date(d.date)),
  // });

  // const streakMap = streaks.reduce((res, s) => {
  //   const isEndSame = !s.end;

  //   if (s.end && !res[s.end]) {
  //     res[s.end] = {endingDay: true};
  //   }
  //   if (s.start && !res[s.start]) {
  //     res[s.start] = {
  //       startingDay: true,
  //       ...(isEndSame ? {endingDay: true} : {}),
  //     };
  //   }

  //   return res;
  // }, {});

  // const marked = commits.reduce(
  //   (result, date) => ({
  //     ...result,
  //     [date.date]: {
  //       ...(streakMap[date.date] || {}),
  //       color: 'green',
  //       textColor: 'white',
  //     },
  //   }),
  //   {},
  // );

  // console.log(streak, '========');

  return (
    <View
      style={{
        backgroundColor: 'white',
        display: 'flex',
        width: '100%',
        height: '100%',
      }}>
      <View
        style={{
          backgroundColor: 'white',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
        }}>
        <Animation
          style={{
            height: 100,
          }}
          source={json}
          autoPlay
        />
      </View>
      {!isFavAlready ? (
        <TouchableOpacity
          onPress={() => user.markActivityFav(activityId)}
          activeOpacity={0.8}
          style={{
            backgroundColor: 'white',
            justifyContent: 'center',
            display: 'flex',
            elevation: 5,
            padding: 10,
            marginTop: 20,
            marginBottom: 10,
            marginLeft: 10,
            marginRight: 10,
          }}>
          <Text
            style={{
              color: '#893a77',
              fontWeight: '100',
              alignSelf: 'center',
            }}>
            Mark as Habit
          </Text>
        </TouchableOpacity>
      ) : (
        <View
          style={{
            backgroundColor: '#893a77',
            justifyContent: 'center',
            display: 'flex',
            padding: 10,
            marginTop: 20,
            marginBottom: 10,
            marginLeft: 10,
            marginRight: 10,
          }}>
          <Text
            style={{color: 'white', fontWeight: '100', alignSelf: 'center'}}>
            Marked in your HobbitHole
          </Text>

          <TouchableOpacity
            onPress={log}
            activeOpacity={0.8}
            style={{
              backgroundColor: 'white',
              justifyContent: 'center',
              display: 'flex',
              elevation: 5,
              padding: 10,
              marginTop: 20,
              marginBottom: 10,
              marginLeft: 10,
              marginRight: 10,
            }}>
            <Text
              style={{
                color: '#893a77',
                fontWeight: '100',
                alignSelf: 'center',
              }}>
              I did it!
            </Text>
          </TouchableOpacity>
        </View>
      )}
      <View
        style={{
          display: 'flex',
          margin: 10,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        {/* @ts-ignore */}
        {/* <ContributionGraph
          values={commits}
          endDate={new Date(Date.now() + 60 * 60 * 24 * 10 * 1000)}
          numDays={100}
          width={screenWidth - 20}
          height={220}
          style={{
            borderRadius: 4,
            elevation: 10,
          }}
          chartConfig={{
            backgroundGradientFrom: '#fff',
            backgroundGradientTo: '#fff',
            color: (opacity = 10) =>
              `rgba(90, 38, 78, ${isNaN(opacity) ? 1 : opacity})`,
          }}
        /> */}
      </View>
      {/* 
        {isFavAlready && <Button title="I did this - yo!" onPress={log} />}
        
        
      )}
      
      {isFavAlready && <Button title="I did this - yo!" onPress={log} />}

      
      */}

      <Calendar markedDates={map} markingType={'period'} />
    </View>
  );
};

export default Activity;
