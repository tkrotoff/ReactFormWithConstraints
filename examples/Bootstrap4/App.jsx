// @ts-check

import '@babel/polyfill';
import 'raf/polyfill';

import React from 'react';
import ReactDOM from 'react-dom';
import { isEqual, omit } from 'lodash-es';

import { FormWithConstraints, Input, FieldFeedbacks, Async, FieldFeedback } from 'react-form-with-constraints-bootstrap4';
import { DisplayFields } from 'react-form-with-constraints-tools';

import './index.html';
import './App.scss';

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const checkUsernameAvailability = async value => {
  console.log('checkUsernameAvailability');
  await sleep(1000);
  return !['john', 'paul', 'george', 'ringo'].includes(value.toLowerCase());
};

class Form extends React.Component {
  state = this.getInitialState();

  getInitialState() {
    return {
      username: '',
      password: '',
      passwordConfirm: '',
      signUpButtonDisabled: false,
      resetButtonDisabled: true
    };
  }

  shouldDisableResetButton(state) {
    const omitList = ['signUpButtonDisabled', 'resetButtonDisabled'];
    return isEqual(omit(this.getInitialState(), omitList), omit(state, omitList)) && !this.form.hasFeedbacks();
  }

  handleChange = async e => {
    const target = e.target;

    this.setState({
      [target.name]: target.value
    });

    await this.form.validateFields(target);

    this.setState(prevState => ({
      signUpButtonDisabled: !this.form.isValid(),
      resetButtonDisabled: this.shouldDisableResetButton(prevState)
    }));
  }

  handlePasswordChange = async e => {
    const target = e.target;

    this.setState({
      [target.name]: target.value
    });

    await this.form.validateFields(target, 'passwordConfirm');

    this.setState(prevState => ({
      signUpButtonDisabled: !this.form.isValid(),
      resetButtonDisabled: this.shouldDisableResetButton(prevState)
    }));
  }

  handleSubmit = async e => {
    e.preventDefault();

    await this.form.validateForm();
    const formIsValid = this.form.isValid();

    this.setState(prevState => ({
      signUpButtonDisabled: !formIsValid,
      resetButtonDisabled: this.shouldDisableResetButton(prevState)
    }));

    if (formIsValid) {
      alert(`Valid form\n\nthis.state =\n${JSON.stringify(this.state, null, 2)}`);
    }
  }

  handleReset = () => {
    this.setState(this.getInitialState());
    this.form.resetFields();
    this.setState({resetButtonDisabled: true});
  }

  render() {
    const { username, password, passwordConfirm, signUpButtonDisabled, resetButtonDisabled } = this.state;

    return (
      <FormWithConstraints ref={formWithConstraints => this.form = formWithConstraints}
                           onSubmit={this.handleSubmit} noValidate>
        <div className="form-group">
          <label htmlFor="username">Username <small>(already taken: john, paul, george, ringo)</small></label>
          <Input id="username" name="username"
                 value={username} onChange={this.handleChange}
                 required minLength={3}
                 className="form-control" />
          <span className="input-state" />
          <FieldFeedbacks for="username">
            <FieldFeedback when="tooShort">Too short</FieldFeedback>
            <FieldFeedback when="*" />
            <Async
              promise={checkUsernameAvailability}
              pending={<span className="d-block">...</span>}
              then={available => available ?
                <FieldFeedback key="1" info style={{color: '#28a745'}}>Username available</FieldFeedback> :
                <FieldFeedback key="2">Username already taken, choose another</FieldFeedback>
              }
            />
            <FieldFeedback when="valid">Looks good!</FieldFeedback>
          </FieldFeedbacks>
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <Input type="password" id="password" name="password"
                 innerRef={_password => this.password = _password}
                 value={password} onChange={this.handlePasswordChange}
                 required pattern=".{5,}"
                 className="form-control" />
          <FieldFeedbacks for="password">
            <FieldFeedback when="valueMissing" />
            <FieldFeedback when="patternMismatch">Should be at least 5 characters long</FieldFeedback>
            <FieldFeedback when={value => !/\d/.test(value)} warning>Should contain numbers</FieldFeedback>
            <FieldFeedback when={value => !/[a-z]/.test(value)} warning>Should contain small letters</FieldFeedback>
            <FieldFeedback when={value => !/[A-Z]/.test(value)} warning>Should contain capital letters</FieldFeedback>
            <FieldFeedback when={value => !/\W/.test(value)} warning>Should contain special characters</FieldFeedback>
            <FieldFeedback when="valid">Looks good!</FieldFeedback>
          </FieldFeedbacks>
        </div>

        <div className="form-group">
          <label htmlFor="password-confirm">Confirm Password</label>
          <Input type="password" id="password-confirm" name="passwordConfirm"
                 value={passwordConfirm} onChange={this.handleChange}
                 required className="form-control" />
          <FieldFeedbacks for="passwordConfirm">
            <FieldFeedback when="*" />
            <FieldFeedback when={value => value !== this.password.value}>Not the same password</FieldFeedback>
            <FieldFeedback when="valid">Looks good!</FieldFeedback>
          </FieldFeedbacks>
        </div>

        <button disabled={signUpButtonDisabled} className="btn btn-primary">Sign Up</button>{' '}
        <button type="button" onClick={this.handleReset} disabled={resetButtonDisabled} className="btn btn-secondary">Reset</button>

        <DisplayFields />
      </FormWithConstraints>
    );
  }
}

const App = () => (
  <div className="container">
    <p>
      Inspired by <a href="http://moduscreate.com/reactjs-form-validation-approaches/">Modus Create - ReactJS Form Validation Approaches</a>
      <br />
      Fixed version: <a href="https://codepen.io/tkrotoff/pen/MEeNvO">https://codepen.io/tkrotoff/pen/MEeNvO</a>
    </p>
    <Form />
  </div>
);

ReactDOM.render(<App />, document.getElementById('app'));
