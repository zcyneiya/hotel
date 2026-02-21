import Reactotron from 'reactotron-react-native';

Reactotron
  .configure({
    name: 'Hotel App',
  })
  .useReactNative()
  .connect();

export default Reactotron;
