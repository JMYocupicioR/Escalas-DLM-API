// Avoid type issues with expo-router exports across versions
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Router: any = require('expo-router');
const Redirect = Router.Redirect || (() => null);

export default function App() {
  return <Redirect href="/landing" />;
}
