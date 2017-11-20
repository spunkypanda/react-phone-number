import React from 'react';
import { render } from 'react-dom';
import PhoneNumber from './PhoneNumber';

const styles = {
  fontFamily: 'sans-serif',
  textAlign: 'center',
};


const logInputChange = (data) => {
  console.log(data.formattedNumber);
}

const App = () => (
  <div style={styles}>
    <PhoneNumber
      countryCode='CA'
      // showCountrySelect
      onChange={logInputChange}
    />
  </div>
);

render(<App />, document.getElementById('root'));
