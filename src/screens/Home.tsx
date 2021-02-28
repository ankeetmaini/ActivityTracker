import React, {useEffect, useState} from 'react';
import {Text, TouchableOpacity, View} from 'react-native';
import {StackNavigationProp} from '@react-navigation/stack';

import {StackParams} from '../index';
import defaultActivities from '../utils/default-activity-list';
import {useProfile} from '../store/UserStore';
import {User} from '../../types/models';
//@ts-ignore
import Animation from 'lottie-react-native';

import DeviceInfo from 'react-native-device-info';
import {Analytics} from 'aws-amplify';

type Props = {
  email: string;
  navigation: StackNavigationProp<StackParams, 'Home'>;
};

export default function Home(props: Props) {
  const [message, setMessage] = useState('');
  const profile = useProfile();

  useEffect(() => {
    if (props.email) {
      Analytics.updateEndpoint({
        userId: props.email,
      });
    }

    const bootstrap = async () => {
      const user = await profile.getUser(props.email);

      if (!('pk' in user) || !user.pk) {
        registerNewUser();
      }
    };
    bootstrap();
  }, []);

  const registerNewUser = async () => {
    try {
      setMessage('First time user, creating a profile...');
      const userPayload: User = {
        pk: props.email,
        sk: 'profile',
        proDate: 0,
        activities: {},
        deviceIds: [DeviceInfo.getUniqueId()],
      };

      await profile.setUser(userPayload);
      setMessage('Profile created!');
    } catch (error) {}
  };

  return (
    <View>
      <View
        style={{display: 'flex', flexDirection: 'row', alignSelf: 'flex-end'}}>
        <Text
          style={{
            display: 'flex',
            alignSelf: 'center',
            fontWeight: 'bold',
            marginRight: 10,
          }}>
          {props.email}
        </Text>
      </View>
      <Text style={{color: 'blue', fontSize: 30, textAlign: 'center'}}>
        {message}
      </Text>

      <View
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <View
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Text
            style={{
              fontWeight: 'bold',
              position: 'absolute',
              top: 135,
              zIndex: 10,
              fontSize: 18,
              left: 45,
              color: '#893a77',
            }}>
            Activity Board
          </Text>
          <Animation
            style={{
              height: 200,
              width: 200,
            }}
            source={require('../lottieJsons/activityboard.json')}
            autoPlay
          />
        </View>
        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'center',
            alignContent: 'center',
          }}>
          {defaultActivities.map(({id, name}) => (
            <View style={{margin: 4, padding: 8}} key={id}>
              <TouchableOpacity
                activeOpacity={0.8}
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: 50,
                  backgroundColor: 'white',
                  justifyContent: 'center',
                  display: 'flex',
                  elevation: 10,
                  shadowOpacity: 10,
                }}
                onPress={() => {
                  props.navigation.navigate('Activity', {
                    id: id,
                    name: name,
                  });
                }}>
                <Text
                  style={{
                    color: '#893a77',
                    alignSelf: 'center',
                    fontWeight: 'bold',
                    fontSize: 16,
                  }}>
                  {name}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}
