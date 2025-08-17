import { Component, Input, forwardRef, HostBinding } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatFormFieldAppearance } from '@angular/material/form-field';

@Component({
  selector: 'app-stock-input',
  templateUrl: './stock-input.component.html',
  styleUrls: ['./stock-input.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => StockInputComponent),
      multi: true
    }
  ]
})

export class StockInputComponent implements ControlValueAccessor {
  @Input() min: number = 0;
  @Input() max: number | null = null;
  @Input() placeholder: string = '';
  @Input() disabled: boolean = false;
  @Input() appearance: MatFormFieldAppearance = 'outline';
  @Input() label: string = '';
  @Input() step: number = 1;
  @Input() hint: string = '';

  @HostBinding('class.error') get errorState() {
    return this.value < this.min || (this.max !== null && this.value > this.max);
  }

  value: number = 0;
  private onChange: (value: number) => void = () => {};
  private onTouched: () => void = () => {};

  increment(): void {
    this.updateValue(this.value + this.step);
  }

  decrement(): void {
    this.updateValue(this.value - this.step);
  }

   onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.updateValue(parseInt(input.value) || 0);
  }

  private updateValue(newValue: number): void {
    let value = Math.max(this.min, newValue);
    if (this.max !== null) {
      value = Math.min(this.max, value);
    }
    
    this.value = value;
    this.onChange(value);
  }

  onBlur(): void {
    this.onTouched();
  }

  writeValue(value: number): void {
    this.value = value || 0;
  }

  registerOnChange(fn: (value: number) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}