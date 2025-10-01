import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';

import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import NewSpentScreen from '../screens/NewSpentScreen';
import LendMoneyScreen from '../screens/LendScreen';
import BorrowedMoneyScreen from '../screens/BorrowedScreen';
import DepositScreen from '../screens/DepositScreen';
import CheckBalanceScreen from '../screens/CheckBalanceScreen';
import BalanceInputScreen from '../screens/BalanceInputScreen';
import HistoryScreen from '../screens/HistroyScreen';
import ProfileScreen from '../screens/ProfileScreen';
const Stack = createNativeStackNavigator();

export default function StackNavigator() {
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="Splash">
                <Stack.Screen name="Splash" component={SplashScreen} options={{ headerShown: false }} />
                <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
                <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
                <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
                <Stack.Screen
                    name="NewSpentMoney"
                    component={NewSpentScreen}
                    options={{ title: 'New Spent Money' }}
                />
            
                <Stack.Screen name="LendMoney" component={LendMoneyScreen} />
           
                <Stack.Screen name="BorrowedMoney" component={BorrowedMoneyScreen} />

                <Stack.Screen name="Deposit" component={DepositScreen} />
                <Stack.Screen name="balance" component={CheckBalanceScreen} />
                <Stack.Screen name="BalanceInput" component={BalanceInputScreen} />
                <Stack.Screen name="History" component={HistoryScreen} />
                <Stack.Screen name="Profile" component={ProfileScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
