import React from 'react';
import {Linking} from 'react-native';
import Amplify from 'aws-amplify';

import InAppBrowser from 'react-native-inappbrowser-reborn';
import {withOAuth} from 'aws-amplify-react-native';

import config from './aws-exports';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import Home from './screens/Home';
import Splash from './screens/Splash';
import Activity from './screens/Activity';

async function urlOpener(url: string, redirectUrl: string) {
  await InAppBrowser.isAvailable();
  // @ts-ignore
  const {type, url: newUrl} = await InAppBrowser.openAuth(url, redirectUrl, {
    showTitle: false,
    enableUrlBarHiding: true,
    enableDefaultShare: false,
    ephemeralWebSession: false,
  });

  if (type === 'success') {
    Linking.openURL(newUrl);
  }
}

Amplify.configure({
  ...config,
  oauth: {
    ...config.oauth,
    urlOpener,
  },
  PushNotification: {
    requestIOSPermissions: false,
  },
});

export type StackParams = {
  Home: {activity?: string; userId?: string};
  Splash: undefined;
  Activity: {id: string; name: string};
};
const Stack = createStackNavigator<StackParams>();

const App = (props: any) => {
  const {oAuthUser} = props;
  const email = oAuthUser?.attributes?.email;

  return (
    <NavigationContainer
      linking={{
        prefixes: ['activitytracker://'],
        config: {
          screens: {
            Home: 'share/:activity/:userId',
          },
        },
      }}>
      <Stack.Navigator>
        {email ? (
          <>
            <Stack.Screen name="Home">
              {(props) => <Home {...props} email={email} />}
            </Stack.Screen>
            <Stack.Screen
              name="Activity"
              component={Activity}
              options={({route}) => ({
                title: route.params.name,
              })}></Stack.Screen>
          </>
        ) : (
          <Stack.Screen name="Splash" component={Splash} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default withOAuth(App);
