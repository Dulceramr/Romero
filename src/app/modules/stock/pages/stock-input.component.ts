import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

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

  value: number = 0;
  private onChange: (value: number) => void = () => {};
  private onTouched: () => void = () => {};

  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = parseInt(input.value) || 0;
    
    value = Math.max(this.min, value);
    if (this.max !== null) {
      value = Math.min(this.max, value);
    }
    
    this.value = value;
    this.onChange(value);
    input.value = value.toString();
  }

  onBlur(): void {
    this.onTouched();
  }

  // ControlValueAccessor methods
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