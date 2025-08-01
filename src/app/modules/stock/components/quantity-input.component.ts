import { Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-quantity-input',
  templateUrl: './quantity-input.component.html',
  styleUrls: ['./quantity-input.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => QuantityInputComponent),
      multi: true,
    },
  ],
})
export class QuantityInputComponent implements ControlValueAccessor {
  @Input() step = 1;

  quantity = 0;
  isDisabled = false;

  private onChange: (value: number) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: number): void {
    this.quantity = value || 0;
  }

  registerOnChange(fn: (value: number) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  increment(): void {
    if (!this.isDisabled) {
      this.quantity += this.step;
      this.onChange(this.quantity);
      this.onTouched();
    }
  }

  decrement(): void {
    if (!this.isDisabled && this.quantity > 0) {
      this.quantity -= this.step;
      this.onChange(this.quantity);
      this.onTouched();
    }
  }

  onQuantityChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.valueAsNumber;
    if (!isNaN(value)) {
      this.quantity = value;
      this.onChange(this.quantity);
      this.onTouched();
    }
  }
}