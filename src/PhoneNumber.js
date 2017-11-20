import React from 'react';
import styled, { keyframes } from 'styled-components'; // eslint-disable-line no-unused-vars
import {
  FormControl,
} from 'react-bootstrap';

import {
  PhoneNumberUtil,
  PhoneNumberFormat,
} from 'google-libphonenumber';

const StyledCountryInput = styled.select`
  height: 34px;
  min-width: 120px;
  max-width: 120px;
  padding: 6px 12px;
  background: #FFF;
  border: 1px solid #CCC;
  color: #555;
  // border-right: 0px solid #CCC;
  box-shadow: inset 0 1px 1px rgba(0,0,0,.075);
  border-top-left-radius: 4px !important;
  border-bottom-left-radius: 4px !important;
  border-top-right-radius: 0px !important;
  border-bottom-right-radius: 0px !important;
  margin-right: 6px;
  
`;

// eslint-disable-next-line no-unused-vars
const slidein = keyframes`
from {
  margin-top: 5%;
  // width: 100%;
}

to {
  margin-top: 0%;
  // width: 100%;
}
`;

const StyledFlag = styled.div`
  background: lightgrey;
  margin-right: 10px;
  // height: 35px;
  width: 46px;
  padding: 1px;
  border-radius: 2px;
  overflow: hidden;
  //box-shadow: 0px 0px 1px darkgrey;
  box-shadow: 0px 0px 1px ${props => props.shadow};
  transition: width 2s, height 2s, transform 2s;
  transform: rotate(360);
  // animation: fade 1s ease-in;
`;

const StyledCodeInput = styled(FormControl)`
  margin-right: 10px;
  width: 60px;
`;

const StyledDiv = styled.div`
  display: flex;
  input[type=number]::-webkit-inner-spin-button, 
  input[type=number]::-webkit-outer-spin-button { 
    -webkit-appearance: none; 
    margin: 0; 
  }
`;

const StyledNumberInput = styled.input`
  height: 34px;
  padding: 6px 12px;
  // background: #FFF;
  background: #FFF;
  border: 1px solid #CCC;
  color: #555;
  box-shadow: inset 0 0px 1px rgba(0,0,0,.075);
  border-radius: 4px;
  // box-shadow: 0px 0px 5px ${props => props.valid ? 'green' : 'red'};
`;

class PhoneNumberInput extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      diallingCode: '',
      number: '',
      valid: false,
      // flagUrl: 'https://raw.githubusercontent.com/emcrisostomo/flags/master/png/256/IN.png',
    };
    this.onChangeNumber = this.onChangeNumber.bind(this);
    this.onChangeCode = this.onChangeCode.bind(this);
    this.isNumberValid = this.isNumberValid.bind(this);
    this.relayStateChange = this.relayStateChange.bind(this);
    this.setImagePropsLoadedAsFalse = this.setImagePropsLoadedAsFalse.bind(this);
  }

  componentDidMount() {
    const { countryCode } = this.props;
    // eslint-disable-next-line react/no-did-mount-set-state
    this.setState({
      countryCode,
    });
  }

  componentWillReceiveProps(nextProps) {
    const { countryCode } = nextProps;
    this.setState({
      countryCode,
    });
  }

  onChangeCode(event) {
    const { value } = event.target;
    const { codes } = this.props;
    const { number, formattedNumber, valid } = this.state;
    let validNumber = valid;
    const diallingCode = Array.isArray(codes) ? (
      codes
        .find(item => item.code === value)
        .diallingCode
      ) : '91';

    const invalidPattern = /[^0123456789+]/g;
    const maxLength = String(diallingCode).length > 3;
    const validCode = invalidPattern.test(diallingCode) || maxLength;
    if (validCode) return;
    this.setState({
      imageLoading: true,
      countryCode: value,
      diallingCode,
      flagUrl: `https://raw.githubusercontent.com/emcrisostomo/flags/master/png/256/${value}.png`,
    });

    if (diallingCode && number && formattedNumber) {
      validNumber = this.isNumberValid(diallingCode, value, (number || ''));
      this.setState({
        imageLoading: false,
        valid: validNumber,
      });
      this.relayStateChange(diallingCode, number, value, formattedNumber, valid);
    }

    setTimeout(() => this.setImagePropsLoadedAsFalse(), 500);
  }

  onChangeNumber(event) {
    const { diallingCode, countryCode } = this.state;
    const { name, value } = event.target;
    let formattedNumber = String(value);
    let valid = false;
    if (formattedNumber.length > 10) {
      return;
    }

    if (formattedNumber.length >= 5) {
      const phoneUtil = PhoneNumberUtil.getInstance();
      const phoneNumber = phoneUtil.parse(value, 'IN');
      formattedNumber = phoneUtil.format(phoneNumber, PhoneNumberFormat.INTERNATIONAL);
    }

    try {
      valid = this.isNumberValid(diallingCode, countryCode, value);
    } catch (err) {
      console.warn('ERROR :: ', err.message); // eslint-disable-line no-console
    }
    this.setState({
      [name]: value,
      formattedNumber,
      valid,
    });
    this.relayStateChange(diallingCode, value, countryCode, formattedNumber, valid);
  }

  setImagePropsLoadedAsFalse() {
    this.setState({ imageLoading: false });
  }

  relayStateChange(diallingCode, number, countryCode, formattedNumber, valid) {
    const { onChange } = this.props;
    const data = {
      diallingCode,
      number,
      countryCode,
      formattedNumber,
      valid,
    };
    if (typeof onChange === 'function') {
      onChange(data);
    }
  }

  isNumberValid(diallingCode, countryCode, number) {
    const Utils = PhoneNumberUtil.getInstance();
    const PhoneNum = Utils.parseAndKeepRawInput(String(number), countryCode);
    return Utils.isValidNumberForRegion(PhoneNum, countryCode);
  }

  renderCountrySelection(showCountrySelect) {
    const { diallingCode, number, countryCode, formattedNumber, flagUrl } = this.state; // eslint-disable-line
    const { countries } = this.props;
    // const { imageLoading } = this.state;
    if (!showCountrySelect) return null;
    return (
      <div>
        <StyledFlag
          shadow="black"
        >
          <img
            style={{
              borderRadius: '2px',
            }}
            width={44}
            height={33}
            src={flagUrl}
            alt=""
          />
        </StyledFlag>

        <StyledCountryInput
          name="country"
          value={countryCode}
          text="string"
          onChange={this.onChangeCode}
        >
          <option value="100001"> Country</option>
          {
            countries.map(item => (<option value={item.code}>{item.name}</option>))
          }
        </StyledCountryInput>

        <StyledCodeInput
          name="diallingCode"
          value={diallingCode}
          type="text"
          placeholder="Code"
        />
      </div>
    );
  }

  render() {
    const { number, countryCode } = this.state;
    const { showCountrySelect } = this.props;

    return (
      <div>
        <StyledDiv>
          {
            this.renderCountrySelection(showCountrySelect)
          }
          <StyledNumberInput
            name="number"
            value={number}
            type="number"
            disabled={!countryCode}
            placeholder="Number"
            onChange={this.onChangeNumber}
          />
        </StyledDiv>
        <br />
      </div>
    );
  }
}

PhoneNumberInput.defaultProps = {
  countries: [
    {
      code: 'CA',
      name: 'Canada',
      diallingCode: '1',
    },
    {
      code: 'IN',
      name: 'India',
      diallingCode: '1',
    },
    {
      code: 'PK',
      name: 'Pakistan',
      diallingCode: '92',
    },
    {
      code: 'LK',
      name: 'Sri Lanka',
      diallingCode: '94',
    },
    {
      code: 'BD',
      name: 'Bangladesh',
      diallingCode: '93',
    },
  ],
  showCountrySelect: false,
  countryCode: null,
};

export default PhoneNumberInput;
