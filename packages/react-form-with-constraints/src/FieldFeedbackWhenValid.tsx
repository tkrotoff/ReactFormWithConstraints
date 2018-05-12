import React from 'react';
import PropTypes from 'prop-types';

import { FormWithConstraintsChildContext } from './FormWithConstraints';
import { FieldFeedbacksChildContext } from './FieldFeedbacks';
import { FieldFeedbackClasses } from './FieldFeedback';
import Field from './Field';

export interface FieldFeedbackWhenValidBaseProps {
}

export interface FieldFeedbackWhenValidProps extends FieldFeedbackWhenValidBaseProps, FieldFeedbackClasses, React.HTMLAttributes<HTMLSpanElement> {
}

export interface FieldFeedbackWhenValidState {
  fieldIsValid: boolean | undefined;
}

export type FieldFeedbackWhenValidContext = FormWithConstraintsChildContext & FieldFeedbacksChildContext;

export class FieldFeedbackWhenValid<Props extends FieldFeedbackWhenValidBaseProps = FieldFeedbackWhenValidProps>
       extends React.Component<Props, FieldFeedbackWhenValidState> {
  static contextTypes: React.ValidationMap<FieldFeedbackWhenValidContext> = {
    form: PropTypes.object.isRequired,
    fieldFeedbacks: PropTypes.object.isRequired
  };
  context!: FieldFeedbackWhenValidContext;

  constructor(props: Props) {
    super(props);

    this.state = {
      fieldIsValid: undefined
    };

    this.fieldWillValidate = this.fieldWillValidate.bind(this);
    this.fieldDidValidate = this.fieldDidValidate.bind(this);
    this.reset = this.reset.bind(this);
  }

  componentWillMount() {
    const { form } = this.context;

    form.addFieldWillValidateEventListener(this.fieldWillValidate);
    form.addFieldDidValidateEventListener(this.fieldDidValidate);
    form.addResetEventListener(this.reset);
  }

  componentWillUnmount() {
    const { form } = this.context;

    form.removeFieldWillValidateEventListener(this.fieldWillValidate);
    form.removeFieldDidValidateEventListener(this.fieldDidValidate);
    form.removeResetEventListener(this.reset);
  }

  fieldWillValidate(fieldName: string) {
    if (fieldName === this.context.fieldFeedbacks.fieldName) { // Ignore the event if it's not for us
      this.setState({fieldIsValid: undefined});
    }
  }

  fieldDidValidate(field: Field) {
    if (field.name === this.context.fieldFeedbacks.fieldName) { // Ignore the event if it's not for us
      this.setState({fieldIsValid: field.isValid()});
    }
  }

  reset() {
    this.setState({fieldIsValid: undefined});
  }

  // Don't forget to update native/FieldFeedbackWhenValid.render()
  render() {
    const { style, ...otherProps } = this.props as FieldFeedbackWhenValidProps;

    return this.state.fieldIsValid ?
      // <span style="display: block"> instead of <div> so FieldFeedbackWhenValid can be wrapped inside a <p>
      // otherProps before className because otherProps contains data-feedback
      <span {...otherProps} style={{display: 'block', ...style}} />
      : null;
  }
}
