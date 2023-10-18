/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Number slider input field.
 * @author kozbial@google.com (Monica Kozbial)
 */

import * as Blockly from 'blockly/core'
import {
  FieldNumberConfig,
  FieldNumberValidator,
} from 'blockly/core/field_number'
import { isTouchDevice } from '../helper/isTouchDevice'

/**
 * A config object for defining a field slider.
 */
export type FieldSliderConfig = FieldNumberConfig

/**
 * Options used to define a field slider from JSON.
 */
export interface FieldSliderOptions extends FieldSliderConfig {
  value?: string | number
}

export type FieldSliderValidator = FieldNumberValidator

/**
 * Slider field.
 */
export class FieldSlider extends Blockly.FieldNumber {
  /**
   * Array holding info needed to unbind events.
   * Used for disposing.
   * Ex: [[node, name, func], [node, name, func]].
   */
  private boundEvents: Blockly.browserEvents.Data[] = []

  /**
   * The HTML range input element.
   */
  private sliderInput: HTMLInputElement | null = null

  private offset = 0
  private useOffset = false

  private displaySpan: HTMLSpanElement | null = null

  /**
   * Class for an number slider field.
   * @param value The initial value of the field. Should
   *    cast to a number. Defaults to 0.
   * @param min Minimum value.
   * @param max Maximum value.
   * @param precision Precision for value.
   * @param validator A function that is called to validate
   *    changes to the field's value. Takes in a number & returns a validated
   *    number, or null to abort the change.`
   * @param config A map of options used to configure the field.
   *    See the [field creation documentation]{@link
   * https://developers.google.com/blockly/guides/create-custom-blocks/fields/built-in-fields/number#creation}
   *    for a list of properties this parameter supports.
   */
  constructor(
    value?: string | number,
    min?: string | number,
    max?: string | number,
    precision?: string | number,
    validator?: FieldSliderValidator,
    config?: FieldSliderConfig
  ) {
    super(value, min, max, precision, validator, config)
  }

  /**
   * Constructs a FieldSlider from a JSON arg object.
   * @param options A JSON object with options (value, min, max, and
   *                          precision).
   * @return The new field instance.
   * @package
   * @nocollapse
   */
  static fromJson(options: FieldSliderOptions): FieldSlider {
    return new FieldSlider(
      options.value,
      undefined,
      undefined,
      undefined,
      undefined,
      options
    )
  }

  /**
   * Show the inline free-text editor on top of the text along with the slider
   *    editor.
   * @param e Optional mouse event that triggered the field to
   *     open, or undefined if triggered programmatically.
   * @param quietInput Quiet input (prevent focusing on the editor).
   */
  protected showEditor_(e?: Event, quietInput?: boolean) {
    // Always quiet the input for the super constructor, as we don't want to
    // focus on the text field, and we don't want to display the modal
    // editor on mobile devices.

    // FIX: quiet input only if triggered by touch
    // If it's a pointerup by a mouse, focus
    const isMouse = e && (e as any).pointerType === 'mouse'

    if (isMouse) {
      super.showEditor_(e, false)
    } else {
      super.showEditor_(e, true)
    }

    // Build the DOM.
    const editor = this.dropdownCreate_()

    Blockly.DropDownDiv.getContentDiv().appendChild(editor)

    const sourceBlock = this.getSourceBlock() as Blockly.BlockSvg

    const primary = sourceBlock.getColour() || ''
    const tertiary = sourceBlock.getColourTertiary() || ''
    Blockly.DropDownDiv.setColour(primary, tertiary)

    Blockly.DropDownDiv.showPositionedByField(
      this,
      this.dropdownDispose_.bind(this)
    )

    // Focus on the slider field, unless quietInput is passed.
    // NOTE: not working atm, and not needed
    /*if (!quietInput) {
      ;(editor.firstChild as HTMLInputElement).focus({
        preventScroll: true,
      })
    }*/
  }

  /**
   * Updates the slider when the field rerenders.
   */
  protected render_() {
    super.render_()
    this.updateSlider_()
  }

  /**
   * Creates the slider editor and add event listeners.
   * @return The newly created slider.
   */
  private dropdownCreate_(): HTMLElement {
    const me = this

    const wrapper = document.createElement('div')
    wrapper.className = 'fieldSliderContainer'

    const sliderInput = document.createElement('input')
    sliderInput.setAttribute('type', 'range')
    sliderInput.setAttribute('min', `${this.max_ == Infinity ? 1 : this.min_}`)
    sliderInput.setAttribute('max', `${this.max_ == Infinity ? 10 : this.max_}`)
    sliderInput.setAttribute('step', `${this.precision_}`)
    sliderInput.setAttribute('value', this.getValue()?.toString() ?? '0')
    sliderInput.setAttribute('tabindex', '0')
    sliderInput.className = 'fieldSlider'
    wrapper.appendChild(sliderInput)
    this.sliderInput = sliderInput

    this.boundEvents.push(
      Blockly.browserEvents.conditionalBind(
        sliderInput,
        'input',
        this,
        this.onSliderChange_
      )
    )

    if (this.max_ == Infinity) {
      this.useOffset = true
      const outerWrapper = document.createElement('div')
      outerWrapper.appendChild(wrapper)

      const buttonWrapper = document.createElement('div')
      buttonWrapper.className = 'flex justify-between'

      const minusSpan = document.createElement('span')
      const buttonMinus = document.createElement('button')
      buttonMinus.innerHTML = '-10'
      buttonMinus.onclick = () => {
        if (me.offset >= 10) {
          me.offset -= 10
          me.onSliderChange_()
        }
      }
      minusSpan.appendChild(buttonMinus)
      buttonWrapper.appendChild(minusSpan)

      const span = document.createElement('span')
      span.innerHTML = `${me.offset + 1} - ${me.offset + 10}`
      span.className = 'mx-2 bg-white/60 rounded px-1'
      buttonWrapper.appendChild(span)
      this.displaySpan = span

      const plusspan = document.createElement('span')
      const buttonPlus = document.createElement('button')
      buttonPlus.innerHTML = '+10'
      buttonPlus.onclick = () => {
        me.offset += 10
        me.onSliderChange_()
      }
      plusspan.appendChild(buttonPlus)
      buttonWrapper.appendChild(plusspan)
      outerWrapper.appendChild(buttonWrapper)

      const style =
        /*
      <div className={"*/ 'bg-white/30 rounded px-2' /*"}/>*/
      plusspan.className = style
      minusSpan.className = style

      return outerWrapper
    }

    return wrapper
  }

  /**
   * Disposes of events belonging to the slider editor.
   */
  private dropdownDispose_() {
    for (const event of this.boundEvents) {
      Blockly.browserEvents.unbind(event)
    }
    this.boundEvents.length = 0
    this.sliderInput = null
  }

  /**
   * Sets the text to match the slider's position.
   */
  private onSliderChange_() {
    this.setEditorValue_(parseInt(this.sliderInput?.value!) + this.offset)
    this.resizeEditor_()
  }

  /**
   * Updates the slider when the field rerenders.
   */
  private updateSlider_() {
    if (!this.sliderInput || !this.displaySpan) {
      return
    }
    if (this.useOffset) {
      const expectedOffset =
        Math.floor((parseInt(this.getValue()?.toString() ?? '0') - 1) / 10) * 10

      if (expectedOffset != this.offset) {
        this.offset = Math.max(0, expectedOffset)
      }
    }
    this.sliderInput.setAttribute(
      'value',
      `${parseInt(this.getValue()?.toString() ?? '0') - this.offset}`
    )
    this.displaySpan.innerHTML = `${this.offset + 1} - ${this.offset + 10}`
  }
}

try {
  Blockly.fieldRegistry.register('field_number_slider', FieldSlider)
} catch (e) {}

/**
 * CSS for slider field.
 */
Blockly.Css.register(`
.fieldSliderContainer {
  align-items: center;
  display: flex;
  height: 32px;
  justify-content: center;
  width: 200px;
}
.fieldSlider {
  -webkit-appearance: none;
  background: transparent; /* override white in chrome */
  margin: 4px;
  padding: 0;
  width: 100%;
}
.fieldSlider:focus {
  outline: none;
}
/* Webkit */
.fieldSlider::-webkit-slider-runnable-track {
  background: #ddd;
  border-radius: 5px;
  height: 10px;
}
.fieldSlider::-webkit-slider-thumb {
  -webkit-appearance: none;
  background: #fff;
  border-radius: 50%;
  box-shadow: 0 0 0 4px rgba(255,255,255,.15);
  cursor: pointer;
  height: 24px;
  margin-top: -7px;
  width: 24px;
}
/* Firefox */
.fieldSlider::-moz-range-track {
  background: #ddd;
  border-radius: 5px;
  height: 10px;
}
.fieldSlider::-moz-range-thumb {
  background: #fff;
  border: none;
  border-radius: 50%;
  box-shadow: 0 0 0 4px rgba(255,255,255,.15);
  cursor: pointer;
  height: 24px;
  width: 24px;
}
.fieldSlider::-moz-focus-outer {
  /* override the focus border style */
  border: 0;
}
/* IE */
.fieldSlider::-ms-track {
  /* IE wont let the thumb overflow the track, so fake it */
  background: transparent;
  border-color: transparent;
  border-width: 15px 0;
  /* remove default tick marks */
  color: transparent;
  height: 10px;
  width: 100%;
  margin: -4px 0;
}
.fieldSlider::-ms-fill-lower  {
  background: #ddd;
  border-radius: 5px;
}
.fieldSlider::-ms-fill-upper  {
  background: #ddd;
  border-radius: 5px;
}
.fieldSlider::-ms-thumb {
  background: #fff;
  border: none;
  border-radius: 50%;
  box-shadow: 0 0 0 4px rgba(255,255,255,.15);
  cursor: pointer;
  height: 24px;
  width: 24px;
}
`)
