import {Button, Share, Text, ToastAndroid, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp} from '@react-navigation/native';

import {StackParams} from '..';
import {useProfile} from '../store/UserStore';
import {useActivityLogs} from '../store/ActivityLogStore';
import {ScrollView, TouchableOpacity} from 'react-native-gesture-handler';
import activityJsonMapper from '../utils/activityJsonMapper';
import Animation from 'lottie-react-native';
import {Calendar} from 'react-native-calendars';
import CheckBox from '@react-native-community/checkbox';

import {streakRanges} from 'date-streaks';

const marginProps = {
  marginTop: 10,
  marginBottom: 10,
  marginLeft: 10,
  marginRight: 10,
};

type Props = {
  navigation: StackNavigationProp<StackParams, 'Activity'>;
  route: RouteProp<StackParams, 'Activity'>;
};
const Activity = (props: Props) => {
  const activityId = props.route.params.id;
  const activityName = props.route.params.name;
  const user = useProfile();

  const [date, setDate] = useState('2021-');
  const [mark, setMark] = useState(false);
  const isFavAlready = user.activities[activityId];
  const activity = useActivityLogs();

  useEffect(() => {
    activity.getActivityLog(user.pk, `${activityId}_${date}`, activityId);
  }, []);

  useEffect(() => {
    if (mark) {
      log().then(() => {
        ToastAndroid.show(
          `Yay! ${activityName} marked for today!`,
          ToastAndroid.SHORT,
        );
      });
    }
  }, [mark]);

  const log = async () => {
    const date = new Date();

    activity.logActivity(activityId, {
      duration: 60,
      pk: user.pk,
      sk: 'activity_' + activityId + '_' + date.toISOString(),
    });
  };

  const onShare = async () => {
    await Share.share({
      message: 'activitytracker://share' + activityId + '/' + user.pk,
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
    if (!end) {
      return {
        ...final,
        [s]: {
          color: '#70d7c7',
          textColor: 'white',
          startingDay: true,
          endingDay: true,
        },
      };
    }

    const middleDates: {} = Array.from({length: current.duration - 2}).reduce(
      (middle, _, index) => {
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
    );
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
      ...middleDates,
    };
  }, {});

  return (
    <ScrollView>
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
              ...marginProps,
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
          <>
            <View
              style={{
                backgroundColor: '#893a77',
                justifyContent: 'center',
                display: 'flex',
                padding: 10,
                ...marginProps,
              }}>
              <Text
                style={{
                  color: 'white',
                  fontWeight: '100',
                  alignSelf: 'center',
                }}>
                Marked in your HobbitHole
              </Text>
            </View>
            <View
              style={{display: 'flex', flexDirection: 'row', ...marginProps}}>
              <View>
                <Text>{new Date().toDateString()}</Text>
              </View>
              <View style={{flex: 1}} />
              <View>
                <CheckBox
                  value={mark}
                  onValueChange={(value) => setMark(value)}
                  hideBox={true}
                  boxType={'circle'}
                  onCheckColor={'#6F763F'}
                  onFillColor={'#4DABEC'}
                  onTintColor={'#F4DCF8'}
                  animationDuration={2}
                  style={{width: 40, height: 40}}
                  onAnimationType={'bounce'}
                  // offAnimationType={''}
                />
              </View>
            </View>
          </>
        )}

        <View
          style={{
            display: 'flex',
            margin: 10,
            justifyContent: 'center',
            alignItems: 'center',
          }}></View>
        <Calendar markedDates={map} markingType={'period'} />

        <Button onPress={onShare} title="Do with Friends!" />
      </View>
    </ScrollView>
  );
};

export default Activity;
