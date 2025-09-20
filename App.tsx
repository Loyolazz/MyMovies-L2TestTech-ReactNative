import './src/setup/fontPolyfill';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MoviesProvider } from './src/context/MoviesContext';
import { CatalogScreen } from './src/screens/CatalogScreen';
import { PersonalScreen } from './src/screens/PersonalScreen';
import { theme } from './src/theme';

const Tab = createBottomTabNavigator();

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: theme.colors.primary,
    background: theme.colors.background,
    card: theme.colors.card,
    text: theme.colors.text,
    border: theme.colors.border,
  },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <MoviesProvider>
        <NavigationContainer theme={navigationTheme}>
          <StatusBar style="light" />
          <Tab.Navigator
            screenOptions={({ route }) => ({
              headerShown: false,
              tabBarShowLabel: true,
              tabBarActiveTintColor: theme.colors.primary,
              tabBarInactiveTintColor: theme.colors.textSecondary,
              tabBarStyle: {
                backgroundColor: '#ffffff',
                borderTopWidth: 0,
                height: 72,
                paddingBottom: 12,
                paddingTop: 8,
                marginHorizontal: theme.spacing.md,
                marginBottom: theme.spacing.md,
                borderRadius: 24,
                position: 'absolute',
                shadowColor: '#000000',
                shadowOpacity: 0.08,
                shadowOffset: { width: 0, height: 4 },
                shadowRadius: 20,
                elevation: 6,
              },
              tabBarLabelStyle: {
                fontSize: 12,
                fontWeight: '600',
              },
              tabBarIcon: ({ color, size }) => {
                const iconName = route.name === 'Catalogo' ? 'film-outline' : 'albums-outline';
                if (route.name === 'Meus filmes') {
                  return <Ionicons name="checkbox-outline" size={size} color={color} />;
                }
                return <Ionicons name={iconName as keyof typeof Ionicons.glyphMap} size={size} color={color} />;
              },
            })}
          >
            <Tab.Screen
              name="Catalogo"
              component={CatalogScreen}
              options={{ tabBarLabel: 'Catálogo' }}
            />
            <Tab.Screen
              name="Meus filmes"
              component={PersonalScreen}
              options={{ tabBarLabel: 'Meus filmes' }}
            />
          </Tab.Navigator>
        </NavigationContainer>
      </MoviesProvider>
    </SafeAreaProvider>
  );
}
