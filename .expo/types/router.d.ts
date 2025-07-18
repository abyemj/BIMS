/* eslint-disable */
import * as Router from 'expo-router';

export * from 'expo-router';

declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface __routes<T extends string = string> extends Record<string, unknown> {
      StaticRoutes: `/` | `/(auth)` | `/(auth)/login` | `/(tabs)` | `/(tabs)/dashboard` | `/(tabs)/documents` | `/(tabs)/meetings` | `/(tabs)/profile` | `/(tabs)/reports` | `/(tabs)/users` | `/_sitemap` | `/dashboard` | `/documents` | `/login` | `/meetings` | `/profile` | `/reports` | `/users`;
      DynamicRoutes: never;
      DynamicRouteTemplate: never;
    }
  }
}
